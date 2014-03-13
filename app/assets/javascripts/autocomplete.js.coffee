$(document).ready ->

  # api/tags
  autoComplete =
    tags: []

  autoComplete.fetchTags = ->
    $.ajax
        url: "/api/tags",
      .success (data) ->
        this.tags = data['tags']
        $("#ts-tags").autocomplete source: this.tags

  autoComplete.fetchTags()
