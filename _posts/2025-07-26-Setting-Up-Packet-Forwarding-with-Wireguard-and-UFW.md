---
layout: default
title:  "Setting up Packet Forwarding with WireGuard and UFW"
date:   2025-08-04 18:44:19 -0400
categories: networking
---

For a personal project, I was trying to configure the firewall on my Raspberry Pi
to work with my Wireguard VPN server. After some failures with modifying the
default configurations, I decided it would be better to learn a little bit about
how the linux firewall works and write the configurations from scratch myself.

## Background
I had a [PiVPN](https://www.pivpn.io/) server set up on my local network for packet
forwarding. PiVPN is a wonderful application - it simplifies the whole setup process for
a local [WireGuard](https://www.wireguard.com/) VPN network. I highly recommend it.
I, however, broke something with
my VPN configuration. I'm not exactly sure what I did, but I had tried to add some
other firewall rules and a few things stopped working. I tried to reinstall while still retaining
my configurations, but that did not fix the problem. I could have cleared all my original
configurations and started over, but instead I decided that it was time to finally learn
how to use UFW and iptables rules.

## Why do I have a VPN, anyway? And what isn't working about it?
One of the reasons I had PiVPN set up was so I could access a web server on my local
network without exposing it directly to the internet. I can just install WireGuard on
my phone and laptop and then access the webserver from anywhere. I had this all set up
and working with port forwarding for the WireGuard port on my router and everything else.

Some background on WireGuard: it's a fairly minimal VPN protocol. It sets up point-to-point
connections between peer hosts. In the case of PiVPN, you have one central server (e.g.,
a Raspberry Pi) that peers with every device you want on the VPN and it is configured
to do packet forwarding between the hosts on the network. The packet forwarding is handled
separately from WireGuard (by linux in this case).

This normally works great.
The problem arose when I tried to access a local service by its IPv6 address. I couldn't
reach it! I could use the IPv4 address, but not the IPv6 address. My first thought was that
maybe something was configured wrong with my web
server and it was not listening on IPv6. So I ran `tcpdump` to see if the packets
were making it to the server and the logs looked something like this:
```
11:55:04.476233 IP6 fd1e:c3d7:1f18::1.63853 > c5a4:3509:115b:e595:9554:f790:969d:040b.https: Flags [.], ...
11:55:04.476242 IP6 fd1e:c3d7:1f18::1.63853 > c5a4:3509:115b:e595:9554:f790:969d:040b.https: Flags [.], ...
11:55:04.476243 IP6 fd1e:c3d7:1f18::1.63853 > c5a4:3509:115b:e595:9554:f790:969d:040b.https: Flags [.], ...
11:55:04.477342 IP6 fd1e:c3d7:1f18::1.63853 > c5a4:3509:115b:e595:9554:f790:969d:040b.https: Flags [.], ...
```
(These aren't my real addresses, but for the sake of this blog, `c5a4:3509:115b:e595:9554:f790:969d:040b` is the IPv6 address of my web server, and `fd1e:c3d7:1f18::1` is the address of my phone *on the WireGuard
network*.)

There's something weird about these packets. "What?" you might ask. "Isn't it receiving the IPv6 packets?
Indeed it is. *However,* my web server isn't on the VPN network. It has no idea how to
reach `fd1e:c3d7:1f18::1`, the source address of the requests, because it's not on a machine that's connected
to WireGuard! So while it was *receiving* the connection packets from my phone, it had no
way to reply! If I tried to connect over IPv4, everything worked as expected: the "from" address showed up
as my VPN server's IP address where the packets are forwarded from, so the web server was able to reply to
my VPN server and the VPN server was able to forward the reply back to my phone through WireGuard.

The VPN server is supposed to replace the "from" address on the packets from my phone with its own address
so the receiving server knows where to reply to. The VPN server can then track connections to know who
to forward replies back to on the VPN side. The web server just thinks it's talking to my Raspberry Pi,
and my Raspberry Pi handles all the packet shuffling. This is a type of Network Address
Translation, or NAT for short. It's what your router does to mitigate the IPv4 address exhaustion problem.
Obviously it was working for IPv4, but not IPv6! Why? Well, clearly there's something wrong with the
NAT configuration on my VPN server that needs fixing.

## Setting up Packet Forwarding for IPv6 (and IPv4)
### Getting Started

I decided that I would start from a clean slate for my firewall management. I uninstalled PiVPN and everything
firewall related, then reinstalled UFW (Uncomplicated Firewall). I set up PiVPN, restored my original
configurations, and then cleared all firewall settings it put into place. (I can't say I *recommend* doing it
this way, but this is the way that I did it. I believe my problem was that when I was restoring the
PiVPN settings, I was also restoring some broken ufw configurations that were causing my issues. But this blog
is really about what I learned about setting up SNAT with UFW, not why I did it.) From this clean slate, I
began.

### Allowing SSH and WireGuard through
The first thing you want to do before enabling UFW is to allow WireGuard and any other services you want
through (e.g., SSH if you access your device directly over SSH). In my case, I wanted to allow inbound
connections to SSH (TCP port 22) and WireGuard (which I have configured on UDP port 51820):
```bash
sudo ufw allow 22/tcp
sudo ufw allow 51820/udp
```

Once you've done this, you can enable the firewall (**IMPORTANT:** this *will* knock out any SSH connections you have if you haven't allowed SSH through. *And then you'll have to drag a monitor and keyboard over to your headless raspberry pi to turn off the firewall again for the ***third*** time you've done this. Pay attention and don't block out your SSH!*):
```
sudo ufw enable
```

### Allowing Packet Forwarding in the Kernel
The next thing that needs to be done is to enable packet forwarding so that the kernel will forward packets
coming in on the wireguard interface that are destined for other hosts.
To do this, edit `/etc/ufw/sysctl.conf`. For IPv4, you need to add the following line (or you can
uncomment it if it already exists):
```
net/ipv4/ip_forward=1
```
To enable packet forwarding for IPv6, there are multiple options. If you want to enable it for all
interfaces you can do:
```
net/ipv6/conf/all/forwarding=1
```
If you want to set packet forwarding as the default for *new* interfaces, you can do:
```
net/ipv6/conf/default/forwarding=1
```
*However*, what you *probably* want to do is only enable forwarding for packets coming from
the WireGuard interface. Assuming your WireGuard interface is called `wg0`, you would add this
line to `/etc/ufw/sysctl.conf`:
```
net/ipv6/conf/wg0/forwarding=1
```

Save the file. You may have to restart ufw for these changes to take effect:
```
sudo ufw reload
```

### Allowing Routing on the WireGuard Interface
Even though packet forwarding is now enabled, the firewall will still block it from happening. To fix this,
you need to allow packet forwarding to pass through the firewall (both IPv4 and IPv6) for the address
ranges and interfaces you what to allow this for. This
is as simple as issuing the following two commands (replacing the IPv4 / IPv6 subnets with your own WireGuard
subnets and `wg0` with your own WireGuard interface):
```bash
sudo ufw route allow in on wg0 from 10.123.45.0/24
sudo ufw route allow in on wg0 from fd1e:c3d7:1f18::/48
```

This allows routing (packet forwarding, which we enabled earlier) for packets coming in on interface
`wg0` (our WireGuard
interface) *from* any IP address on our WireGuard subnet *to* **any** address. You could constrain the
firewall rule further if you wanted to limit it to only certain IP addresses or destination interfaces.
For example, you could limit it to only allow routing to other devices on the WireGuard subnet or your
local network by limiting the *to* address (see the `ufw` man page for more details). But in my case, I
want devices on my WireGuard connection to be able to access the internet through my VPN server, so I
added no such constraints.

With just this, we should be able to access other devices on the WireGuard network (but not yet outside
the WireGuard network). I connected both my
phone and a computer to the WireGuard network and was able to ping them from each other. The VPN server
was forwarding packets between them!

### Setting up SNAT with UFW
Now that packet forwarding is enabled, we need to set up Source Network Address Translation so that
the source IP address of packets coming from the WireGuard network gets replaced with the IP address
of our WireGuard server. This is the real part that solves the IPv6 problem I was having that prompted
this journey. First, we'll do this for IPv4. Edit `/etc/ufw/before.rules` and add the following lines,
replacing `10.123.45.0/24` with your WireGuard subnet and `eth0` with your external network adapter interface.
```
# Enable packet masquerading (SNAT) for wg0
*nat
:POSTROUTING ACCEPT [0:0]
-I POSTROUTING -s 10.123.45.0/24 -o eth0 -j MASQUERADE -m comment --comment wireguard-nat-rule
COMMIT
```
Explanation:
 * `*nat`: we are adding rules to the NAT table
 * `:POSTROUTING ACCEPT [0:0]`
    * We are adding to the `POSTROUTING` chain, which modifies packets as they leave the network interface (in this case, applying the SNAT rule)
 * `-I POSTROUTING -s 10.123.45.0/24 -o eth0 -j MASQUERADE -m comment --comment wireguard-nat-rule`: Add the SNAT rule
    * `-I POSTROUTING`: insert the rule in the `POSTROUTING` chain, so it is applied as the
      packet is about to leave. Since no index is specified with `-I`, it's inserted at the start of
      the chain of rules.
    * `-s 10.123.45.0/24`: rule applies to packets with the specified source addresses (packets coming
      from our WireGuard subnet).
    * `-o eth0`: packets destined to go out the `eth0` interface (the only interface we need to SNAT
      packets for - if it's going from `wg0` to `wg0` that won't need SNATing).
    * `-j MASQUERADE`: Enable masquerading, which is a type of Source Network Address Translation.
    * `-m comment --comment wireguard-nat-rule`: Add a text comment to the rule (no effect on the rule itself)
 * `COMMIT`: commit the applied rules to the table (denotes the end of this set of rules for the
   NAT table).

NOTE: Make sure to put this outside any other `*table_name ... COMMIT` blocks in the file, or you will
get a syntax error.

Note that we explicitly specify the output adapter as `eth0`. We only need to apply SNAT to packets
destined for the internet. If a packet comes in and is destined for another device on the `wg0` interface,
for example, we wouldn't want to do any address translation - we can just forward the packets without
changing the source and destination IP addresses since all devices on the WireGuard network know they can
reach IP addresses on that subnet through the WireGuard tunnel (via the `AllowedIPs` WireGuard field).

We then edit `/etc/ufw/before6.rules` for IPv6 and do basically the same thing, but using our
IPv6 subnet instead:
```
# Enable packet masquerading (SNAT) for wg0
*nat
:POSTROUTING ACCEPT [0:0]
-I POSTROUTING -s fd1e:c3d7:1f18::/48 -o eth0 -j MASQUERADE -m comment --comment wireguard-nat-rule
COMMIT
```

After making these changes, you will need to reload `ufw`:
```
sudo ufw reload
```

Aside from fixing a few typos I had made, once I did this, my packet forwarding and SNAT worked! I at
last am able to access my locally hosted web server through my WireGuard network using IPv6 addresses!
Hopefully if you're trying to achieve the same thing, you'll have the same level of success.

Tip: one thing to check for when troubleshooting your ufw rules is syntax issues. If you run `sudo systemctl status ufw`, you will see an error if it failed to load the rules files.
