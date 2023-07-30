---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
show_description: true
title: '' # Mark as blank to use default of site.title
---

# Welcome

I write about technical things I find interesting or that I have done in the hopes that others can learn from it.
I am certainly no expert in everything I write about, and in fact I enjoy writing about figuring out things I know very little about, so don't assume everything I say is correct (not that you didn't know that already, browsing the internet). Some of my blogs may be styled like tutorials, while others are just my ramblings about some random thing I tried and how it didn't work and how I did (or did not) fix it. Some might not be blogs at all. I hope you enjoy.

{% assign posts = site.posts %}

{%- if posts.size > 0 -%}
  {%- if page.list_title -%}
    <h2>{{ page.list_title }}</h2>
  {%- endif -%}
  <ul class="post-list">
    {%- for post in posts -%}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
      <h3>
        <a class="post-link" href="{{ post.url | relative_url }}">
          {{ post.title | escape }}
        </a>
      </h3>
    {{ post.excerpt }}
    </li>
    {%- endfor -%}
  </ul>

  {% if site.paginate %}
    <div class="pager">
      <ul class="pagination">
      {%- if paginator.previous_page %}
        <li><a href="{{ paginator.previous_page_path | relative_url }}" class="previous-page">{{ paginator.previous_page }}</a></li>
      {%- else %}
        <li><div class="pager-edge">•</div></li>
      {%- endif %}
        <li><div class="current-page">{{ paginator.page }}</div></li>
      {%- if paginator.next_page %}
        <li><a href="{{ paginator.next_page_path | relative_url }}" class="next-page">{{ paginator.next_page }}</a></li>
      {%- else %}
        <li><div class="pager-edge">•</div></li>
      {%- endif %}
      </ul>
    </div>
  {%- endif %}

{%- endif -%}