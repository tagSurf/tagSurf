# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

# DEPRECATED MODEL FROM PREVIOUS APPLICATION
CardUI =
  centerCard: ->
    width = CardUI.$element.outerWidth()
    height = CardUI.$element.outerHeight()
    parentWidth = CardUI.$element.parent().innerWidth()
    parentHeight = CardUI.$element.parent().innerHeight()
    parentPadding = 10
    top = (parentHeight - height) / 2 + parentPadding
    left = (parentWidth - width) / 2 + parentPadding
    CardUI.$element.css "left", left + "px"
    CardUI.$element.css "top", top + "px"

  resizeParent: ->
    $parent = CardUI.$element.parent()
    $parent.height window.innerHeight - $parent.position().top
    CardUI.centerCard()

  init: (viewModel) ->
    CardUI.$element = $("#card")
    observable = viewModel.currentCard().candidate
    settle = viewModel.currentCard().vote
    CardUI.$element.pep
      droppable: ".drop-target"
      
      #smooths out animation
      useCSSTranslation: false
      overlapFunction: ($a, $b) ->
        cardRect = $b[0].getBoundingClientRect()
        regionRect = $a[0].getBoundingClientRect()
        overlaps = false
        if $a.hasClass("top")
          overlaps = cardRect.top < regionRect.bottom
          observable "maybe"  if overlaps
        else if $a.hasClass("left")
          overlaps = cardRect.left < regionRect.right
          observable "no"  if overlaps
        else if $a.hasClass("left-bottom")
          
          #the card is going down, and the distance between the region's right edge
          #and its left edge is more than 50% of the card's width
          overlaps = cardRect.bottom > regionRect.bottom and (cardRect.left < regionRect.right) and (cardRect.right - regionRect.right) < (cardRect.width / 2)
          observable "no"  if overlaps
        else if $a.hasClass("right-bottom")
          
          #the card is going down, and the distance between the region's left edge
          #and its right edge is more than 50% of the card's width
          overlaps = cardRect.bottom > regionRect.bottom and (cardRect.right > regionRect.left) and cardRect.right - regionRect.left > (cardRect.width / 2)
          observable "yes"  if overlaps
        else if $a.hasClass("right")
          overlaps = cardRect.right > regionRect.left
          observable "yes"  if overlaps
        overlaps

      start: (ev, obj) ->

      
      #the card has started moving
      drag: (ev, obj) ->
        observable "none"  if obj.activeDropRegions.length is 0

      stop: (ev, obj) ->
        
        #the card has stopped moving,
        #if its not moving back to the
        if obj.activeDropRegions.length is 0
          
          #center the card
          CardUI.centerCard()
          observable "none"

      rest: (ev, obj) ->
        settle observable()  if obj.activeDropRegions.length > 0

    CardUI.resizeParent()
    $(window).resize ->
      CardUI.resizeParent()


  unbind: ->
    
    #only true for the first card
    $.pep.unbind CardUI.$element  if CardUI.$element





