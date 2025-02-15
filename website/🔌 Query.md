```meta
type: plug
uri: core:query
repo: https://github.com/silverbulletmd/silverbullet
author: Silver Bullet Authors
```

### 1. What?
The query plug is a built-in plug implementing the `<!-- #query -->` mechanism. You can use query plug to automatically receive information from your pages.

### 2. Syntax
1. _start with_: `<!-- #query [QUERY GOES HERE] -->`
2. _end with_: `<!-- /query -->`
3. _write your query_: replace `[QUERY GOES HERE]` with any query you want using options below
4. _available query options_: Usage of options is similar to SQL except special `render` option. Render option is to use display the data in a format that you created in a separate template.
   * `where`
   * `order by`
   * `limit`
   * `select`
   * `render`

P.S.: If you are a developer or have a technical knowledge to read a code and would like to know more about syntax, please check out [query grammar](https://github.com/silverbulletmd/silverbullet/blob/main/packages/plugs/query/query.grammar).

#### 2.1. Available query operators:
* `=` equals
* `!=` not equals
* `<` less than
* `<=` less than or equals
* `>` greater than
* `>=` greater than or equals
* `=~` to match against a regular expression
* `!=~` does not match this regular expression

Further, you can combine multiple of these with `and`. Example `prop =~ /something/ and prop != “something”`.

### 3. How to run a query?
After writing the query, there are three options:
* Open the **command palette** and run **Materialized Queries: Update**
* Use shortcut: hit **Alt-q** (Windows, Linux) or **Option-q** (Mac)
* Go to another page and come back to the page where query is located

After using one of the options, the “body” of the query is replaced with the new results of the query data will be displayed.

### 4. Data sources
Available data sources can be categorized as:
1. Builtin data sources
2. Data that can be inserted by users
3. Plug’s data sources

Best part about data sources: there is an auto completion. 🎉 

Start writing `<!— #query ` or simply use `/query` slash command, it will show you all available data sources. 🤯

#### 4.1. Available data sources
* `page`: list of all pages 📄
* `task`: list of all tasks created with `[]` syntax ✅
* `full-text`: use it with `where phrase = "SOME_TEXT"`. List of all pages where `SOME_TEXT` is mentioned ✍️
* `item`: list of ordered and unordered items such as bulleted lists ⏺️
* `tags`: list of all hashtags used in all pages ⚡
* `link`: list of all pages giving a link to the page where query is written 🔗
* `data`: You can insert a data using the syntax below 🖥️. You can query the data using `data` option. 
```data
name: John
age: 50
city: Milan
country: Italy
---
name: Jane
age: 53
city: Rome
country: Italy
---
name: Francesco
age: 28
city: Berlin
country: Germany
```
<!-- #query data where age > 20 and country = "Italy" -->
|name|age|city |country|page    |pos |
|----|--|-----|-----|--------|----|
|John|50|Milan|Italy|🔌 Query|2696|
|Jane|53|Rome |Italy|🔌 Query|2742|
<!-- /query -->
 
#### 4.2 Plugs’ data sources
Certain plugs can also provide special data sources to query a certain data. Some examples are:
* [[🔌 Github]] provides `gh-pull` to query PRs for selected repo
* [[🔌 Mattermost]] provides `mm-saved` to fetch (by default 15) saved posts in Mattermost

For a complete list of data sources, please check plugs’ own pages.

### 5. Templates
Templates are predefined formats to render the body of the query. 

#### 5.1 How to create a template?
It is pretty easy. You just need to create a new page. However, it is recommended to create your templates using `template/[TEMPLATE_NAME]` convention. For this guide, we will create `template/plug` to display list of Plugs available in Silver Bullet. We will use this template in the Examples section below. 

#### 5.2 What is the syntax?
We are using Handlebars which is a simple templating language. It is using double curly braces and name of parameter to be injected. For our `template/plug`, we are using simple template like below.

`* [[{{name}}]] by **{{author}}** ([repo]({{repo}}))`

Let me break it down for you
* `* ` is creating a bullet point for each item in Silver Bullet
* `[[{{name}}]]` is injecting the name of Plug and creating an internal link to the page of the Plug
* `**{{author}}**` is injecting the author of the Plug and making it bold
* `([repo]({{repo}}))` is injecting the name of the Plug and creating an external link to GitHub page of the Plug

For more information on the Handlebars syntax, you can read the [official documentation](https://handlebarsjs.com/).

#### 5.3 How to use the template?
You just need to add `render` keyword followed by the link of the template to the query like below:

`#query page where type = "plug" render [[template/plug]]`

You can see the usage of our template in the example 6.4 below. 

### 6. Examples
We will walk you through a set of examples starting from very basic one until to format the data using templates. 

Our goal in this exercise is to (i) get all plug pages (ii) ordered by last modified time and (iii) display in a nice format.

For the sake of simplicity, we will use `page` data source and limit the results not to spoil the page.

#### 6.1 Simple query without any condition
**Goal:** We would like to get the list of all pages. 

**Result:** Look at the data. This is more than we need. The query even gives us template pages. Lets try to limit it in the next step.
<!-- #query page limit 10 -->
|name             |lastModified |perm|tags |type|uri                                 |repo                                               |author        |
|--|--|--|--|--|--|--|--|
|SETTINGS         |1661112513714|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|Silver Bullet    |1661112513714|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|CHANGELOG        |1661112513714|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|Mattermost Plugin|1661112513714|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|PLUGS            |1661112513714|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|index            |1661112513714|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|template/plug    |1661112513718|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|template/tasks   |1661112513718|rw|#each|undefined|undefined                           |undefined                                          |undefined     |
|💡 Inspiration   |1661112513718|rw|undefined|undefined|undefined                           |undefined                                          |undefined     |
|🔌 Backlinks     |1661112513718|rw|undefined|plug|ghr:Willyfrog/silverbullet-backlinks|https://github.com/Willyfrog/silverbullet-backlinks|Guillermo Vayá|
<!-- /query -->

#### 6.2 Simple query with a condition
**Goal:** We would like to get all plug pages and sorted by last modified time.

**Result:** Okay, this what we wanted but there are also information such as perm, type and lastModified that we don't need.

<!-- #query page where type = "plug" order by lastModified desc limit 5 -->
|name        |lastModified |perm|type|uri                                                       |repo                                                 |author               |
|--|--|--|--|--|--|--|
|🔌 Query    |1661114193972|rw|plug|core:query                                                |https://github.com/silverbulletmd/silverbullet       |Silver Bullet Authors|
|🔌 Backlinks|1661112513718|rw|plug|ghr:Willyfrog/silverbullet-backlinks                      |https://github.com/Willyfrog/silverbullet-backlinks  |Guillermo Vayá       |
|🔌 Core     |1661112513718|rw|plug|builtin:core                                              |https://github.com/silverbulletmd/silverbullet       |Silver Bullet Authors|
|🔌 Ghost    |1661112513718|rw|plug|github:silverbulletmd/silverbullet-ghost/ghost.plug.json  |https://github.com/silverbulletmd/silverbullet-ghost |Zef Hemel            |
|🔌 Git      |1661112513718|rw|plug|github:silverbulletmd/silverbullet-github/github.plug.json|https://github.com/silverbulletmd/silverbullet-github|Zef Hemel            |
<!-- /query -->


#### 6.3 Query to select only certain fields
**Goal:** We would like to get all plug pages, select only `name`, `author` and `repo` columns and sort by last modified time.

**Result:** Okay, this is much better. However, I believe this needs a touch from a visual perspective.

<!-- #query page select name author repo uri where type = "plug" order by lastModified desc limit 5 -->
|name        |author               |repo                                                 |
|--|--|--|
|🔌 Query    |Silver Bullet Authors|https://github.com/silverbulletmd/silverbullet       |
|🔌 Backlinks|Guillermo Vayá       |https://github.com/Willyfrog/silverbullet-backlinks  |
|🔌 Core     |Silver Bullet Authors|https://github.com/silverbulletmd/silverbullet       |
|🔌 Ghost    |Zef Hemel            |https://github.com/silverbulletmd/silverbullet-ghost |
|🔌 Git      |Zef Hemel            |https://github.com/silverbulletmd/silverbullet-github|
<!-- /query -->

#### 6.4 Display the data in a format defined by a template

**Goal:** We would like to display the data from step 5.3 in a nice format using bullet points with links to Plug pages, with author name and link to their GitHub repo. 

**Result:** Here you go. This is the result we would like to achieve 🎉. Did you see how I used `render` and `template/plug` in a query? 🚀 

<!-- #query page select name author repo uri where type = "plug" order by lastModified desc limit 5 render [[template/plug]] -->
* [[🔌 Query]] by **Silver Bullet Authors** ([repo](https://github.com/silverbulletmd/silverbullet))
* [[🔌 Backlinks]] by **Guillermo Vayá** ([repo](https://github.com/Willyfrog/silverbullet-backlinks))
* [[🔌 Core]] by **Silver Bullet Authors** ([repo](https://github.com/silverbulletmd/silverbullet))
* [[🔌 Ghost]] by **Zef Hemel** ([repo](https://github.com/silverbulletmd/silverbullet-ghost))
* [[🔌 Git]] by **Zef Hemel** ([repo](https://github.com/silverbulletmd/silverbullet-github))
<!-- /query -->

PS: You don't need to select only certain fields to use templates. Templates are smart enough to get only the information needed to render the data. 
Therefore, following queries are same in terms of end result when using the templates.

```yaml
<!-- #query page select name author repo uri where type = "plug" order by lastModified desc limit 5 render [[template/plug]] -->
```

```yaml
<!-- #query page where type = "plug" order by lastModified desc limit 5 render [[template/plug]] -->
```
