$(document).ready ->

  # api/tags
  autoComplete =
    tags: []

  autoComplete.fetchTags = ->
    $.ajax
        url: "/api/tags",
      .success (data) ->
        this.tags = data['tags']
        $("#ts-tags").autocomplete
          source: this.tags
          select: (event, ui) ->
            window.location = "/t/#{ui.item.value}"

  autoComplete.fetchTags()
