/*
* super simple carousel
* animation between panes happens with css transitions
* Specific to tagSurf
* TODO translate to Coffeescript
*/
function Carousel(element)
{
    var self = this;
    element = $(element);

    var container = $(">ul", element);
    var panes = $.unique($(">ul>li", element));

    var pane_width = 0;
    var pane_count = panes.length;
    var current_pane = 2;


    /**
     * initial
     */
    this.init = function(starting_pane) {
        setPaneDimensions();
        //clearDuplicates();

        $(window).on("load resize orientationchange", function() {
            setPaneDimensions();
        })
        this.showPane(starting_pane, false);
    };

    function clearDuplicates() {
      dup = {}
      $('.carousel-card').each(function() {
        var data = $(this).data();
        if (dup[data] == null){
          dup[data] = true;
        } else {
          $(this).remove();
        };
      });
    };


    /**
     * set the pane dimensions and scale the container
     */
    function setPaneDimensions() {
        pane_width = $(document).width();
        panes.each(function() {
          $(this).width(pane_width);
        });
        container.width(pane_width*pane_count);
    };


    /**
     * show pane by index
     */
    this.showPane = function(index, animate) {
        // between the bounds
        index = Math.max(0, Math.min(index, pane_count-1));
        current_pane = index;

        var offset = -((100/pane_count)*current_pane);
        setContainerOffset(offset, animate);
    };


    function setContainerOffset(percent, animate) {
        container.removeClass("animate");

        if(animate) {
            container.addClass("animate");
        }

        container.css("transform", "translate("+ percent +"%,0)");
    }

    this.next = function() { return this.showPane(current_pane+1, true); };
    this.prev = function() { return this.showPane(current_pane-1, true); };

    function handleHammer(ev) {
        // disable browser scrolling
        ev.gesture.preventDefault();

        switch(ev.type) {
            case 'dragright':
            case 'dragleft':
                // stick to the finger
                var pane_offset = -(100/pane_count)*current_pane;
                var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

                // slow down at the first and last pane 
                if (current_pane == pane_count-1 && ev.gesture.direction == "left") {
                    var el = $('li').last()
                    var id = el.data("id")
                    var doc_width = $(document).width();
                    var collection = []
                    $.ajax({
                      url: "/api/history/next/" + id
                    }).success(function(data) {
                      collection = data.data;
                      $.each(collection, function(index, value) {
                        if ($('.carousel-card[data-id='+ value.id + ']')[0]) {
                          //console.log("already added");
                        }else{
                          pane_count = pane_count + 1
                          container.append( "<li class='pane" + (current_pane + index + 2) + " carousel-card' data-id=" + value.id + " style='width:"+ doc_width +"px'> <div class='carousel-img-container'> <img src='" + value.link + "' class='carousel-img' /> </div> <div class='carousel-txt-container'> <p>" + value.title + "</p> </div> </li>");
                        };
                      });
                      setContainerOffset(drag_offset + pane_offset);
                      self.init(current_pane + 1)
                    });
                }

                if (current_pane == 0 && ev.gesture.direction == "right") {
                    var el = $($('.carousel-card')[0]);
                    var id = el.data("id");
                    var doc_width = $(document).width();
                    var collection = [];
                    $.ajax({
                      url: "/api/history/previous/" + id
                    }).success(function(data) {
                      collection = data.data;
                      $.each(collection, function(index, value) {
                        if ($('.carousel-card[data-id='+ value.id + ']')[0]) {
                          //console.log("already added");
                        }else{
                          pane_count = pane_count + 1
                          el.before( "<li class='pane-" + (current_pane + index) + " carousel-card' data-id=" + value.id + " style='width:"+ doc_width +"px'> <div class='carousel-img-container'> <img src='" + value.link + "' class='carousel-img' /> </div> <div class='carousel-txt-container'> <p>" + value.title + "</p> </div> </li>");
                        };
                      });
                      setContainerOffset(drag_offset + pane_offset);
                      self.init(10)
                    });



                    drag_offset *= .4;
                }

                setContainerOffset(drag_offset + pane_offset);
                break;

            case 'swipeleft':
                self.next();
                ev.gesture.stopDetect();
                break;

            case 'swiperight':
                self.prev();
                ev.gesture.stopDetect();
                break;

            case 'release':
                // more then 50% moved, navigate
                if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
                    if(ev.gesture.direction == 'right') {
                        self.prev();
                    } else {
                        self.next();
                    }
                }
                else {
                    self.showPane(current_pane, true);
                }
                break;
        }
    }

    new Hammer(element[0], { drag_lock_to_axis: true }).on("release dragleft dragright swipeleft swiperight", handleHammer);
}

