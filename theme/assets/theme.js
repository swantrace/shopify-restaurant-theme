(function (factory) {
  typeof define === 'function' && define.amd ? define('index', factory) :
  factory();
}((function () { 'use strict';

  /*!
    * Native JavaScript for Bootstrap v3.0.10 (https://thednp.github.io/bootstrap.native/)
    * Copyright 2015-2020 © dnp_theme
    * Licensed under MIT (https://github.com/thednp/bootstrap.native/blob/master/LICENSE)
    */
  var transitionEndEvent = 'webkitTransition' in document.head.style ? 'webkitTransitionEnd' : 'transitionend';
  var supportTransition = 'webkitTransition' in document.head.style || 'transition' in document.head.style;
  var transitionDuration = 'webkitTransition' in document.head.style ? 'webkitTransitionDuration' : 'transitionDuration';

  function getElementTransitionDuration(element) {
    var duration = supportTransition ? parseFloat(getComputedStyle(element)[transitionDuration]) : 0;
    duration = typeof duration === 'number' && !isNaN(duration) ? duration * 1000 : 0;
    return duration;
  }

  function emulateTransitionEnd(element, handler) {
    var called = 0,
        duration = getElementTransitionDuration(element);
    duration ? element.addEventListener(transitionEndEvent, function transitionEndWrapper(e) {
      !called && handler(e), called = 1;
      element.removeEventListener(transitionEndEvent, transitionEndWrapper);
    }) : setTimeout(function () {
      !called && handler(), called = 1;
    }, 17);
  }
  

  function queryElement(selector, parent) {
    var lookUp = parent && parent instanceof Element ? parent : document;
    return selector instanceof Element ? selector : lookUp.querySelector(selector);
  }

  function bootstrapCustomEvent(eventName, componentName, related) {
    var OriginalCustomEvent = new CustomEvent(eventName + '.bs.' + componentName, {
      cancelable: true
    });
    OriginalCustomEvent.relatedTarget = related;
    return OriginalCustomEvent;
  }

  function dispatchCustomEvent(customEvent) {
    this && this.dispatchEvent(customEvent);
  }

  function Alert(element) {
    var self = this,
        alert,
        closeCustomEvent = bootstrapCustomEvent('close', 'alert'),
        closedCustomEvent = bootstrapCustomEvent('closed', 'alert');

    function triggerHandler() {
      alert.classList.contains('fade') ? emulateTransitionEnd(alert, transitionEndHandler) : transitionEndHandler();
    }

    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action]('click', clickHandler, false);
    }

    function clickHandler(e) {
      alert = e && e.target.closest(".alert");
      element = queryElement('[data-dismiss="alert"]', alert);
      element && alert && (element === e.target || element.contains(e.target)) && self.close();
    }

    function transitionEndHandler() {
      toggleEvents();
      alert.parentNode.removeChild(alert);
      dispatchCustomEvent.call(alert, closedCustomEvent);
    }

    self.close = function () {
      if (alert && element && alert.classList.contains('show')) {
        dispatchCustomEvent.call(alert, closeCustomEvent);

        if (closeCustomEvent.defaultPrevented) {
          return;
        }

        self.dispose();
        alert.classList.remove('show');
        triggerHandler();
      }
    };

    self.dispose = function () {
      toggleEvents();
      delete element.Alert;
    };

    element = queryElement(element);
    alert = element.closest('.alert');
    element.Alert && element.Alert.dispose();

    if (!element.Alert) {
      toggleEvents(1);
    }

    self.element = element;
    element.Alert = self;
  }

  function Button(element) {
    var self = this,
        labels,
        changeCustomEvent = bootstrapCustomEvent('change', 'button');

    function toggle(e) {
      var input,
          label = e.target.tagName === 'LABEL' ? e.target : e.target.closest('LABEL') ? e.target.closest('LABEL') : null;
      input = label && label.getElementsByTagName('INPUT')[0];

      if (!input) {
        return;
      }

      dispatchCustomEvent.call(input, changeCustomEvent);
      dispatchCustomEvent.call(element, changeCustomEvent);

      if (input.type === 'checkbox') {
        if (changeCustomEvent.defaultPrevented) {
          return;
        }

        if (!input.checked) {
          label.classList.add('active');
          input.getAttribute('checked');
          input.setAttribute('checked', 'checked');
          input.checked = true;
        } else {
          label.classList.remove('active');
          input.getAttribute('checked');
          input.removeAttribute('checked');
          input.checked = false;
        }

        if (!element.toggled) {
          element.toggled = true;
        }
      }

      if (input.type === 'radio' && !element.toggled) {
        if (changeCustomEvent.defaultPrevented) {
          return;
        }

        if (!input.checked || e.screenX === 0 && e.screenY == 0) {
          label.classList.add('active');
          label.classList.add('focus');
          input.setAttribute('checked', 'checked');
          input.checked = true;
          element.toggled = true;
          Array.from(labels).map(function (otherLabel) {
            var otherInput = otherLabel.getElementsByTagName('INPUT')[0];

            if (otherLabel !== label && otherLabel.classList.contains('active')) {
              dispatchCustomEvent.call(otherInput, changeCustomEvent);
              otherLabel.classList.remove('active');
              otherInput.removeAttribute('checked');
              otherInput.checked = false;
            }
          });
        }
      }

      setTimeout(function () {
        element.toggled = false;
      }, 50);
    }

    function keyHandler(e) {
      var key = e.which || e.keyCode;
      key === 32 && e.target === document.activeElement && toggle(e);
    }

    function preventScroll(e) {
      var key = e.which || e.keyCode;
      key === 32 && e.preventDefault();
    }

    function focusToggle(e) {
      if (e.target.tagName === 'INPUT') {
        var action = e.type === 'focusin' ? 'add' : 'remove';
        e.target.closest('.btn').classList[action]('focus');
      }
    }

    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action]('click', toggle, false);
      element[action]('keyup', keyHandler, false), element[action]('keydown', preventScroll, false);
      element[action]('focusin', focusToggle, false), element[action]('focusout', focusToggle, false);
    }

    self.dispose = function () {
      toggleEvents();
      delete element.Button;
    };

    element = queryElement(element);
    element.Button && element.Button.dispose();
    labels = element.getElementsByClassName('btn');

    if (!labels.length) {
      return;
    }

    if (!element.Button) {
      toggleEvents(1);
    }

    element.toggled = false;
    element.Button = self;
    Array.from(labels).map(function (btn) {
      !btn.classList.contains('active') && queryElement('input:checked', btn) && btn.classList.add('active');
      btn.classList.contains('active') && !queryElement('input:checked', btn) && btn.classList.remove('active');
    });
  }

  var mouseHoverEvents = 'onmouseleave' in document ? ['mouseenter', 'mouseleave'] : ['mouseover', 'mouseout'];

  var supportPassive = function () {
    var result = false;

    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function get() {
          result = true;
        }
      });
      document.addEventListener('DOMContentLoaded', function wrap() {
        document.removeEventListener('DOMContentLoaded', wrap, opts);
      }, opts);
    } catch (e) {}

    return result;
  }();

  var passiveHandler = supportPassive ? {
    passive: true
  } : false;

  function isElementInScrollRange(element) {
    var bcr = element.getBoundingClientRect(),
        viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return bcr.top <= viewportHeight && bcr.bottom >= 0;
  }

  function Carousel(element, options) {
    options = options || {};
    var self = this,
        vars,
        ops,
        slideCustomEvent,
        slidCustomEvent,
        slides,
        leftArrow,
        rightArrow,
        indicator,
        indicators;

    function pauseHandler() {
      if (ops.interval !== false && !element.classList.contains('paused')) {
        element.classList.add('paused');
        !vars.isSliding && (clearInterval(vars.timer), vars.timer = null);
      }
    }

    function resumeHandler() {
      if (ops.interval !== false && element.classList.contains('paused')) {
        element.classList.remove('paused');
        !vars.isSliding && (clearInterval(vars.timer), vars.timer = null);
        !vars.isSliding && self.cycle();
      }
    }

    function indicatorHandler(e) {
      e.preventDefault();

      if (vars.isSliding) {
        return;
      }

      var eventTarget = e.target;

      if (eventTarget && !eventTarget.classList.contains('active') && eventTarget.getAttribute('data-slide-to')) {
        vars.index = parseInt(eventTarget.getAttribute('data-slide-to'));
      } else {
        return false;
      }

      self.slideTo(vars.index);
    }

    function controlsHandler(e) {
      e.preventDefault();

      if (vars.isSliding) {
        return;
      }

      var eventTarget = e.currentTarget || e.srcElement;

      if (eventTarget === rightArrow) {
        vars.index++;
      } else if (eventTarget === leftArrow) {
        vars.index--;
      }

      self.slideTo(vars.index);
    }

    function keyHandler(ref) {
      var which = ref.which;

      if (vars.isSliding) {
        return;
      }

      switch (which) {
        case 39:
          vars.index++;
          break;

        case 37:
          vars.index--;
          break;

        default:
          return;
      }

      self.slideTo(vars.index);
    }

    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';

      if (ops.pause && ops.interval) {
        element[action](mouseHoverEvents[0], pauseHandler, false);
        element[action](mouseHoverEvents[1], resumeHandler, false);
        element[action]('touchstart', pauseHandler, passiveHandler);
        element[action]('touchend', resumeHandler, passiveHandler);
      }

      ops.touch && slides.length > 1 && element[action]('touchstart', touchDownHandler, passiveHandler);
      rightArrow && rightArrow[action]('click', controlsHandler, false);
      leftArrow && leftArrow[action]('click', controlsHandler, false);
      indicator && indicator[action]('click', indicatorHandler, false);
      ops.keyboard && window[action]('keydown', keyHandler, false);
    }

    function toggleTouchEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action]('touchmove', touchMoveHandler, passiveHandler);
      element[action]('touchend', touchEndHandler, passiveHandler);
    }

    function touchDownHandler(e) {
      if (vars.isTouch) {
        return;
      }

      vars.touchPosition.startX = e.changedTouches[0].pageX;

      if (element.contains(e.target)) {
        vars.isTouch = true;
        toggleTouchEvents(1);
      }
    }

    function touchMoveHandler(e) {
      if (!vars.isTouch) {
        e.preventDefault();
        return;
      }

      vars.touchPosition.currentX = e.changedTouches[0].pageX;

      if (e.type === 'touchmove' && e.changedTouches.length > 1) {
        e.preventDefault();
        return false;
      }
    }

    function touchEndHandler(e) {
      if (!vars.isTouch || vars.isSliding) {
        return;
      }

      vars.touchPosition.endX = vars.touchPosition.currentX || e.changedTouches[0].pageX;

      if (vars.isTouch) {
        if ((!element.contains(e.target) || !element.contains(e.relatedTarget)) && Math.abs(vars.touchPosition.startX - vars.touchPosition.endX) < 75) {
          return false;
        } else {
          if (vars.touchPosition.currentX < vars.touchPosition.startX) {
            vars.index++;
          } else if (vars.touchPosition.currentX > vars.touchPosition.startX) {
            vars.index--;
          }

          vars.isTouch = false;
          self.slideTo(vars.index);
        }

        toggleTouchEvents();
      }
    }

    function setActivePage(pageIndex) {
      Array.from(indicators).map(function (x) {
        x.classList.remove('active');
      });
      indicators[pageIndex] && indicators[pageIndex].classList.add('active');
    }

    function transitionEndHandler(e) {
      if (vars.touchPosition) {
        var next = vars.index,
            timeout = e && e.target !== slides[next] ? e.elapsedTime * 1000 + 100 : 20,
            activeItem = self.getActiveIndex(),
            orientation = vars.direction === 'left' ? 'next' : 'prev';
        vars.isSliding && setTimeout(function () {
          if (vars.touchPosition) {
            vars.isSliding = false;
            slides[next].classList.add('active');
            slides[activeItem].classList.remove('active');
            slides[next].classList.remove("carousel-item-" + orientation);
            slides[next].classList.remove("carousel-item-" + vars.direction);
            slides[activeItem].classList.remove("carousel-item-" + vars.direction);
            dispatchCustomEvent.call(element, slidCustomEvent);

            if (!document.hidden && ops.interval && !element.classList.contains('paused')) {
              self.cycle();
            }
          }
        }, timeout);
      }
    }

    self.cycle = function () {
      if (vars.timer) {
        clearInterval(vars.timer);
        vars.timer = null;
      }

      vars.timer = setInterval(function () {
        var idx = vars.index || self.getActiveIndex();
        isElementInScrollRange(element) && (idx++, self.slideTo(idx));
      }, ops.interval);
    };

    self.slideTo = function (next) {
      if (vars.isSliding) {
        return;
      }

      var activeItem = self.getActiveIndex(),
          orientation;

      if (activeItem === next) {
        return;
      } else if (activeItem < next || activeItem === 0 && next === slides.length - 1) {
        vars.direction = 'left';
      } else if (activeItem > next || activeItem === slides.length - 1 && next === 0) {
        vars.direction = 'right';
      }

      if (next < 0) {
        next = slides.length - 1;
      } else if (next >= slides.length) {
        next = 0;
      }

      orientation = vars.direction === 'left' ? 'next' : 'prev';
      slideCustomEvent = bootstrapCustomEvent('slide', 'carousel', slides[next]);
      slidCustomEvent = bootstrapCustomEvent('slid', 'carousel', slides[next]);
      dispatchCustomEvent.call(element, slideCustomEvent);

      if (slideCustomEvent.defaultPrevented) {
        return;
      }

      vars.index = next;
      vars.isSliding = true;
      clearInterval(vars.timer);
      vars.timer = null;
      setActivePage(next);

      if (getElementTransitionDuration(slides[next]) && element.classList.contains('slide')) {
        slides[next].classList.add("carousel-item-" + orientation);
        slides[next].offsetWidth;
        slides[next].classList.add("carousel-item-" + vars.direction);
        slides[activeItem].classList.add("carousel-item-" + vars.direction);
        emulateTransitionEnd(slides[next], transitionEndHandler);
      } else {
        slides[next].classList.add('active');
        slides[next].offsetWidth;
        slides[activeItem].classList.remove('active');
        setTimeout(function () {
          vars.isSliding = false;

          if (ops.interval && element && !element.classList.contains('paused')) {
            self.cycle();
          }

          dispatchCustomEvent.call(element, slidCustomEvent);
        }, 100);
      }
    };

    self.getActiveIndex = function () {
      return Array.from(slides).indexOf(element.getElementsByClassName('carousel-item active')[0]) || 0;
    };

    self.dispose = function () {
      var itemClasses = ['left', 'right', 'prev', 'next'];
      Array.from(slides).map(function (slide, idx) {
        slide.classList.contains('active') && setActivePage(idx);
        itemClasses.map(function (cls) {
          return slide.classList.remove("carousel-item-" + cls);
        });
      });
      clearInterval(vars.timer);
      toggleEvents();
      vars = {};
      ops = {};
      delete element.Carousel;
    };

    element = queryElement(element);
    element.Carousel && element.Carousel.dispose();
    slides = element.getElementsByClassName('carousel-item');
    leftArrow = element.getElementsByClassName('carousel-control-prev')[0];
    rightArrow = element.getElementsByClassName('carousel-control-next')[0];
    indicator = element.getElementsByClassName('carousel-indicators')[0];
    indicators = indicator && indicator.getElementsByTagName("LI") || [];

    if (slides.length < 2) {
      return;
    }

    var intervalAttribute = element.getAttribute('data-interval'),
        intervalData = intervalAttribute === 'false' ? 0 : parseInt(intervalAttribute),
        touchData = element.getAttribute('data-touch') === 'false' ? 0 : 1,
        pauseData = element.getAttribute('data-pause') === 'hover' || false,
        keyboardData = element.getAttribute('data-keyboard') === 'true' || false,
        intervalOption = options.interval,
        touchOption = options.touch;
    ops = {};
    ops.keyboard = options.keyboard === true || keyboardData;
    ops.pause = options.pause === 'hover' || pauseData ? 'hover' : false;
    ops.touch = touchOption || touchData;
    ops.interval = typeof intervalOption === 'number' ? intervalOption : intervalOption === false || intervalData === 0 || intervalData === false ? 0 : isNaN(intervalData) ? 5000 : intervalData;

    if (self.getActiveIndex() < 0) {
      slides.length && slides[0].classList.add('active');
      indicators.length && setActivePage(0);
    }

    vars = {};
    vars.direction = 'left';
    vars.index = 0;
    vars.timer = null;
    vars.isSliding = false;
    vars.isTouch = false;
    vars.touchPosition = {
      startX: 0,
      currentX: 0,
      endX: 0
    };
    toggleEvents(1);

    if (ops.interval) {
      self.cycle();
    }

    element.Carousel = self;
  }

  function Collapse(element, options) {
    options = options || {};
    var self = this;
    var accordion = null,
        collapse = null,
        activeCollapse,
        activeElement,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent;

    function openAction(collapseElement, toggle) {
      dispatchCustomEvent.call(collapseElement, showCustomEvent);

      if (showCustomEvent.defaultPrevented) {
        return;
      }

      collapseElement.isAnimating = true;
      collapseElement.classList.add('collapsing');
      collapseElement.classList.remove('collapse');
      collapseElement.style.height = collapseElement.scrollHeight + "px";
      emulateTransitionEnd(collapseElement, function () {
        collapseElement.isAnimating = false;
        collapseElement.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        collapseElement.classList.remove('collapsing');
        collapseElement.classList.add('collapse');
        collapseElement.classList.add('show');
        collapseElement.style.height = '';
        dispatchCustomEvent.call(collapseElement, shownCustomEvent);
      });
    }

    function closeAction(collapseElement, toggle) {
      dispatchCustomEvent.call(collapseElement, hideCustomEvent);

      if (hideCustomEvent.defaultPrevented) {
        return;
      }

      collapseElement.isAnimating = true;
      collapseElement.style.height = collapseElement.scrollHeight + "px";
      collapseElement.classList.remove('collapse');
      collapseElement.classList.remove('show');
      collapseElement.classList.add('collapsing');
      collapseElement.offsetWidth;
      collapseElement.style.height = '0px';
      emulateTransitionEnd(collapseElement, function () {
        collapseElement.isAnimating = false;
        collapseElement.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-expanded', 'false');
        collapseElement.classList.remove('collapsing');
        collapseElement.classList.add('collapse');
        collapseElement.style.height = '';
        dispatchCustomEvent.call(collapseElement, hiddenCustomEvent);
      });
    }

    self.toggle = function (e) {
      if (e && e.target.tagName === 'A' || element.tagName === 'A') {
        e.preventDefault();
      }

      if (element.contains(e.target) || e.target === element) {
        if (!collapse.classList.contains('show')) {
          self.show();
        } else {
          self.hide();
        }
      }
    };

    self.hide = function () {
      if (collapse.isAnimating) {
        return;
      }

      closeAction(collapse, element);
      element.classList.add('collapsed');
    };

    self.show = function () {
      if (accordion) {
        activeCollapse = accordion.getElementsByClassName("collapse show")[0];
        activeElement = activeCollapse && (queryElement("[data-target=\"#" + activeCollapse.id + "\"]", accordion) || queryElement("[href=\"#" + activeCollapse.id + "\"]", accordion));
      }

      if (!collapse.isAnimating) {
        if (activeElement && activeCollapse !== collapse) {
          closeAction(activeCollapse, activeElement);
          activeElement.classList.add('collapsed');
        }

        openAction(collapse, element);
        element.classList.remove('collapsed');
      }
    };

    self.dispose = function () {
      element.removeEventListener('click', self.toggle, false);
      delete element.Collapse;
    };

    element = queryElement(element);
    element.Collapse && element.Collapse.dispose();
    var accordionData = element.getAttribute('data-parent');
    showCustomEvent = bootstrapCustomEvent('show', 'collapse');
    shownCustomEvent = bootstrapCustomEvent('shown', 'collapse');
    hideCustomEvent = bootstrapCustomEvent('hide', 'collapse');
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'collapse');
    collapse = queryElement(options.target || element.getAttribute('data-target') || element.getAttribute('href'));
    collapse.isAnimating = false;
    accordion = element.closest(options.parent || accordionData);

    if (!element.Collapse) {
      element.addEventListener('click', self.toggle, false);
    }

    element.Collapse = self;
  }

  function setFocus(element) {
    element.focus ? element.focus() : element.setActive();
  }

  function Dropdown(element, option) {
    var self = this,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent,
        relatedTarget = null,
        parent,
        menu,
        menuItems = [],
        persist;

    function preventEmptyAnchor(anchor) {
      (anchor.href && anchor.href.slice(-1) === '#' || anchor.parentNode && anchor.parentNode.href && anchor.parentNode.href.slice(-1) === '#') && this.preventDefault();
    }

    function toggleDismiss() {
      var action = element.open ? 'addEventListener' : 'removeEventListener';
      document[action]('click', dismissHandler, false);
      document[action]('keydown', preventScroll, false);
      document[action]('keyup', keyHandler, false);
      document[action]('focus', dismissHandler, false);
    }

    function dismissHandler(e) {
      var eventTarget = e.target,
          hasData = eventTarget && (eventTarget.getAttribute('data-toggle') || eventTarget.parentNode && eventTarget.parentNode.getAttribute && eventTarget.parentNode.getAttribute('data-toggle'));

      if (e.type === 'focus' && (eventTarget === element || eventTarget === menu || menu.contains(eventTarget))) {
        return;
      }

      if ((eventTarget === menu || menu.contains(eventTarget)) && (persist || hasData)) {
        return;
      } else {
        relatedTarget = eventTarget === element || element.contains(eventTarget) ? element : null;
        self.hide();
      }

      preventEmptyAnchor.call(e, eventTarget);
    }

    function clickHandler(e) {
      relatedTarget = element;
      self.show();
      preventEmptyAnchor.call(e, e.target);
    }

    function preventScroll(e) {
      var key = e.which || e.keyCode;

      if (key === 38 || key === 40) {
        e.preventDefault();
      }
    }

    function keyHandler(e) {
      var key = e.which || e.keyCode,
          activeItem = document.activeElement,
          isSameElement = activeItem === element,
          isInsideMenu = menu.contains(activeItem),
          isMenuItem = activeItem.parentNode === menu || activeItem.parentNode.parentNode === menu,
          idx = menuItems.indexOf(activeItem);

      if (isMenuItem) {
        idx = isSameElement ? 0 : key === 38 ? idx > 1 ? idx - 1 : 0 : key === 40 ? idx < menuItems.length - 1 ? idx + 1 : idx : idx;
        menuItems[idx] && setFocus(menuItems[idx]);
      }

      if ((menuItems.length && isMenuItem || !menuItems.length && (isInsideMenu || isSameElement) || !isInsideMenu) && element.open && key === 27) {
        self.toggle();
        relatedTarget = null;
      }
    }

    self.show = function () {
      showCustomEvent = bootstrapCustomEvent('show', 'dropdown', relatedTarget);
      dispatchCustomEvent.call(parent, showCustomEvent);

      if (showCustomEvent.defaultPrevented) {
        return;
      }

      menu.classList.add('show');
      parent.classList.add('show');
      element.setAttribute('aria-expanded', true);
      element.open = true;
      element.removeEventListener('click', clickHandler, false);
      setTimeout(function () {
        setFocus(menu.getElementsByTagName('INPUT')[0] || element);
        toggleDismiss();
        shownCustomEvent = bootstrapCustomEvent('shown', 'dropdown', relatedTarget);
        dispatchCustomEvent.call(parent, shownCustomEvent);
      }, 1);
    };

    self.hide = function () {
      hideCustomEvent = bootstrapCustomEvent('hide', 'dropdown', relatedTarget);
      dispatchCustomEvent.call(parent, hideCustomEvent);

      if (hideCustomEvent.defaultPrevented) {
        return;
      }

      menu.classList.remove('show');
      parent.classList.remove('show');
      element.setAttribute('aria-expanded', false);
      element.open = false;
      toggleDismiss();
      setFocus(element);
      setTimeout(function () {
        element.Dropdown && element.addEventListener('click', clickHandler, false);
      }, 1);
      hiddenCustomEvent = bootstrapCustomEvent('hidden', 'dropdown', relatedTarget);
      dispatchCustomEvent.call(parent, hiddenCustomEvent);
    };

    self.toggle = function () {
      if (parent.classList.contains('show') && element.open) {
        self.hide();
      } else {
        self.show();
      }
    };

    self.dispose = function () {
      if (parent.classList.contains('show') && element.open) {
        self.hide();
      }

      element.removeEventListener('click', clickHandler, false);
      delete element.Dropdown;
    };

    element = queryElement(element);
    element.Dropdown && element.Dropdown.dispose();
    parent = element.parentNode;
    menu = queryElement('.dropdown-menu', parent);
    Array.from(menu.children).map(function (child) {
      child.children.length && child.children[0].tagName === 'A' && menuItems.push(child.children[0]);
      child.tagName === 'A' && menuItems.push(child);
    });

    if (!element.Dropdown) {
      !('tabindex' in menu) && menu.setAttribute('tabindex', '0');
      element.addEventListener('click', clickHandler, false);
    }

    persist = option === true || element.getAttribute('data-persist') === 'true' || false;
    element.open = false;
    element.Dropdown = self;
  }

  function Modal(element, options) {
    options = options || {};
    var self = this,
        modal,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent,
        relatedTarget = null,
        scrollBarWidth,
        overlay,
        overlayDelay,
        fixedItems,
        ops = {};

    function setScrollbar() {
      var openModal = document.body.classList.contains('modal-open'),
          bodyPad = parseInt(getComputedStyle(document.body).paddingRight),
          bodyOverflow = document.documentElement.clientHeight !== document.documentElement.scrollHeight || document.body.clientHeight !== document.body.scrollHeight,
          modalOverflow = modal.clientHeight !== modal.scrollHeight;
      scrollBarWidth = measureScrollbar();
      modal.style.paddingRight = !modalOverflow && scrollBarWidth ? scrollBarWidth + "px" : '';
      document.body.style.paddingRight = modalOverflow || bodyOverflow ? bodyPad + (openModal ? 0 : scrollBarWidth) + "px" : '';
      fixedItems.length && fixedItems.map(function (fixed) {
        var itemPad = getComputedStyle(fixed).paddingRight;
        fixed.style.paddingRight = modalOverflow || bodyOverflow ? parseInt(itemPad) + (openModal ? 0 : scrollBarWidth) + "px" : parseInt(itemPad) + "px";
      });
    }

    function resetScrollbar() {
      document.body.style.paddingRight = '';
      modal.style.paddingRight = '';
      fixedItems.length && fixedItems.map(function (fixed) {
        fixed.style.paddingRight = '';
      });
    }

    function measureScrollbar() {
      var scrollDiv = document.createElement('div'),
          widthValue;
      scrollDiv.className = 'modal-scrollbar-measure';
      document.body.appendChild(scrollDiv);
      widthValue = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return widthValue;
    }

    function createOverlay() {
      var newOverlay = document.createElement('div');
      overlay = queryElement('.modal-backdrop');

      if (overlay === null) {
        newOverlay.setAttribute('class', 'modal-backdrop' + (ops.animation ? ' fade' : ''));
        overlay = newOverlay;
        document.body.appendChild(overlay);
      }

      return overlay;
    }

    function removeOverlay() {
      overlay = queryElement('.modal-backdrop');

      if (overlay && !document.getElementsByClassName('modal show')[0]) {
        document.body.removeChild(overlay);
        overlay = null;
      }

      overlay === null && (document.body.classList.remove('modal-open'), resetScrollbar());
    }

    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      window[action]('resize', self.update, passiveHandler);
      modal[action]('click', dismissHandler, false);
      document[action]('keydown', keyHandler, false);
    }

    function beforeShow() {
      modal.style.display = 'block';
      setScrollbar();
      !document.getElementsByClassName('modal show')[0] && document.body.classList.add('modal-open');
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', false);
      modal.classList.contains('fade') ? emulateTransitionEnd(modal, triggerShow) : triggerShow();
    }

    function triggerShow() {
      setFocus(modal);
      modal.isAnimating = false;
      toggleEvents(1);
      shownCustomEvent = bootstrapCustomEvent('shown', 'modal', relatedTarget);
      dispatchCustomEvent.call(modal, shownCustomEvent);
    }

    function triggerHide(force) {
      modal.style.display = '';
      element && setFocus(element);
      overlay = queryElement('.modal-backdrop');

      if (force !== 1 && overlay && overlay.classList.contains('show') && !document.getElementsByClassName('modal show')[0]) {
        overlay.classList.remove('show');
        emulateTransitionEnd(overlay, removeOverlay);
      } else {
        removeOverlay();
      }

      toggleEvents();
      modal.isAnimating = false;
      hiddenCustomEvent = bootstrapCustomEvent('hidden', 'modal');
      dispatchCustomEvent.call(modal, hiddenCustomEvent);
    }

    function clickHandler(e) {
      if (modal.isAnimating) {
        return;
      }

      var clickTarget = e.target,
          modalID = "#" + modal.getAttribute('id'),
          targetAttrValue = clickTarget.getAttribute('data-target') || clickTarget.getAttribute('href'),
          elemAttrValue = element.getAttribute('data-target') || element.getAttribute('href');

      if (!modal.classList.contains('show') && (clickTarget === element && targetAttrValue === modalID || element.contains(clickTarget) && elemAttrValue === modalID)) {
        modal.modalTrigger = element;
        relatedTarget = element;
        self.show();
        e.preventDefault();
      }
    }

    function keyHandler(ref) {
      var which = ref.which;

      if (!modal.isAnimating && ops.keyboard && which == 27 && modal.classList.contains('show')) {
        self.hide();
      }
    }

    function dismissHandler(e) {
      if (modal.isAnimating) {
        return;
      }

      var clickTarget = e.target,
          hasData = clickTarget.getAttribute('data-dismiss') === 'modal',
          parentWithData = clickTarget.closest('[data-dismiss="modal"]');

      if (modal.classList.contains('show') && (parentWithData || hasData || clickTarget === modal && ops.backdrop !== 'static')) {
        self.hide();
        relatedTarget = null;
        e.preventDefault();
      }
    }

    self.toggle = function () {
      if (modal.classList.contains('show')) {
        self.hide();
      } else {
        self.show();
      }
    };

    self.show = function () {
      if (modal.classList.contains('show') && !!modal.isAnimating) {
        return;
      }

      showCustomEvent = bootstrapCustomEvent('show', 'modal', relatedTarget);
      dispatchCustomEvent.call(modal, showCustomEvent);

      if (showCustomEvent.defaultPrevented) {
        return;
      }

      modal.isAnimating = true;
      var currentOpen = document.getElementsByClassName('modal show')[0];

      if (currentOpen && currentOpen !== modal) {
        currentOpen.modalTrigger && currentOpen.modalTrigger.Modal.hide();
        currentOpen.Modal && currentOpen.Modal.hide();
      }

      if (ops.backdrop) {
        overlay = createOverlay();
      }

      if (overlay && !currentOpen && !overlay.classList.contains('show')) {
        overlay.offsetWidth;
        overlayDelay = getElementTransitionDuration(overlay);
        overlay.classList.add('show');
      }

      !currentOpen ? setTimeout(beforeShow, overlay && overlayDelay ? overlayDelay : 0) : beforeShow();
    };

    self.hide = function (force) {
      if (!modal.classList.contains('show')) {
        return;
      }

      hideCustomEvent = bootstrapCustomEvent('hide', 'modal');
      dispatchCustomEvent.call(modal, hideCustomEvent);

      if (hideCustomEvent.defaultPrevented) {
        return;
      }

      modal.isAnimating = true;
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', true);
      modal.classList.contains('fade') && force !== 1 ? emulateTransitionEnd(modal, triggerHide) : triggerHide();
    };

    self.setContent = function (content) {
      queryElement('.modal-content', modal).innerHTML = content;
    };

    self.update = function () {
      if (modal.classList.contains('show')) {
        setScrollbar();
      }
    };

    self.dispose = function () {
      self.hide(1);

      if (element) {
        element.removeEventListener('click', clickHandler, false);
        delete element.Modal;
      } else {
        delete modal.Modal;
      }
    };

    element = queryElement(element);
    var checkModal = queryElement(element.getAttribute('data-target') || element.getAttribute('href'));
    modal = element.classList.contains('modal') ? element : checkModal;
    fixedItems = Array.from(document.getElementsByClassName('fixed-top')).concat(Array.from(document.getElementsByClassName('fixed-bottom')));

    if (element.classList.contains('modal')) {
      element = null;
    }

    element && element.Modal && element.Modal.dispose();
    modal && modal.Modal && modal.Modal.dispose();
    ops.keyboard = options.keyboard === false || modal.getAttribute('data-keyboard') === 'false' ? false : true;
    ops.backdrop = options.backdrop === 'static' || modal.getAttribute('data-backdrop') === 'static' ? 'static' : true;
    ops.backdrop = options.backdrop === false || modal.getAttribute('data-backdrop') === 'false' ? false : ops.backdrop;
    ops.animation = modal.classList.contains('fade') ? true : false;
    ops.content = options.content;
    modal.isAnimating = false;

    if (element && !element.Modal) {
      element.addEventListener('click', clickHandler, false);
    }

    if (ops.content) {
      self.setContent(ops.content.trim());
    }

    if (element) {
      modal.modalTrigger = element;
      element.Modal = self;
    } else {
      modal.Modal = self;
    }
  }

  var mouseClickEvents = {
    down: 'mousedown',
    up: 'mouseup'
  };

  function getScroll() {
    return {
      y: window.pageYOffset || document.documentElement.scrollTop,
      x: window.pageXOffset || document.documentElement.scrollLeft
    };
  }

  function styleTip(link, element, position, parent) {
    var tipPositions = /\b(top|bottom|left|right)+/,
        elementDimensions = {
      w: element.offsetWidth,
      h: element.offsetHeight
    },
        windowWidth = document.documentElement.clientWidth || document.body.clientWidth,
        windowHeight = document.documentElement.clientHeight || document.body.clientHeight,
        rect = link.getBoundingClientRect(),
        scroll = parent === document.body ? getScroll() : {
      x: parent.offsetLeft + parent.scrollLeft,
      y: parent.offsetTop + parent.scrollTop
    },
        linkDimensions = {
      w: rect.right - rect.left,
      h: rect.bottom - rect.top
    },
        isPopover = element.classList.contains('popover'),
        arrow = element.getElementsByClassName('arrow')[0],
        halfTopExceed = rect.top + linkDimensions.h / 2 - elementDimensions.h / 2 < 0,
        halfLeftExceed = rect.left + linkDimensions.w / 2 - elementDimensions.w / 2 < 0,
        halfRightExceed = rect.left + elementDimensions.w / 2 + linkDimensions.w / 2 >= windowWidth,
        halfBottomExceed = rect.top + elementDimensions.h / 2 + linkDimensions.h / 2 >= windowHeight,
        topExceed = rect.top - elementDimensions.h < 0,
        leftExceed = rect.left - elementDimensions.w < 0,
        bottomExceed = rect.top + elementDimensions.h + linkDimensions.h >= windowHeight,
        rightExceed = rect.left + elementDimensions.w + linkDimensions.w >= windowWidth;
    position = (position === 'left' || position === 'right') && leftExceed && rightExceed ? 'top' : position;
    position = position === 'top' && topExceed ? 'bottom' : position;
    position = position === 'bottom' && bottomExceed ? 'top' : position;
    position = position === 'left' && leftExceed ? 'right' : position;
    position = position === 'right' && rightExceed ? 'left' : position;
    var topPosition, leftPosition, arrowTop, arrowLeft, arrowWidth, arrowHeight;
    element.className.indexOf(position) === -1 && (element.className = element.className.replace(tipPositions, position));
    arrowWidth = arrow.offsetWidth;
    arrowHeight = arrow.offsetHeight;

    if (position === 'left' || position === 'right') {
      if (position === 'left') {
        leftPosition = rect.left + scroll.x - elementDimensions.w - (isPopover ? arrowWidth : 0);
      } else {
        leftPosition = rect.left + scroll.x + linkDimensions.w;
      }

      if (halfTopExceed) {
        topPosition = rect.top + scroll.y;
        arrowTop = linkDimensions.h / 2 - arrowWidth;
      } else if (halfBottomExceed) {
        topPosition = rect.top + scroll.y - elementDimensions.h + linkDimensions.h;
        arrowTop = elementDimensions.h - linkDimensions.h / 2 - arrowWidth;
      } else {
        topPosition = rect.top + scroll.y - elementDimensions.h / 2 + linkDimensions.h / 2;
        arrowTop = elementDimensions.h / 2 - (isPopover ? arrowHeight * 0.9 : arrowHeight / 2);
      }
    } else if (position === 'top' || position === 'bottom') {
      if (position === 'top') {
        topPosition = rect.top + scroll.y - elementDimensions.h - (isPopover ? arrowHeight : 0);
      } else {
        topPosition = rect.top + scroll.y + linkDimensions.h;
      }

      if (halfLeftExceed) {
        leftPosition = 0;
        arrowLeft = rect.left + linkDimensions.w / 2 - arrowWidth;
      } else if (halfRightExceed) {
        leftPosition = windowWidth - elementDimensions.w * 1.01;
        arrowLeft = elementDimensions.w - (windowWidth - rect.left) + linkDimensions.w / 2 - arrowWidth / 2;
      } else {
        leftPosition = rect.left + scroll.x - elementDimensions.w / 2 + linkDimensions.w / 2;
        arrowLeft = elementDimensions.w / 2 - (isPopover ? arrowWidth : arrowWidth / 2);
      }
    }

    element.style.top = topPosition + 'px';
    element.style.left = leftPosition + 'px';
    arrowTop && (arrow.style.top = arrowTop + 'px');
    arrowLeft && (arrow.style.left = arrowLeft + 'px');
  }

  function Popover(element, options) {
    options = options || {};
    var self = this;
    var popover = null,
        timer = 0,
        isIphone = /(iPhone|iPod|iPad)/.test(navigator.userAgent),
        titleString,
        contentString,
        ops = {};
    var triggerData, animationData, placementData, dismissibleData, delayData, containerData, closeBtn, showCustomEvent, shownCustomEvent, hideCustomEvent, hiddenCustomEvent, containerElement, containerDataElement, modal, navbarFixedTop, navbarFixedBottom, placementClass;

    function dismissibleHandler(e) {
      if (popover !== null && e.target === queryElement('.close', popover)) {
        self.hide();
      }
    }

    function getContents() {
      return {
        0: options.title || element.getAttribute('data-title') || null,
        1: options.content || element.getAttribute('data-content') || null
      };
    }

    function removePopover() {
      ops.container.removeChild(popover);
      timer = null;
      popover = null;
    }

    function createPopover() {
      titleString = getContents()[0] || null;
      contentString = getContents()[1];
      contentString = !!contentString ? contentString.trim() : null;
      popover = document.createElement('div');
      var popoverArrow = document.createElement('div');
      popoverArrow.classList.add('arrow');
      popover.appendChild(popoverArrow);

      if (contentString !== null && ops.template === null) {
        popover.setAttribute('role', 'tooltip');

        if (titleString !== null) {
          var popoverTitle = document.createElement('h3');
          popoverTitle.classList.add('popover-header');
          popoverTitle.innerHTML = ops.dismissible ? titleString + closeBtn : titleString;
          popover.appendChild(popoverTitle);
        }

        var popoverBodyMarkup = document.createElement('div');
        popoverBodyMarkup.classList.add('popover-body');
        popoverBodyMarkup.innerHTML = ops.dismissible && titleString === null ? contentString + closeBtn : contentString;
        popover.appendChild(popoverBodyMarkup);
      } else {
        var popoverTemplate = document.createElement('div');
        popoverTemplate.innerHTML = ops.template.trim();
        popover.className = popoverTemplate.firstChild.className;
        popover.innerHTML = popoverTemplate.firstChild.innerHTML;
        var popoverHeader = queryElement('.popover-header', popover),
            popoverBody = queryElement('.popover-body', popover);
        titleString && popoverHeader && (popoverHeader.innerHTML = titleString.trim());
        contentString && popoverBody && (popoverBody.innerHTML = contentString.trim());
      }

      ops.container.appendChild(popover);
      popover.style.display = 'block';
      !popover.classList.contains('popover') && popover.classList.add('popover');
      !popover.classList.contains(ops.animation) && popover.classList.add(ops.animation);
      !popover.classList.contains(placementClass) && popover.classList.add(placementClass);
    }

    function showPopover() {
      !popover.classList.contains('show') && popover.classList.add('show');
    }

    function updatePopover() {
      styleTip(element, popover, ops.placement, ops.container);
    }

    function forceFocus() {
      if (popover === null) {
        element.focus();
      }
    }

    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';

      if (ops.trigger === 'hover') {
        element[action](mouseClickEvents.down, self.show);
        element[action](mouseHoverEvents[0], self.show);

        if (!ops.dismissible) {
          element[action](mouseHoverEvents[1], self.hide);
        }
      } else if ('click' == ops.trigger) {
        element[action](ops.trigger, self.toggle);
      } else if ('focus' == ops.trigger) {
        isIphone && element[action]('click', forceFocus, false);
        element[action](ops.trigger, self.toggle);
      }
    }

    function touchHandler(e) {
      if (popover && popover.contains(e.target) || e.target === element || element.contains(e.target)) ;else {
        self.hide();
      }
    }

    function dismissHandlerToggle(action) {
      action = action ? 'addEventListener' : 'removeEventListener';

      if (ops.dismissible) {
        document[action]('click', dismissibleHandler, false);
      } else {
        'focus' == ops.trigger && element[action]('blur', self.hide);
        'hover' == ops.trigger && document[action]('touchstart', touchHandler, passiveHandler);
      }

      window[action]('resize', self.hide, passiveHandler);
    }

    function showTrigger() {
      dismissHandlerToggle(1);
      dispatchCustomEvent.call(element, shownCustomEvent);
    }

    function hideTrigger() {
      dismissHandlerToggle();
      removePopover();
      dispatchCustomEvent.call(element, hiddenCustomEvent);
    }

    self.toggle = function () {
      if (popover === null) {
        self.show();
      } else {
        self.hide();
      }
    };

    self.show = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (popover === null) {
          dispatchCustomEvent.call(element, showCustomEvent);

          if (showCustomEvent.defaultPrevented) {
            return;
          }

          createPopover();
          updatePopover();
          showPopover();
          !!ops.animation ? emulateTransitionEnd(popover, showTrigger) : showTrigger();
        }
      }, 20);
    };

    self.hide = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (popover && popover !== null && popover.classList.contains('show')) {
          dispatchCustomEvent.call(element, hideCustomEvent);

          if (hideCustomEvent.defaultPrevented) {
            return;
          }

          popover.classList.remove('show');
          !!ops.animation ? emulateTransitionEnd(popover, hideTrigger) : hideTrigger();
        }
      }, ops.delay);
    };

    self.dispose = function () {
      self.hide();
      toggleEvents();
      delete element.Popover;
    };

    element = queryElement(element);
    element.Popover && element.Popover.dispose();
    triggerData = element.getAttribute('data-trigger');
    animationData = element.getAttribute('data-animation');
    placementData = element.getAttribute('data-placement');
    dismissibleData = element.getAttribute('data-dismissible');
    delayData = element.getAttribute('data-delay');
    containerData = element.getAttribute('data-container');
    closeBtn = '<button type="button" class="close">×</button>';
    showCustomEvent = bootstrapCustomEvent('show', 'popover');
    shownCustomEvent = bootstrapCustomEvent('shown', 'popover');
    hideCustomEvent = bootstrapCustomEvent('hide', 'popover');
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'popover');
    containerElement = queryElement(options.container);
    containerDataElement = queryElement(containerData);
    modal = element.closest('.modal');
    navbarFixedTop = element.closest('.fixed-top');
    navbarFixedBottom = element.closest('.fixed-bottom');
    ops.template = options.template ? options.template : null;
    ops.trigger = options.trigger ? options.trigger : triggerData || 'hover';
    ops.animation = options.animation && options.animation !== 'fade' ? options.animation : animationData || 'fade';
    ops.placement = options.placement ? options.placement : placementData || 'top';
    ops.delay = parseInt(options.delay || delayData) || 200;
    ops.dismissible = options.dismissible || dismissibleData === 'true' ? true : false;
    ops.container = containerElement ? containerElement : containerDataElement ? containerDataElement : navbarFixedTop ? navbarFixedTop : navbarFixedBottom ? navbarFixedBottom : modal ? modal : document.body;
    placementClass = "bs-popover-" + ops.placement;
    var popoverContents = getContents();
    titleString = popoverContents[0];
    contentString = popoverContents[1];

    if (!contentString && !ops.template) {
      return;
    }

    if (!element.Popover) {
      toggleEvents(1);
    }

    element.Popover = self;
  }

  function ScrollSpy(element, options) {
    options = options || {};
    var self = this,
        vars,
        targetData,
        offsetData,
        spyTarget,
        scrollTarget,
        ops = {};

    function updateTargets() {
      var links = spyTarget.getElementsByTagName('A');

      if (vars.length !== links.length) {
        vars.items = [];
        vars.targets = [];
        Array.from(links).map(function (link) {
          var href = link.getAttribute('href'),
              targetItem = href && href.charAt(0) === '#' && href.slice(-1) !== '#' && queryElement(href);

          if (targetItem) {
            vars.items.push(link);
            vars.targets.push(targetItem);
          }
        });
        vars.length = links.length;
      }
    }

    function updateItem(index) {
      var item = vars.items[index],
          targetItem = vars.targets[index],
          dropmenu = item.classList.contains('dropdown-item') && item.closest('.dropdown-menu'),
          dropLink = dropmenu && dropmenu.previousElementSibling,
          nextSibling = item.nextElementSibling,
          activeSibling = nextSibling && nextSibling.getElementsByClassName('active').length,
          targetRect = vars.isWindow && targetItem.getBoundingClientRect(),
          isActive = item.classList.contains('active') || false,
          topEdge = (vars.isWindow ? targetRect.top + vars.scrollOffset : targetItem.offsetTop) - ops.offset,
          bottomEdge = vars.isWindow ? targetRect.bottom + vars.scrollOffset - ops.offset : vars.targets[index + 1] ? vars.targets[index + 1].offsetTop - ops.offset : element.scrollHeight,
          inside = activeSibling || vars.scrollOffset >= topEdge && bottomEdge > vars.scrollOffset;

      if (!isActive && inside) {
        item.classList.add('active');

        if (dropLink && !dropLink.classList.contains('active')) {
          dropLink.classList.add('active');
        }

        dispatchCustomEvent.call(element, bootstrapCustomEvent('activate', 'scrollspy', vars.items[index]));
      } else if (isActive && !inside) {
        item.classList.remove('active');

        if (dropLink && dropLink.classList.contains('active') && !item.parentNode.getElementsByClassName('active').length) {
          dropLink.classList.remove('active');
        }
      } else if (isActive && inside || !inside && !isActive) {
        return;
      }
    }

    function updateItems() {
      updateTargets();
      vars.scrollOffset = vars.isWindow ? getScroll().y : element.scrollTop;
      vars.items.map(function (l, idx) {
        return updateItem(idx);
      });
    }

    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      scrollTarget[action]('scroll', self.refresh, passiveHandler);
      window[action]('resize', self.refresh, passiveHandler);
    }

    self.refresh = function () {
      updateItems();
    };

    self.dispose = function () {
      toggleEvents();
      delete element.ScrollSpy;
    };

    element = queryElement(element);
    element.ScrollSpy && element.ScrollSpy.dispose();
    targetData = element.getAttribute('data-target');
    offsetData = element.getAttribute('data-offset');
    spyTarget = queryElement(options.target || targetData);
    scrollTarget = element.offsetHeight < element.scrollHeight ? element : window;

    if (!spyTarget) {
      return;
    }

    ops.target = spyTarget;
    ops.offset = parseInt(options.offset || offsetData) || 10;
    vars = {};
    vars.length = 0;
    vars.items = [];
    vars.targets = [];
    vars.isWindow = scrollTarget === window;

    if (!element.ScrollSpy) {
      toggleEvents(1);
    }

    self.refresh();
    element.ScrollSpy = self;
  }

  function Tab(element, options) {
    options = options || {};
    var self = this,
        heightData,
        tabs,
        dropdown,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent,
        next,
        tabsContentContainer = false,
        activeTab,
        activeContent,
        nextContent,
        containerHeight,
        equalContents,
        nextHeight,
        animateHeight;

    function triggerEnd() {
      tabsContentContainer.style.height = '';
      tabsContentContainer.classList.remove('collapsing');
      tabs.isAnimating = false;
    }

    function triggerShow() {
      if (tabsContentContainer) {
        if (equalContents) {
          triggerEnd();
        } else {
          setTimeout(function () {
            tabsContentContainer.style.height = nextHeight + "px";
            tabsContentContainer.offsetWidth;
            emulateTransitionEnd(tabsContentContainer, triggerEnd);
          }, 50);
        }
      } else {
        tabs.isAnimating = false;
      }

      shownCustomEvent = bootstrapCustomEvent('shown', 'tab', activeTab);
      dispatchCustomEvent.call(next, shownCustomEvent);
    }

    function triggerHide() {
      if (tabsContentContainer) {
        activeContent.style["float"] = 'left';
        nextContent.style["float"] = 'left';
        containerHeight = activeContent.scrollHeight;
      }

      showCustomEvent = bootstrapCustomEvent('show', 'tab', activeTab);
      hiddenCustomEvent = bootstrapCustomEvent('hidden', 'tab', next);
      dispatchCustomEvent.call(next, showCustomEvent);

      if (showCustomEvent.defaultPrevented) {
        return;
      }

      nextContent.classList.add('active');
      activeContent.classList.remove('active');

      if (tabsContentContainer) {
        nextHeight = nextContent.scrollHeight;
        equalContents = nextHeight === containerHeight;
        tabsContentContainer.classList.add('collapsing');
        tabsContentContainer.style.height = containerHeight + "px";
        tabsContentContainer.offsetHeight;
        activeContent.style["float"] = '';
        nextContent.style["float"] = '';
      }

      if (nextContent.classList.contains('fade')) {
        setTimeout(function () {
          nextContent.classList.add('show');
          emulateTransitionEnd(nextContent, triggerShow);
        }, 20);
      } else {
        triggerShow();
      }

      dispatchCustomEvent.call(activeTab, hiddenCustomEvent);
    }

    function getActiveTab() {
      var activeTabs = tabs.getElementsByClassName('active'),
          activeTab;

      if (activeTabs.length === 1 && !activeTabs[0].parentNode.classList.contains('dropdown')) {
        activeTab = activeTabs[0];
      } else if (activeTabs.length > 1) {
        activeTab = activeTabs[activeTabs.length - 1];
      }

      return activeTab;
    }

    function getActiveContent() {
      return queryElement(getActiveTab().getAttribute('href'));
    }

    function clickHandler(e) {
      e.preventDefault();
      next = e.currentTarget;
      !tabs.isAnimating && self.show();
    }

    self.show = function () {
      next = next || element;

      if (!next.classList.contains('active')) {
        nextContent = queryElement(next.getAttribute('href'));
        activeTab = getActiveTab();
        activeContent = getActiveContent();
        hideCustomEvent = bootstrapCustomEvent('hide', 'tab', next);
        dispatchCustomEvent.call(activeTab, hideCustomEvent);

        if (hideCustomEvent.defaultPrevented) {
          return;
        }

        tabs.isAnimating = true;
        activeTab.classList.remove('active');
        activeTab.setAttribute('aria-selected', 'false');
        next.classList.add('active');
        next.setAttribute('aria-selected', 'true');

        if (dropdown) {
          if (!element.parentNode.classList.contains('dropdown-menu')) {
            if (dropdown.classList.contains('active')) {
              dropdown.classList.remove('active');
            }
          } else {
            if (!dropdown.classList.contains('active')) {
              dropdown.classList.add('active');
            }
          }
        }

        if (activeContent.classList.contains('fade')) {
          activeContent.classList.remove('show');
          emulateTransitionEnd(activeContent, triggerHide);
        } else {
          triggerHide();
        }
      }
    };

    self.dispose = function () {
      element.removeEventListener('click', clickHandler, false);
      delete element.Tab;
    };

    element = queryElement(element);
    element.Tab && element.Tab.dispose();
    heightData = element.getAttribute('data-height');
    tabs = element.closest('.nav');
    dropdown = tabs && queryElement('.dropdown-toggle', tabs);
    animateHeight = !supportTransition || options.height === false || heightData === 'false' ? false : true;
    tabs.isAnimating = false;

    if (!element.Tab) {
      element.addEventListener('click', clickHandler, false);
    }

    if (animateHeight) {
      tabsContentContainer = getActiveContent().parentNode;
    }

    element.Tab = self;
  }

  function Toast(element, options) {
    options = options || {};
    var self = this,
        toast,
        timer = 0,
        animationData,
        autohideData,
        delayData,
        showCustomEvent,
        hideCustomEvent,
        shownCustomEvent,
        hiddenCustomEvent,
        ops = {};

    function showComplete() {
      toast.classList.remove('showing');
      toast.classList.add('show');
      dispatchCustomEvent.call(toast, shownCustomEvent);

      if (ops.autohide) {
        self.hide();
      }
    }

    function hideComplete() {
      toast.classList.add('hide');
      dispatchCustomEvent.call(toast, hiddenCustomEvent);
    }

    function close() {
      toast.classList.remove('show');
      ops.animation ? emulateTransitionEnd(toast, hideComplete) : hideComplete();
    }

    function disposeComplete() {
      clearTimeout(timer);
      element.removeEventListener('click', self.hide, false);
      delete element.Toast;
    }

    self.show = function () {
      if (toast && !toast.classList.contains('show')) {
        dispatchCustomEvent.call(toast, showCustomEvent);

        if (showCustomEvent.defaultPrevented) {
          return;
        }

        ops.animation && toast.classList.add('fade');
        toast.classList.remove('hide');
        toast.offsetWidth;
        toast.classList.add('showing');
        ops.animation ? emulateTransitionEnd(toast, showComplete) : showComplete();
      }
    };

    self.hide = function (noTimer) {
      if (toast && toast.classList.contains('show')) {
        dispatchCustomEvent.call(toast, hideCustomEvent);

        if (hideCustomEvent.defaultPrevented) {
          return;
        }

        noTimer ? close() : timer = setTimeout(close, ops.delay);
      }
    };

    self.dispose = function () {
      ops.animation ? emulateTransitionEnd(toast, disposeComplete) : disposeComplete();
    };

    element = queryElement(element);
    element.Toast && element.Toast.dispose();
    toast = element.closest('.toast');
    animationData = element.getAttribute('data-animation');
    autohideData = element.getAttribute('data-autohide');
    delayData = element.getAttribute('data-delay');
    showCustomEvent = bootstrapCustomEvent('show', 'toast');
    hideCustomEvent = bootstrapCustomEvent('hide', 'toast');
    shownCustomEvent = bootstrapCustomEvent('shown', 'toast');
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'toast');
    ops.animation = options.animation === false || animationData === 'false' ? 0 : 1;
    ops.autohide = options.autohide === false || autohideData === 'false' ? 0 : 1;
    ops.delay = parseInt(options.delay || delayData) || 500;

    if (!element.Toast) {
      element.addEventListener('click', self.hide, false);
    }

    element.Toast = self;
  }

  function Tooltip(element, options) {
    options = options || {};
    var self = this,
        tooltip = null,
        timer = 0,
        titleString,
        animationData,
        placementData,
        delayData,
        containerData,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent,
        containerElement,
        containerDataElement,
        modal,
        navbarFixedTop,
        navbarFixedBottom,
        placementClass,
        ops = {};

    function getTitle() {
      return element.getAttribute('title') || element.getAttribute('data-title') || element.getAttribute('data-original-title');
    }

    function removeToolTip() {
      ops.container.removeChild(tooltip);
      tooltip = null;
      timer = null;
    }

    function createToolTip() {
      titleString = getTitle();

      if (titleString) {
        tooltip = document.createElement('div');

        if (ops.template) {
          var tooltipMarkup = document.createElement('div');
          tooltipMarkup.innerHTML = ops.template.trim();
          tooltip.className = tooltipMarkup.firstChild.className;
          tooltip.innerHTML = tooltipMarkup.firstChild.innerHTML;
          queryElement('.tooltip-inner', tooltip).innerHTML = titleString.trim();
        } else {
          var tooltipArrow = document.createElement('div');
          tooltipArrow.classList.add('arrow');
          tooltip.appendChild(tooltipArrow);
          var tooltipInner = document.createElement('div');
          tooltipInner.classList.add('tooltip-inner');
          tooltip.appendChild(tooltipInner);
          tooltipInner.innerHTML = titleString;
        }

        tooltip.style.left = '0';
        tooltip.style.top = '0';
        tooltip.setAttribute('role', 'tooltip');
        !tooltip.classList.contains('tooltip') && tooltip.classList.add('tooltip');
        !tooltip.classList.contains(ops.animation) && tooltip.classList.add(ops.animation);
        !tooltip.classList.contains(placementClass) && tooltip.classList.add(placementClass);
        ops.container.appendChild(tooltip);
      }
    }

    function updateTooltip() {
      styleTip(element, tooltip, ops.placement, ops.container);
    }

    function showTooltip() {
      !tooltip.classList.contains('show') && tooltip.classList.add('show');
    }

    function touchHandler(e) {
      if (tooltip && tooltip.contains(e.target) || e.target === element || element.contains(e.target)) ;else {
        self.hide();
      }
    }

    function toggleAction(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      document[action]('touchstart', touchHandler, passiveHandler);
      window[action]('resize', self.hide, passiveHandler);
    }

    function showAction() {
      toggleAction(1);
      dispatchCustomEvent.call(element, shownCustomEvent);
    }

    function hideAction() {
      toggleAction();
      removeToolTip();
      dispatchCustomEvent.call(element, hiddenCustomEvent);
    }

    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action](mouseClickEvents.down, self.show, false);
      element[action](mouseHoverEvents[0], self.show, false);
      element[action](mouseHoverEvents[1], self.hide, false);
    }

    self.show = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (tooltip === null) {
          dispatchCustomEvent.call(element, showCustomEvent);

          if (showCustomEvent.defaultPrevented) {
            return;
          }

          if (createToolTip() !== false) {
            updateTooltip();
            showTooltip();
            !!ops.animation ? emulateTransitionEnd(tooltip, showAction) : showAction();
          }
        }
      }, 20);
    };

    self.hide = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (tooltip && tooltip.classList.contains('show')) {
          dispatchCustomEvent.call(element, hideCustomEvent);

          if (hideCustomEvent.defaultPrevented) {
            return;
          }

          tooltip.classList.remove('show');
          !!ops.animation ? emulateTransitionEnd(tooltip, hideAction) : hideAction();
        }
      }, ops.delay);
    };

    self.toggle = function () {
      if (!tooltip) {
        self.show();
      } else {
        self.hide();
      }
    };

    self.dispose = function () {
      toggleEvents();
      self.hide();
      element.setAttribute('title', element.getAttribute('data-original-title'));
      element.removeAttribute('data-original-title');
      delete element.Tooltip;
    };

    element = queryElement(element);
    element.Tooltip && element.Tooltip.dispose();
    animationData = element.getAttribute('data-animation');
    placementData = element.getAttribute('data-placement');
    delayData = element.getAttribute('data-delay');
    containerData = element.getAttribute('data-container');
    showCustomEvent = bootstrapCustomEvent('show', 'tooltip');
    shownCustomEvent = bootstrapCustomEvent('shown', 'tooltip');
    hideCustomEvent = bootstrapCustomEvent('hide', 'tooltip');
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'tooltip');
    containerElement = queryElement(options.container);
    containerDataElement = queryElement(containerData);
    modal = element.closest('.modal');
    navbarFixedTop = element.closest('.fixed-top');
    navbarFixedBottom = element.closest('.fixed-bottom');
    ops.animation = options.animation && options.animation !== 'fade' ? options.animation : animationData || 'fade';
    ops.placement = options.placement ? options.placement : placementData || 'top';
    ops.template = options.template ? options.template : null;
    ops.delay = parseInt(options.delay || delayData) || 200;
    ops.container = containerElement ? containerElement : containerDataElement ? containerDataElement : navbarFixedTop ? navbarFixedTop : navbarFixedBottom ? navbarFixedBottom : modal ? modal : document.body;
    placementClass = "bs-tooltip-" + ops.placement;
    titleString = getTitle();

    if (!titleString) {
      return;
    }

    if (!element.Tooltip) {
      element.setAttribute('data-original-title', titleString);
      element.removeAttribute('title');
      toggleEvents(1);
    }

    element.Tooltip = self;
  }

  var componentsInit = {};

  function initializeDataAPI(Constructor, collection) {
    Array.from(collection).map(function (x) {
      return new Constructor(x);
    });
  }

  function initCallback(lookUp) {
    lookUp = lookUp || document;

    for (var component in componentsInit) {
      initializeDataAPI(componentsInit[component][0], lookUp.querySelectorAll(componentsInit[component][1]));
    }
  }

  componentsInit.Alert = [Alert, '[data-dismiss="alert"]'];
  componentsInit.Button = [Button, '[data-toggle="buttons"]'];
  componentsInit.Carousel = [Carousel, '[data-ride="carousel"]'];
  componentsInit.Collapse = [Collapse, '[data-toggle="collapse"]'];
  componentsInit.Dropdown = [Dropdown, '[data-toggle="dropdown"]'];
  componentsInit.Modal = [Modal, '[data-toggle="modal"]'];
  componentsInit.Popover = [Popover, '[data-toggle="popover"],[data-tip="popover"]'];
  componentsInit.ScrollSpy = [ScrollSpy, '[data-spy="scroll"]'];
  componentsInit.Tab = [Tab, '[data-toggle="tab"]'];
  componentsInit.Toast = [Toast, '[data-dismiss="toast"]'];
  componentsInit.Tooltip = [Tooltip, '[data-toggle="tooltip"],[data-tip="tooltip"]'];
  document.body ? initCallback() : document.addEventListener('DOMContentLoaded', function initWrapper() {
    initCallback();
    document.removeEventListener('DOMContentLoaded', initWrapper, false);
  }, false);

  function removeElementDataAPI(ConstructorName, collection) {
    Array.from(collection).map(function (x) {
      return x[ConstructorName].dispose();
    });
  }

  function removeDataAPI(lookUp) {
    lookUp = lookUp || document;

    for (var component in componentsInit) {
      removeElementDataAPI(component, lookUp.querySelectorAll(componentsInit[component][1]));
    }
  }

  var version = "3.0.10";
  var index = {
    Alert: Alert,
    Button: Button,
    Carousel: Carousel,
    Collapse: Collapse,
    Dropdown: Dropdown,
    Modal: Modal,
    Popover: Popover,
    ScrollSpy: ScrollSpy,
    Tab: Tab,
    Toast: Toast,
    Tooltip: Tooltip,
    initCallback: initCallback,
    removeDataAPI: removeDataAPI,
    componentsInit: componentsInit,
    Version: version
  };

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _taggedTemplateLiteral(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var bind = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);

      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

      return fn.apply(thisArg, args);
    };
  };

  /*global toString:true*/
  // utils is a library of generic helper functions non-specific to axios


  var toString = Object.prototype.toString;
  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */

  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }
  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */


  function isUndefined(val) {
    return typeof val === 'undefined';
  }
  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */


  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }
  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */


  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }
  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */


  function isFormData(val) {
    return typeof FormData !== 'undefined' && val instanceof FormData;
  }
  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */


  function isArrayBufferView(val) {
    var result;

    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
      result = ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && val.buffer instanceof ArrayBuffer;
    }

    return result;
  }
  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */


  function isString(val) {
    return typeof val === 'string';
  }
  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */


  function isNumber(val) {
    return typeof val === 'number';
  }
  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */


  function isObject(val) {
    return val !== null && _typeof(val) === 'object';
  }
  /**
   * Determine if a value is a plain Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a plain Object, otherwise false
   */


  function isPlainObject(val) {
    if (toString.call(val) !== '[object Object]') {
      return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }
  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */


  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }
  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */


  function isFile(val) {
    return toString.call(val) === '[object File]';
  }
  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */


  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }
  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */


  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }
  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */


  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }
  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */


  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }
  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */


  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }
  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */


  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' || navigator.product === 'NativeScript' || navigator.product === 'NS')) {
      return false;
    }

    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */


  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    } // Force an array if not already something iterable


    if (_typeof(obj) !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }
  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */


  function merge()
  /* obj1, obj2, obj3, ... */
  {
    var result = {};

    function assignValue(val, key) {
      if (isPlainObject(result[key]) && isPlainObject(val)) {
        result[key] = merge(result[key], val);
      } else if (isPlainObject(val)) {
        result[key] = merge({}, val);
      } else if (isArray(val)) {
        result[key] = val.slice();
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }

    return result;
  }
  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */


  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }
  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   * @return {string} content value without BOM
   */


  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    return content;
  }

  var utils = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim,
    stripBOM: stripBOM
  };

  function encode(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+').replace(/%5B/gi, '[').replace(/%5D/gi, ']');
  }
  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */


  var buildURL = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;

    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];
      utils.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils.forEach(val, function parseValue(v) {
          if (utils.isDate(v)) {
            v = v.toISOString();
          } else if (utils.isObject(v)) {
            v = JSON.stringify(v);
          }

          parts.push(encode(key) + '=' + encode(v));
        });
      });
      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');

      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }

      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  function InterceptorManager() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */


  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */


  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */


  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */


  var transformData = function transformData(data, headers, fns) {
    /*eslint no-param-reassign:0*/
    utils.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });
    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */

  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;

    if (code) {
      error.code = code;
    }

    error.request = request;
    error.response = response;
    error.isAxiosError = true;

    error.toJSON = function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: this.config,
        code: this.code
      };
    };

    return error;
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */


  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */


  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;

    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError('Request failed with status code ' + response.status, response.config, null, response.request, response));
    }
  };

  var cookies = utils.isStandardBrowserEnv() ? // Standard browser envs support document.cookie
  function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },
      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match[3]) : null;
      },
      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  }() : // Non standard browser env (web workers, react-native) lack needed support.
  function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() {
        return null;
      },
      remove: function remove() {}
    };
  }();

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */

  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */

  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
  };

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @returns {string} The combined full path
   */


  var buildFullPath = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }

    return requestedURL;
  };

  // c.f. https://nodejs.org/api/http.html#http_message_headers


  var ignoreDuplicateOf = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'];
  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */

  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) {
      return parsed;
    }

    utils.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils.trim(line.substr(0, i)).toLowerCase();
      val = utils.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }

        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });
    return parsed;
  };

  var isURLSameOrigin = utils.isStandardBrowserEnv() ? // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;
    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */

    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href); // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils

      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);
    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */

    return function isURLSameOrigin(requestURL) {
      var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
      return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
    };
  }() : // Non standard browser envs (web workers, react-native) lack needed support.
  function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  }();

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;

      if (utils.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      if ((utils.isBlob(requestData) || utils.isFile(requestData)) && requestData.type) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest(); // HTTP basic authentication

      if (config.auth) {
        var username = config.auth.username || '';
        var password = unescape(encodeURIComponent(config.auth.password)) || '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }

      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true); // Set the request timeout in MS

      request.timeout = config.timeout; // Listen for ready state

      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        } // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request


        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        } // Prepare the response


        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };
        settle(resolve, reject, response); // Clean up request

        request = null;
      }; // Handle browser request cancellation (as opposed to a manual cancellation)


      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(createError('Request aborted', config, 'ECONNABORTED', request)); // Clean up request

        request = null;
      }; // Handle low level network errors


      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request)); // Clean up request

        request = null;
      }; // Handle timeout


      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';

        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }

        reject(createError(timeoutErrorMessage, config, 'ECONNABORTED', request)); // Clean up request

        request = null;
      }; // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.


      if (utils.isStandardBrowserEnv()) {
        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      } // Add headers to the request


      if ('setRequestHeader' in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      } // Add withCredentials to request if needed


      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      } // Add responseType to request if needed


      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      } // Handle progress if needed


      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      } // Not all browsers support upload events


      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken) {
        // Handle cancellation
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }

          request.abort();
          reject(cancel); // Clean up request

          request = null;
        });
      }

      if (!requestData) {
        requestData = null;
      } // Send the request


      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;

    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = xhr;
    }

    return adapter;
  }

  var defaults = {
    adapter: getDefaultAdapter(),
    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');

      if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
        return data;
      }

      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }

      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }

      if (utils.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }

      return data;
    }],
    transformResponse: [function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          /* Ignore */
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };
  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };
  utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });
  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });
  var defaults_1 = defaults;

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */


  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }
  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */


  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config); // Ensure headers exist

    config.headers = config.headers || {}; // Transform request data

    config.data = transformData(config.data, config.headers, config.transformRequest); // Flatten headers

    config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers);
    utils.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], function cleanHeaderConfig(method) {
      delete config.headers[method];
    });
    var adapter = config.adapter || defaults_1.adapter;
    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config); // Transform response data

      response.data = transformData(response.data, response.headers, config.transformResponse);
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config); // Transform response data

        if (reason && reason.response) {
          reason.response.data = transformData(reason.response.data, reason.response.headers, config.transformResponse);
        }
      }

      return Promise.reject(reason);
    });
  };

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */


  var mergeConfig = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};
    var valueFromConfig2Keys = ['url', 'method', 'data'];
    var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
    var defaultToConfig2Keys = ['baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer', 'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName', 'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress', 'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent', 'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'];
    var directMergeKeys = ['validateStatus'];

    function getMergedValue(target, source) {
      if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
        return utils.merge(target, source);
      } else if (utils.isPlainObject(source)) {
        return utils.merge({}, source);
      } else if (utils.isArray(source)) {
        return source.slice();
      }

      return source;
    }

    function mergeDeepProperties(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    }

    utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      }
    });
    utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);
    utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });
    utils.forEach(directMergeKeys, function merge(prop) {
      if (prop in config2) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (prop in config1) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });
    var axiosKeys = valueFromConfig2Keys.concat(mergeDeepPropertiesKeys).concat(defaultToConfig2Keys).concat(directMergeKeys);
    var otherKeys = Object.keys(config1).concat(Object.keys(config2)).filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });
    utils.forEach(otherKeys, mergeDeepProperties);
    return config;
  };

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */


  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */


  Axios.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }

    config = mergeConfig(this.defaults, config); // Set config.method

    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    } // Hook up interceptors middleware


    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  };

  Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  }; // Provide aliases for supported request methods


  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function (url, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        url: url
      }));
    };
  });
  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function (url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });
  var Axios_1 = Axios;

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */

  function Cancel(message) {
    this.message = message;
  }

  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel.prototype.__CANCEL__ = true;
  var Cancel_1 = Cancel;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */


  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `Cancel` if cancellation has been requested.
   */


  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */


  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */

  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */


  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind(Axios_1.prototype.request, context); // Copy axios.prototype to instance

    utils.extend(instance, Axios_1.prototype, context); // Copy context to instance

    utils.extend(instance, context);
    return instance;
  } // Create the default instance to be exported


  var axios = createInstance(defaults_1); // Expose Axios class to allow class inheritance

  axios.Axios = Axios_1; // Factory for creating new instances

  axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
  }; // Expose Cancel & CancelToken


  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel; // Expose all/spread

  axios.all = function all(promises) {
    return Promise.all(promises);
  };

  axios.spread = spread;
  var axios_1 = axios; // Allow use of default import syntax in TypeScript

  var _default = axios;
  axios_1["default"] = _default;

  var axios$1 = axios_1;

  var async_util_once = function once(fn) {
    return function () {
      if (fn === null) return;
      fn.apply(this, arguments);
      fn = null;
    };
  };

  var async_util_noop = function noop() {};

  var async_util_isarray = Array.isArray || function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  var async_util_isarraylike = function isArrayLike(arr) {
    return async_util_isarray(arr) || // has a positive integer length property
    typeof arr.length === 'number' && arr.length >= 0 && arr.length % 1 === 0;
  };

  var async_util_mapasync = function mapAsync(eachfn, arr, iterator, cb) {
    cb = async_util_once(cb || async_util_noop);
    arr = arr || [];
    var results = async_util_isarraylike(arr) ? [] : {};
    eachfn(arr, function (value, index, cb) {
      iterator(value, function (err, v) {
        results[index] = v;
        cb(err);
      });
    }, function (err) {
      cb(err, results);
    });
  };

  var async_util_onlyonce = function only_once(fn) {
    return function () {
      if (fn === null) throw new Error('Callback was already called.');
      fn.apply(this, arguments);
      fn = null;
    };
  };

  var async_util_keys = Object.keys || function keys(obj) {
    var _keys = [];

    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        _keys.push(k);
      }
    }

    return _keys;
  };

  var async_util_keyiterator = function keyIterator(coll) {
    var i = -1;
    var len;
    var keys;

    if (async_util_isarraylike(coll)) {
      len = coll.length;
      return function next() {
        i++;
        return i < len ? i : null;
      };
    } else {
      keys = async_util_keys(coll);
      len = keys.length;
      return function next() {
        i++;
        return i < len ? keys[i] : null;
      };
    }
  };

  var async_util_eachoflimit = function eachOfLimit(limit) {
    return function (obj, iterator, cb) {
      cb = async_util_once(cb || async_util_noop);
      obj = obj || [];
      var nextKey = async_util_keyiterator(obj);

      if (limit <= 0) {
        return cb(null);
      }

      var done = false;
      var running = 0;
      var errored = false;

      (function replenish() {
        if (done && running <= 0) {
          return cb(null);
        }

        while (running < limit && !errored) {
          var key = nextKey();

          if (key === null) {
            done = true;

            if (running <= 0) {
              cb(null);
            }

            return;
          }

          running += 1;
          iterator(obj[key], key, async_util_onlyonce(function (err) {
            running -= 1;

            if (err) {
              cb(err);
              errored = true;
            } else {
              replenish();
            }
          }));
        }
      })();
    };
  };

  var async_util_doparallellimit = function doParallelLimit(fn) {
    return function (obj, limit, iterator, cb) {
      return fn(async_util_eachoflimit(limit), obj, iterator, cb);
    };
  };

  var async_maplimit = async_util_doparallellimit(async_util_mapasync);

  /* eslint-disable no-template-curly-in-string */

  /* eslint-disable no-param-reassign */
  function attributeToString(attribute) {
    if (typeof attribute !== 'string') {
      attribute += '';

      if (attribute === 'undefined') {
        attribute = '';
      }
    }

    return attribute.trim();
  }
  function toggleClass(elem, className) {
    elem.classList.toggle(className);
  }
  function removeClass(elem) {
    var _elem$classList;

    for (var _len = arguments.length, classNames = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      classNames[_key - 1] = arguments[_key];
    }

    (_elem$classList = elem.classList).remove.apply(_elem$classList, classNames);

    return elem;
  }
  function dispatchCustomEvent$1(elem, eventName, properties) {
    elem.dispatchEvent(new CustomEvent(eventName, properties));
  }
  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }

    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || '${{amount}}';

    function formatWithDelimiters(number) {
      var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      var thousands = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ',';
      var decimal = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '.';

      if (Number.isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1".concat(thousands));
      var centsAmount = parts[1] ? decimal + parts[1] : '';
      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;

      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;

      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;

      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;

      default:
        value = formatWithDelimiters(cents, 2);
    }

    return formatString.replace(placeholderRegex, value);
  }
  function isNil(value) {
    return value === null || value === undefined;
  }
  function stringify(value) {
    return isNil(value) ? '' : String(value);
  }
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&#34;',
    "'": '&#39;'
  };
  var unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#34;': '"',
    '&#39;': "'"
  };
  function escape(str) {
    return stringify(str).replace(/&|<|>|"|'/g, function (m) {
      return escapeMap[m];
    });
  }
  function unescape$1(str) {
    return String(str).replace(/&(amp|lt|gt|#34|#39);/g, function (m) {
      return unescapeMap[m];
    });
  }
  var helper = {
    attributeToString: attributeToString,
    toggleClass: toggleClass,
    removeClass: removeClass,
    dispatchCustomEvent: dispatchCustomEvent$1,
    formatMoney: formatMoney,
    isNil: isNil,
    stringify: stringify,
    escape: escape,
    unescape: unescape$1
  };

  var instance = axios$1.create({
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  var ajaxTemplateFunc = function ajaxTemplateFunc(url) {
    var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'get';
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var config = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var encoded = encodeURI(url);
    var request;

    if (method === 'get') {
      request = instance.get(encoded, config);
    } else {
      request = instance.post(encoded, data, config);
    }

    return request.then(function (response) {
      return response.data;
    })["catch"](function (error) {
      return error && error.response && error.response.data;
    });
  }; // todo: urlencode


  var getCart = function getCart() {
    return ajaxTemplateFunc('/cart.js');
  };
  var getProduct = function getProduct(handle) {
    return ajaxTemplateFunc("/products/".concat(handle, ".js"));
  };
  var clearCart = function clearCart() {
    return ajaxTemplateFunc('/cart/clear.js', 'post');
  };
  var updateCartFromForm = function updateCartFromForm(form) {
    return ajaxTemplateFunc('/cart/update.js', 'post', new FormData(form));
  };
  var changeItemByKeyOrId = function changeItemByKeyOrId(id, quantity) {
    return ajaxTemplateFunc('/cart/change.js', 'post', {
      quantity: quantity,
      id: id
    });
  };
  var removeItemByKeyOrId = function removeItemByKeyOrId(id) {
    return ajaxTemplateFunc('/cart/change.js', 'post', {
      quantity: 0,
      id: id
    });
  };
  var changeItemByLine = function changeItemByLine(line, quantity, properties) {
    return ajaxTemplateFunc('/cart/change.js', 'post', {
      quantity: quantity,
      line: line,
      properties: properties
    });
  };
  var removeItemByLine = function removeItemByLine(line) {
    return ajaxTemplateFunc('/cart/change.js', 'post', {
      quantity: 0,
      line: line
    });
  };
  var addItem = function addItem(id, quantity) {
    var properties = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return ajaxTemplateFunc('/cart/add.js', 'post', {
      id: id,
      quantity: quantity,
      properties: properties
    });
  };
  var addItemFromForm = function addItemFromForm(form) {
    return ajaxTemplateFunc('/cart/add.js', 'post', new FormData(form));
  };
  var updateCartAttributes = function updateCartAttributes(attributes) {
    var data = '';

    if (Array.isArray(attributes)) {
      attributes.forEach(function (attribute) {
        var key = attributeToString(attribute.key);

        if (key !== '') {
          data += "attributes[".concat(key, "]=").concat(attributeToString(attribute.value), "&");
        }
      });
    } else if (_typeof(attributes) === 'object' && attributes !== null) {
      Object.keys(attributes).forEach(function (key) {
        var value = attributes[key];
        data += "attributes[".concat(attributeToString(key), "]=").concat(attributeToString(value), "&");
      });
    }

    return ajaxTemplateFunc('/cart/update.js', 'post', data);
  };
  var updateCartNote = function updateCartNote(note) {
    return ajaxTemplateFunc('/cart/update.js', 'post', "note=".concat(attributeToString(note)));
  };
  var getRecommendedProducts = function getRecommendedProducts(productId) {
    var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
    return ajaxTemplateFunc("/recommendations/products.json?product_id=".concat(productId, "&limit=").concat(limit && parseInt(limit, 10) > 0 && parseInt(limit, 10) <= 10 ? parseInt(limit, 10) : 10));
  };
  var getPredictiveSearchResults = function getPredictiveSearchResults(q) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['product', 'page', 'article', 'collection'];
    var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
    var unavailableProducts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'last';
    var fields = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ['title', 'product_type', 'variants.title', 'vendor'];
    var paramsString = '';
    paramsString += "q=".concat(q);
    paramsString += "&resources[type]=".concat(type.join(','));
    paramsString += "&resources[limit]=".concat(limit);
    paramsString += "&resources[options][unavailable_products]=".concat(unavailableProducts);
    paramsString += "&resources[options][fields]=".concat(fields.join(','));
    return ajaxTemplateFunc("/search/suggest.json?".concat(paramsString));
  };
  var _getPageCollection = function _getPageCollection(handle) {
    var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var tag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    return ajaxTemplateFunc(typeof tag !== 'string' || tag === '' ? "/collections/".concat(handle, "?view=theme&page=").concat(page) : "/collections/".concat(handle, "/").concat(tag, "?view=theme&page=").concat(page), 'get', {}, {
      headers: {
        accept: 'text/html'
      }
    });
  };
  var getCollection = function getCollection(handle) {
    var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    return new Promise(function (resolve) {
      var products_handles = [];
      var current_page = 1;

      var getPageCollection = function getPageCollection(handle, current_page, tag) {
        _getPageCollection(handle, current_page, tag).then(function (collection) {
          products_handles = [].concat(_toConsumableArray(products_handles), _toConsumableArray(collection.products_handles));

          if (collection.paginate.current_page < collection.paginate.pages) {
            current_page += 1;
            getPageCollection(handle, current_page, tag);
          } else {
            resolve(_objectSpread2(_objectSpread2({}, collection), {}, {
              products_handles: products_handles
            }));
          }
        });
      };

      getPageCollection(handle, current_page, tag);
    });
  };
  var getCollectionWithProductsDetails = function getCollectionWithProductsDetails(handle) {
    var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var productsLoadedCallback = arguments.length > 2 ? arguments[2] : undefined;
    return new Promise(function (resolve, reject) {
      getCollection(handle, tag).then(function (collection) {
        var productsHandles = collection.products_handles;
        var productsCount = productsHandles.length;
        var tmpProducts = [];
        var updatedCollection = collection;
        async_maplimit(productsHandles, 5, function (productHandle, callback) {
          getProduct(productHandle).then(function (product) {
            productsCount -= 1;
            tmpProducts.push(product);

            if (tmpProducts.length === 5 || productsCount === 0) {
              if (typeof productsLoadedCallback === 'function') {
                updatedCollection = _objectSpread2(_objectSpread2({}, collection), {}, {
                  products: [].concat(_toConsumableArray(updatedCollection.products || []), _toConsumableArray(tmpProducts))
                });
                productsLoadedCallback(updatedCollection);
              }

              tmpProducts = [];
            }

            return product;
          }).then(function (product) {
            callback(null, product);
          })["catch"](function (error) {
            callback(error);
          });
        }, function (err, results) {
          if (err) {
            reject(err);
          } else {
            collection.products = results;
            resolve(collection);
          }
        });
      });
    });
  };
  var apis = {
    getCart: getCart,
    getProduct: getProduct,
    clearCart: clearCart,
    updateCartFromForm: updateCartFromForm,
    changeItemByKeyOrId: changeItemByKeyOrId,
    removeItemByKeyOrId: removeItemByKeyOrId,
    changeItemByLine: changeItemByLine,
    removeItemByLine: removeItemByLine,
    addItem: addItem,
    addItemFromForm: addItemFromForm,
    updateCartAttributes: updateCartAttributes,
    updateCartNote: updateCartNote,
    getRecommendedProducts: getRecommendedProducts,
    getPredictiveSearchResults: getPredictiveSearchResults,
    _getPageCollection: _getPageCollection,
    getCollection: getCollection,
    getCollectionWithProductsDetails: getCollectionWithProductsDetails
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  		path: basedir,
  		exports: {},
  		require: function (path, base) {
  			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
  		}
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var glider = createCommonjsModule(function (module, exports) {
    /* @preserve
        _____ __ _     __                _
       / ___// /(_)___/ /___  ____      (_)___
      / (_ // // // _  // -_)/ __/_    / /(_-<
      \___//_//_/ \_,_/ \__//_/  (_)__/ //___/
                                  |___/
    
      Version: 1.7.3
      Author: Nick Piscitelli (pickykneee)
      Website: https://nickpiscitelli.com
      Documentation: http://nickpiscitelli.github.io/Glider.js
      License: MIT License
      Release Date: October 25th, 2018
    
    */

    /* global define */
    (function (factory) {
        module.exports = factory() ;
    })(function () {

      /* globals window:true */


      var _window = typeof window !== 'undefined' ? window : this;

      var Glider = _window.Glider = function (element, settings) {
        var _ = this;

        if (element._glider) return element._glider;
        _.ele = element;

        _.ele.classList.add('glider'); // expose glider object to its DOM element


        _.ele._glider = _; // merge user setting with defaults

        _.opt = Object.assign({}, {
          slidesToScroll: 1,
          slidesToShow: 1,
          resizeLock: true,
          duration: 0.5,
          // easeInQuad
          easing: function easing(x, t, b, c, d) {
            return c * (t /= d) * t + b;
          }
        }, settings); // set defaults

        _.animate_id = _.page = _.slide = 0;
        _.arrows = {}; // preserve original options to
        // extend breakpoint settings

        _._opt = _.opt;

        if (_.opt.skipTrack) {
          // first and only child is the track
          _.track = _.ele.children[0];
        } else {
          // create track and wrap slides
          _.track = document.createElement('div');

          _.ele.appendChild(_.track);

          while (_.ele.children.length !== 1) {
            _.track.appendChild(_.ele.children[0]);
          }
        }

        _.track.classList.add('glider-track'); // start glider


        _.init(); // set events


        _.resize = _.init.bind(_, true);

        _.event(_.ele, 'add', {
          scroll: _.updateControls.bind(_)
        });

        _.event(_window, 'add', {
          resize: _.resize
        });
      };

      var gliderPrototype = Glider.prototype;

      gliderPrototype.init = function (refresh, paging) {
        var _ = this;

        var width = 0;
        var height = 0;
        _.slides = _.track.children;
        [].forEach.call(_.slides, function (_) {
          _.classList.add('glider-slide');
        });
        _.containerWidth = _.ele.clientWidth;

        var breakpointChanged = _.settingsBreakpoint();

        if (!paging) paging = breakpointChanged;

        if (_.opt.slidesToShow === 'auto' || typeof _.opt._autoSlide !== 'undefined') {
          var slideCount = _.containerWidth / _.opt.itemWidth;
          _.opt._autoSlide = _.opt.slidesToShow = _.opt.exactWidth ? slideCount : Math.floor(slideCount);
        }

        if (_.opt.slidesToScroll === 'auto') {
          _.opt.slidesToScroll = Math.floor(_.opt.slidesToShow);
        }

        _.itemWidth = _.opt.exactWidth ? _.opt.itemWidth : _.containerWidth / _.opt.slidesToShow; // set slide dimensions

        [].forEach.call(_.slides, function (__) {
          __.style.height = 'auto';
          __.style.width = _.itemWidth + 'px';
          width += _.itemWidth;
          height = Math.max(__.offsetHeight, height);
        });
        _.track.style.width = width + 'px';
        _.trackWidth = width;
        _.isDrag = false;
        _.preventClick = false;
        _.opt.resizeLock && _.scrollTo(_.slide * _.itemWidth, 0);

        if (breakpointChanged || paging) {
          _.bindArrows();

          _.buildDots();

          _.bindDrag();
        }

        _.updateControls();

        _.emit(refresh ? 'refresh' : 'loaded');
      };

      gliderPrototype.bindDrag = function () {
        var _ = this;

        _.mouse = _.mouse || _.handleMouse.bind(_);

        var mouseup = function mouseup() {
          _.mouseDown = undefined;

          _.ele.classList.remove('drag');

          if (_.isDrag) {
            _.preventClick = true;
          }

          _.isDrag = false;
        };

        var events = {
          mouseup: mouseup,
          mouseleave: mouseup,
          mousedown: function mousedown(e) {
            e.preventDefault();
            e.stopPropagation();
            _.mouseDown = e.clientX;

            _.ele.classList.add('drag');
          },
          mousemove: _.mouse,
          click: function click(e) {
            if (_.preventClick) {
              e.preventDefault();
              e.stopPropagation();
            }

            _.preventClick = false;
          }
        };

        _.ele.classList.toggle('draggable', _.opt.draggable === true);

        _.event(_.ele, 'remove', events);

        if (_.opt.draggable) _.event(_.ele, 'add', events);
      };

      gliderPrototype.buildDots = function () {
        var _ = this;

        if (!_.opt.dots) {
          if (_.dots) _.dots.innerHTML = '';
          return;
        }

        if (typeof _.opt.dots === 'string') {
          _.dots = document.querySelector(_.opt.dots);
        } else _.dots = _.opt.dots;

        if (!_.dots) return;
        _.dots.innerHTML = '';

        _.dots.classList.add('glider-dots');

        for (var i = 0; i < Math.ceil(_.slides.length / _.opt.slidesToShow); ++i) {
          var dot = document.createElement('button');
          dot.dataset.index = i;
          dot.setAttribute('aria-label', 'Page ' + (i + 1));
          dot.className = 'glider-dot ' + (i ? '' : 'active');

          _.event(dot, 'add', {
            click: _.scrollItem.bind(_, i, true)
          });

          _.dots.appendChild(dot);
        }
      };

      gliderPrototype.bindArrows = function () {
        var _ = this;

        if (!_.opt.arrows) {
          Object.keys(_.arrows).forEach(function (direction) {
            var element = _.arrows[direction];

            _.event(element, 'remove', {
              click: element._func
            });
          });
          return;
        }

        ['prev', 'next'].forEach(function (direction) {
          var arrow = _.opt.arrows[direction];

          if (arrow) {
            if (typeof arrow === 'string') arrow = document.querySelector(arrow);
            arrow._func = arrow._func || _.scrollItem.bind(_, direction);

            _.event(arrow, 'remove', {
              click: arrow._func
            });

            _.event(arrow, 'add', {
              click: arrow._func
            });

            _.arrows[direction] = arrow;
          }
        });
      };

      gliderPrototype.updateControls = function (event) {
        var _ = this;

        if (event && !_.opt.scrollPropagate) {
          event.stopPropagation();
        }

        var disableArrows = _.containerWidth >= _.trackWidth;

        if (!_.opt.rewind) {
          if (_.arrows.prev) {
            _.arrows.prev.classList.toggle('disabled', _.ele.scrollLeft <= 0 || disableArrows);
          }

          if (_.arrows.next) {
            _.arrows.next.classList.toggle('disabled', Math.ceil(_.ele.scrollLeft + _.containerWidth) >= Math.floor(_.trackWidth) || disableArrows);
          }
        }

        _.slide = Math.round(_.ele.scrollLeft / _.itemWidth);
        _.page = Math.round(_.ele.scrollLeft / _.containerWidth);
        var middle = _.slide + Math.floor(Math.floor(_.opt.slidesToShow) / 2);
        var extraMiddle = Math.floor(_.opt.slidesToShow) % 2 ? 0 : middle + 1;

        if (Math.floor(_.opt.slidesToShow) === 1) {
          extraMiddle = 0;
        } // the last page may be less than one half of a normal page width so
        // the page is rounded down. when at the end, force the page to turn


        if (_.ele.scrollLeft + _.containerWidth >= Math.floor(_.trackWidth)) {
          _.page = _.dots ? _.dots.children.length - 1 : 0;
        }

        [].forEach.call(_.slides, function (slide, index) {
          var slideClasses = slide.classList;
          var wasVisible = slideClasses.contains('visible');
          var start = _.ele.scrollLeft;
          var end = _.ele.scrollLeft + _.containerWidth;
          var itemStart = _.itemWidth * index;
          var itemEnd = itemStart + _.itemWidth;
          [].forEach.call(slideClasses, function (className) {
            /^left|right/.test(className) && slideClasses.remove(className);
          });
          slideClasses.toggle('active', _.slide === index);

          if (middle === index || extraMiddle && extraMiddle === index) {
            slideClasses.add('center');
          } else {
            slideClasses.remove('center');
            slideClasses.add([index < middle ? 'left' : 'right', Math.abs(index - (index < middle ? middle : extraMiddle || middle))].join('-'));
          }

          var isVisible = Math.ceil(itemStart) >= start && Math.floor(itemEnd) <= end;
          slideClasses.toggle('visible', isVisible);

          if (isVisible !== wasVisible) {
            _.emit('slide-' + (isVisible ? 'visible' : 'hidden'), {
              slide: index
            });
          }
        });

        if (_.dots) {
          [].forEach.call(_.dots.children, function (dot, index) {
            dot.classList.toggle('active', _.page === index);
          });
        }

        if (event && _.opt.scrollLock) {
          clearTimeout(_.scrollLock);
          _.scrollLock = setTimeout(function () {
            clearTimeout(_.scrollLock); // dont attempt to scroll less than a pixel fraction - causes looping

            if (Math.abs(_.ele.scrollLeft / _.itemWidth - _.slide) > 0.02) {
              if (!_.mouseDown) {
                _.scrollItem(_.round(_.ele.scrollLeft / _.itemWidth));
              }
            }
          }, _.opt.scrollLockDelay || 250);
        }
      };

      gliderPrototype.scrollItem = function (slide, dot, e) {
        if (e) e.preventDefault();

        var _ = this;

        var originalSlide = slide;
        ++_.animate_id;

        if (dot === true) {
          slide = slide * _.containerWidth;
          slide = Math.round(slide / _.itemWidth) * _.itemWidth;
        } else {
          if (typeof slide === 'string') {
            var backwards = slide === 'prev'; // use precise location if fractional slides are on

            if (_.opt.slidesToScroll % 1 || _.opt.slidesToShow % 1) {
              slide = _.round(_.ele.scrollLeft / _.itemWidth);
            } else {
              slide = _.slide;
            }

            if (backwards) slide -= _.opt.slidesToScroll;else slide += _.opt.slidesToScroll;

            if (_.opt.rewind) {
              var scrollLeft = _.ele.scrollLeft;
              slide = backwards && !scrollLeft ? _.slides.length : !backwards && scrollLeft + _.containerWidth >= Math.floor(_.trackWidth) ? 0 : slide;
            }
          }

          slide = Math.max(Math.min(slide, _.slides.length), 0);
          _.slide = slide;
          slide = _.itemWidth * slide;
        }

        _.scrollTo(slide, _.opt.duration * Math.abs(_.ele.scrollLeft - slide), function () {
          _.updateControls();

          _.emit('animated', {
            value: originalSlide,
            type: typeof originalSlide === 'string' ? 'arrow' : dot ? 'dot' : 'slide'
          });
        });

        return false;
      };

      gliderPrototype.settingsBreakpoint = function () {
        var _ = this;

        var resp = _._opt.responsive;

        if (resp) {
          // Sort the breakpoints in mobile first order
          resp.sort(function (a, b) {
            return b.breakpoint - a.breakpoint;
          });

          for (var i = 0; i < resp.length; ++i) {
            var size = resp[i];

            if (_window.innerWidth >= size.breakpoint) {
              if (_.breakpoint !== size.breakpoint) {
                _.opt = Object.assign({}, _._opt, size.settings);
                _.breakpoint = size.breakpoint;
                return true;
              }

              return false;
            }
          }
        } // set back to defaults in case they were overriden


        var breakpointChanged = _.breakpoint !== 0;
        _.opt = Object.assign({}, _._opt);
        _.breakpoint = 0;
        return breakpointChanged;
      };

      gliderPrototype.scrollTo = function (scrollTarget, scrollDuration, callback) {
        var _ = this;

        var start = new Date().getTime();
        var animateIndex = _.animate_id;

        var animate = function animate() {
          var now = new Date().getTime() - start;
          _.ele.scrollLeft = _.ele.scrollLeft + (scrollTarget - _.ele.scrollLeft) * _.opt.easing(0, now, 0, 1, scrollDuration);

          if (now < scrollDuration && animateIndex === _.animate_id) {
            _window.requestAnimationFrame(animate);
          } else {
            _.ele.scrollLeft = scrollTarget;
            callback && callback.call(_);
          }
        };

        _window.requestAnimationFrame(animate);
      };

      gliderPrototype.removeItem = function (index) {
        var _ = this;

        if (_.slides.length) {
          _.track.removeChild(_.slides[index]);

          _.refresh(true);

          _.emit('remove');
        }
      };

      gliderPrototype.addItem = function (ele) {
        var _ = this;

        _.track.appendChild(ele);

        _.refresh(true);

        _.emit('add');
      };

      gliderPrototype.handleMouse = function (e) {
        var _ = this;

        if (_.mouseDown) {
          _.isDrag = true;
          _.ele.scrollLeft += (_.mouseDown - e.clientX) * (_.opt.dragVelocity || 3.3);
          _.mouseDown = e.clientX;
        }
      }; // used to round to the nearest 0.XX fraction


      gliderPrototype.round = function (_double) {
        var _ = this;

        var step = _.opt.slidesToScroll % 1 || 1;
        var inv = 1.0 / step;
        return Math.round(_double * inv) / inv;
      };

      gliderPrototype.refresh = function (paging) {
        var _ = this;

        _.init(true, paging);
      };

      gliderPrototype.setOption = function (opt, global) {
        var _ = this;

        if (_.breakpoint && !global) {
          _._opt.responsive.forEach(function (v) {
            if (v.breakpoint === _.breakpoint) {
              v.settings = Object.assign({}, v.settings, opt);
            }
          });
        } else {
          _._opt = Object.assign({}, _._opt, opt);
        }

        _.breakpoint = 0;

        _.settingsBreakpoint();
      };

      gliderPrototype.destroy = function () {
        var _ = this;

        var replace = _.ele.cloneNode(true);

        var clear = function clear(ele) {
          ele.removeAttribute('style');
          [].forEach.call(ele.classList, function (className) {
            /^glider/.test(className) && ele.classList.remove(className);
          });
        }; // remove track


        replace.children[0].outerHTML = replace.children[0].innerHTML;
        clear(replace);
        [].forEach.call(replace.getElementsByTagName('*'), clear);

        _.ele.parentNode.replaceChild(replace, _.ele);

        _.event(_window, 'remove', {
          resize: _.resize
        });

        _.emit('destroy');
      };

      gliderPrototype.emit = function (name, arg) {
        var _ = this;

        var e = new _window.CustomEvent('glider-' + name, {
          bubbles: !_.opt.eventPropagate,
          detail: arg
        });

        _.ele.dispatchEvent(e);
      };

      gliderPrototype.event = function (ele, type, args) {
        var eventHandler = ele[type + 'EventListener'].bind(ele);
        Object.keys(args).forEach(function (k) {
          eventHandler(k, args[k]);
        });
      };

      return Glider;
    });
  });

  window.addEventListener('load', function setupTestimonialSlider() {
    if (document.querySelector('.glider')) {
      // eslint-disable-next-line no-new
      new glider(document.querySelector('.glider'), {
        // Mobile-first defaults
        slidesToShow: 1,
        slidesToScroll: 1,
        scrollLock: true,
        dots: '#resp-dots',
        draggable: true,
        arrows: {
          prev: '.glider-prev',
          next: '.glider-next'
        },
        responsive: [{
          // screens greater than >= 775px
          breakpoint: 0,
          settings: {
            // Set to `auto` and provide item width to adjust to viewport
            slidesToShow: 1,
            slidesToScroll: 1,
            itemWidth: 300,
            duration: 1
          }
        }, {
          // screens greater than >= 1024px
          breakpoint: 540,
          settings: {
            slidesToShow: 'auto',
            slidesToScroll: 'auto',
            itemWidth: 300,
            duration: 1
          }
        }]
      });
    }
  });

  document.addEventListener('click', function (event) {
    var target = event.target;

    if (target.closest('.dropdown-menu')) {
      event.stopPropagation();
    } // class="navbar-toggler" data-trigger="#navbar_main"


    if (target.closest('.navbar-toggler[data-trigger]')) {
      event.preventDefault();
      event.stopPropagation();
      var offcanvasId = target.closest('.navbar-toggler[data-trigger]').getAttribute('data-trigger');
      var offcanvas = document.querySelector(offcanvasId);

      if (offcanvas) {
        toggleClass(offcanvas, 'show');
      }

      toggleClass(document.body, 'offcanvas-active');
      var screenOverlay = document.querySelector('.screen-overlay');

      if (screenOverlay) {
        toggleClass(screenOverlay, 'show');
      }
    }

    if (target.closest('.btn-close, .screen-overlay')) {
      var _screenOverlay = document.querySelector('.screen-overlay');

      if (_screenOverlay) {
        removeClass(_screenOverlay, 'show');
      }

      var mobileOffcanvas = document.querySelector('.mobile-offcanvas');

      if (mobileOffcanvas) {
        removeClass(mobileOffcanvas, 'show');
      }

      removeClass(document.body, 'offcanvas-active');
    }
  });

  var macy = createCommonjsModule(function (module, exports) {
    !function (t, n) {
       module.exports = n() ;
    }(commonjsGlobal, function () {

      function t(t, n) {
        var e = void 0;
        return function () {
          e && clearTimeout(e), e = setTimeout(t, n);
        };
      }

      function n(t, n) {
        for (var e = t.length, r = e, o = []; e--;) {
          o.push(n(t[r - e - 1]));
        }

        return o;
      }

      function e(t, n) {
        var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        if (window.Promise) return A(t, n, e);
        t.recalculate(!0, !0);
      }

      function r(t) {
        for (var n = t.options, e = t.responsiveOptions, r = t.keys, o = t.docWidth, i = void 0, s = 0; s < r.length; s++) {
          var a = parseInt(r[s], 10);
          o >= a && (i = n.breakAt[a], O(i, e));
        }

        return e;
      }

      function o(t) {
        for (var n = t.options, e = t.responsiveOptions, r = t.keys, o = t.docWidth, i = void 0, s = r.length - 1; s >= 0; s--) {
          var a = parseInt(r[s], 10);
          o <= a && (i = n.breakAt[a], O(i, e));
        }

        return e;
      }

      function i(t) {
        var n = t.useContainerForBreakpoints ? t.container.clientWidth : window.innerWidth,
            e = {
          columns: t.columns
        };
        b(t.margin) ? e.margin = {
          x: t.margin.x,
          y: t.margin.y
        } : e.margin = {
          x: t.margin,
          y: t.margin
        };
        var i = Object.keys(t.breakAt);
        return t.mobileFirst ? r({
          options: t,
          responsiveOptions: e,
          keys: i,
          docWidth: n
        }) : o({
          options: t,
          responsiveOptions: e,
          keys: i,
          docWidth: n
        });
      }

      function s(t) {
        return i(t).columns;
      }

      function a(t) {
        return i(t).margin;
      }

      function c(t) {
        var n = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
            e = s(t),
            r = a(t).x,
            o = 100 / e;
        if (!n) return o;
        if (1 === e) return "100%";
        var i = "px";

        if ("string" == typeof r) {
          var c = parseFloat(r);
          i = r.replace(c, ""), r = c;
        }

        return r = (e - 1) * r / e, "%" === i ? o - r + "%" : "calc(" + o + "% - " + r + i + ")";
      }

      function u(t, n) {
        var e = s(t.options),
            r = 0,
            o = void 0,
            i = void 0;
        if (1 === ++n) return 0;
        i = a(t.options).x;
        var u = "px";

        if ("string" == typeof i) {
          var l = parseFloat(i, 10);
          u = i.replace(l, ""), i = l;
        }

        return o = (i - (e - 1) * i / e) * (n - 1), r += c(t.options, !1) * (n - 1), "%" === u ? r + o + "%" : "calc(" + r + "% + " + o + u + ")";
      }

      function l(t) {
        var n = 0,
            e = t.container,
            r = t.rows;
        v(r, function (t) {
          n = t > n ? t : n;
        }), e.style.height = n + "px";
      }

      function p(t, n) {
        var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
            r = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3],
            o = s(t.options),
            i = a(t.options).y;
        M(t, o, e), v(n, function (n) {
          var e = 0,
              o = parseInt(n.offsetHeight, 10);
          isNaN(o) || (t.rows.forEach(function (n, r) {
            n < t.rows[e] && (e = r);
          }), n.style.position = "absolute", n.style.top = t.rows[e] + "px", n.style.left = "" + t.cols[e], t.rows[e] += isNaN(o) ? 0 : o + i, r && (n.dataset.macyComplete = 1));
        }), r && (t.tmpRows = null), l(t);
      }

      function f(t, n) {
        var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
            r = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3],
            o = s(t.options),
            i = a(t.options).y;
        M(t, o, e), v(n, function (n) {
          t.lastcol === o && (t.lastcol = 0);
          var e = C(n, "height");
          e = parseInt(n.offsetHeight, 10), isNaN(e) || (n.style.position = "absolute", n.style.top = t.rows[t.lastcol] + "px", n.style.left = "" + t.cols[t.lastcol], t.rows[t.lastcol] += isNaN(e) ? 0 : e + i, t.lastcol += 1, r && (n.dataset.macyComplete = 1));
        }), r && (t.tmpRows = null), l(t);
      }

      var h = function t(n, e) {
        if (!(this instanceof t)) return new t(n, e);
        if (n && n.nodeName) return n;
        if (n = n.replace(/^\s*/, "").replace(/\s*$/, ""), e) return this.byCss(n, e);

        for (var r in this.selectors) {
          if (e = r.split("/"), new RegExp(e[1], e[2]).test(n)) return this.selectors[r](n);
        }

        return this.byCss(n);
      };

      h.prototype.byCss = function (t, n) {
        return (n || document).querySelectorAll(t);
      }, h.prototype.selectors = {}, h.prototype.selectors[/^\.[\w\-]+$/] = function (t) {
        return document.getElementsByClassName(t.substring(1));
      }, h.prototype.selectors[/^\w+$/] = function (t) {
        return document.getElementsByTagName(t);
      }, h.prototype.selectors[/^\#[\w\-]+$/] = function (t) {
        return document.getElementById(t.substring(1));
      };

      var v = function v(t, n) {
        for (var e = t.length, r = e; e--;) {
          n(t[r - e - 1]);
        }
      },
          m = function m() {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        this.running = !1, this.events = [], this.add(t);
      };

      m.prototype.run = function () {
        if (!this.running && this.events.length > 0) {
          var t = this.events.shift();
          this.running = !0, t(), this.running = !1, this.run();
        }
      }, m.prototype.add = function () {
        var t = this,
            n = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        return !!n && (Array.isArray(n) ? v(n, function (n) {
          return t.add(n);
        }) : (this.events.push(n), void this.run()));
      }, m.prototype.clear = function () {
        this.events = [];
      };

      var d = function d(t) {
        var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        return this.instance = t, this.data = n, this;
      },
          y = function y() {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        this.events = {}, this.instance = t;
      };

      y.prototype.on = function () {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
            n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        return !(!t || !n) && (Array.isArray(this.events[t]) || (this.events[t] = []), this.events[t].push(n));
      }, y.prototype.emit = function () {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
            n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        if (!t || !Array.isArray(this.events[t])) return !1;
        var e = new d(this.instance, n);
        v(this.events[t], function (t) {
          return t(e);
        });
      };

      var g = function g(t) {
        return !("naturalHeight" in t && t.naturalHeight + t.naturalWidth === 0) || t.width + t.height !== 0;
      },
          E = function E(t, n) {
        var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        return new Promise(function (t, e) {
          if (n.complete) return g(n) ? t(n) : e(n);
          n.addEventListener("load", function () {
            return g(n) ? t(n) : e(n);
          }), n.addEventListener("error", function () {
            return e(n);
          });
        }).then(function (n) {
          e && t.emit(t.constants.EVENT_IMAGE_LOAD, {
            img: n
          });
        })["catch"](function (n) {
          return t.emit(t.constants.EVENT_IMAGE_ERROR, {
            img: n
          });
        });
      },
          w = function w(t, e) {
        var r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        return n(e, function (n) {
          return E(t, n, r);
        });
      },
          A = function A(t, n) {
        var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        return Promise.all(w(t, n, e)).then(function () {
          t.emit(t.constants.EVENT_IMAGE_COMPLETE);
        });
      },
          I = function I(n) {
        return t(function () {
          n.emit(n.constants.EVENT_RESIZE), n.queue.add(function () {
            return n.recalculate(!0, !0);
          });
        }, 100);
      },
          N = function N(t) {
        if (t.container = h(t.options.container), t.container instanceof h || !t.container) return !!t.options.debug && console.error("Error: Container not found");
        t.container.length && (t.container = t.container[0]), t.options.container = t.container, t.container.style.position = "relative";
      },
          T = function T(t) {
        t.queue = new m(), t.events = new y(t), t.rows = [], t.resizer = I(t);
      },
          L = function L(t) {
        var n = h("img", t.container);
        window.addEventListener("resize", t.resizer), t.on(t.constants.EVENT_IMAGE_LOAD, function () {
          return t.recalculate(!1, !1);
        }), t.on(t.constants.EVENT_IMAGE_COMPLETE, function () {
          return t.recalculate(!0, !0);
        }), t.options.useOwnImageLoader || e(t, n, !t.options.waitForImages), t.emit(t.constants.EVENT_INITIALIZED);
      },
          _ = function _(t) {
        N(t), T(t), L(t);
      },
          b = function b(t) {
        return t === Object(t) && "[object Array]" !== Object.prototype.toString.call(t);
      },
          O = function O(t, n) {
        b(t) || (n.columns = t), b(t) && t.columns && (n.columns = t.columns), b(t) && t.margin && !b(t.margin) && (n.margin = {
          x: t.margin,
          y: t.margin
        }), b(t) && t.margin && b(t.margin) && t.margin.x && (n.margin.x = t.margin.x), b(t) && t.margin && b(t.margin) && t.margin.y && (n.margin.y = t.margin.y);
      },
          C = function C(t, n) {
        return window.getComputedStyle(t, null).getPropertyValue(n);
      },
          M = function M(t, n) {
        var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];

        if (t.lastcol || (t.lastcol = 0), t.rows.length < 1 && (e = !0), e) {
          t.rows = [], t.cols = [], t.lastcol = 0;

          for (var r = n - 1; r >= 0; r--) {
            t.rows[r] = 0, t.cols[r] = u(t, r);
          }
        } else if (t.tmpRows) {
          t.rows = [];

          for (var r = n - 1; r >= 0; r--) {
            t.rows[r] = t.tmpRows[r];
          }
        } else {
          t.tmpRows = [];

          for (var r = n - 1; r >= 0; r--) {
            t.tmpRows[r] = t.rows[r];
          }
        }
      },
          V = function V(t) {
        var n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
            e = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2],
            r = n ? t.container.children : h(':scope > *:not([data-macy-complete="1"])', t.container);
        r = Array.from(r).filter(function (t) {
          return null !== t.offsetParent;
        });
        var o = c(t.options);
        return v(r, function (t) {
          n && (t.dataset.macyComplete = 0), t.style.width = o;
        }), t.options.trueOrder ? (f(t, r, n, e), t.emit(t.constants.EVENT_RECALCULATED)) : (p(t, r, n, e), t.emit(t.constants.EVENT_RECALCULATED));
      },
          R = function R() {
        return !!window.Promise;
      },
          x = Object.assign || function (t) {
        for (var n = 1; n < arguments.length; n++) {
          var e = arguments[n];

          for (var r in e) {
            Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
          }
        }

        return t;
      };

      Array.from || (Array.from = function (t) {
        for (var n = 0, e = []; n < t.length;) {
          e.push(t[n++]);
        }

        return e;
      });
      var k = {
        columns: 4,
        margin: 2,
        trueOrder: !1,
        waitForImages: !1,
        useImageLoader: !0,
        breakAt: {},
        useOwnImageLoader: !1,
        onInit: !1,
        cancelLegacy: !1,
        useContainerForBreakpoints: !1
      };
      !function () {
        try {
          document.createElement("a").querySelector(":scope *");
        } catch (t) {
          !function () {
            function t(t) {
              return function (e) {
                if (e && n.test(e)) {
                  var r = this.getAttribute("id");
                  r || (this.id = "q" + Math.floor(9e6 * Math.random()) + 1e6), arguments[0] = e.replace(n, "#" + this.id);
                  var o = t.apply(this, arguments);
                  return null === r ? this.removeAttribute("id") : r || (this.id = r), o;
                }

                return t.apply(this, arguments);
              };
            }

            var n = /:scope\b/gi,
                e = t(Element.prototype.querySelector);

            Element.prototype.querySelector = function (t) {
              return e.apply(this, arguments);
            };

            var r = t(Element.prototype.querySelectorAll);

            Element.prototype.querySelectorAll = function (t) {
              return r.apply(this, arguments);
            };
          }();
        }
      }();

      var q = function t() {
        var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : k;
        if (!(this instanceof t)) return new t(n);
        this.options = {}, x(this.options, k, n), this.options.cancelLegacy && !R() || _(this);
      };

      return q.init = function (t) {
        return console.warn("Depreciated: Macy.init will be removed in v3.0.0 opt to use Macy directly like so Macy({ /*options here*/ }) "), new q(t);
      }, q.prototype.recalculateOnImageLoad = function () {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        return e(this, h("img", this.container), !t);
      }, q.prototype.runOnImageLoad = function (t) {
        var n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
            r = h("img", this.container);
        return this.on(this.constants.EVENT_IMAGE_COMPLETE, t), n && this.on(this.constants.EVENT_IMAGE_LOAD, t), e(this, r, n);
      }, q.prototype.recalculate = function () {
        var t = this,
            n = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
            e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
        return e && this.queue.clear(), this.queue.add(function () {
          return V(t, n, e);
        });
      }, q.prototype.remove = function () {
        window.removeEventListener("resize", this.resizer), v(this.container.children, function (t) {
          t.removeAttribute("data-macy-complete"), t.removeAttribute("style");
        }), this.container.removeAttribute("style");
      }, q.prototype.reInit = function () {
        this.recalculate(!0, !0), this.emit(this.constants.EVENT_INITIALIZED), window.addEventListener("resize", this.resizer), this.container.style.position = "relative";
      }, q.prototype.on = function (t, n) {
        this.events.on(t, n);
      }, q.prototype.emit = function (t, n) {
        this.events.emit(t, n);
      }, q.constants = {
        EVENT_INITIALIZED: "macy.initialized",
        EVENT_RECALCULATED: "macy.recalculated",
        EVENT_IMAGE_LOAD: "macy.image.load",
        EVENT_IMAGE_ERROR: "macy.image.error",
        EVENT_IMAGE_COMPLETE: "macy.images.complete",
        EVENT_RESIZE: "macy.resize"
      }, q.prototype.constants = q.constants, q;
    });
  });

  if (document.querySelector('.index-section--masonry .images-wrapper')) {
    macy({
      container: '.index-section--masonry .images-wrapper',
      columns: 3,
      breakAt: {
        520: 2,
        400: 1
      }
    });
  }

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var directives = new WeakMap();
  var isDirective = function isDirective(o) {
    return typeof o === 'function' && directives.has(o);
  };

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */

  /**
   * True if the custom elements polyfill is in use.
   */
  var isCEPolyfill = typeof window !== 'undefined' && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== undefined;
  /**
   * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
   * `container`.
   */

  var removeNodes = function removeNodes(container, start) {
    var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    while (start !== end) {
      var n = start.nextSibling;
      container.removeChild(start);
      start = n;
    }
  };

  /**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */

  /**
   * A sentinel value that signals that a value was handled by a directive and
   * should not be written to the DOM.
   */
  var noChange = {};
  /**
   * A sentinel value that signals a NodePart to fully clear its content.
   */

  var nothing = {};

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */

  /**
   * An expression marker with embedded unique key to avoid collision with
   * possible text in templates.
   */
  var marker = "{{lit-".concat(String(Math.random()).slice(2), "}}");
  /**
   * An expression marker used text-positions, multi-binding attributes, and
   * attributes with markup-like text values.
   */

  var nodeMarker = "<!--".concat(marker, "-->");
  var markerRegex = new RegExp("".concat(marker, "|").concat(nodeMarker));
  /**
   * Suffix appended to all bound attribute names.
   */

  var boundAttributeSuffix = '$lit$';
  /**
   * An updatable Template that tracks the location of dynamic parts.
   */

  var Template = function Template(result, element) {
    _classCallCheck(this, Template);

    this.parts = [];
    this.element = element;
    var nodesToRemove = [];
    var stack = []; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

    var walker = document.createTreeWalker(element.content, 133
    /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
    , null, false); // Keeps track of the last index associated with a part. We try to delete
    // unnecessary nodes, but we never want to associate two different parts
    // to the same index. They must have a constant node between.

    var lastPartIndex = 0;
    var index = -1;
    var partIndex = 0;
    var strings = result.strings,
        length = result.values.length;

    while (partIndex < length) {
      var node = walker.nextNode();

      if (node === null) {
        // We've exhausted the content inside a nested template element.
        // Because we still have parts (the outer for-loop), we know:
        // - There is a template in the stack
        // - The walker will find a nextNode outside the template
        walker.currentNode = stack.pop();
        continue;
      }

      index++;

      if (node.nodeType === 1
      /* Node.ELEMENT_NODE */
      ) {
          if (node.hasAttributes()) {
            var attributes = node.attributes;
            var _length = attributes.length; // Per
            // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
            // attributes are not guaranteed to be returned in document order.
            // In particular, Edge/IE can return them out of order, so we cannot
            // assume a correspondence between part index and attribute index.

            var count = 0;

            for (var i = 0; i < _length; i++) {
              if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                count++;
              }
            }

            while (count-- > 0) {
              // Get the template literal section leading up to the first
              // expression in this attribute
              var stringForPart = strings[partIndex]; // Find the attribute name

              var name = lastAttributeNameRegex.exec(stringForPart)[2]; // Find the corresponding attribute
              // All bound attributes have had a suffix added in
              // TemplateResult#getHTML to opt out of special attribute
              // handling. To look up the attribute value we also need to add
              // the suffix.

              var attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
              var attributeValue = node.getAttribute(attributeLookupName);
              node.removeAttribute(attributeLookupName);
              var statics = attributeValue.split(markerRegex);
              this.parts.push({
                type: 'attribute',
                index: index,
                name: name,
                strings: statics
              });
              partIndex += statics.length - 1;
            }
          }

          if (node.tagName === 'TEMPLATE') {
            stack.push(node);
            walker.currentNode = node.content;
          }
        } else if (node.nodeType === 3
      /* Node.TEXT_NODE */
      ) {
          var data = node.data;

          if (data.indexOf(marker) >= 0) {
            var parent = node.parentNode;

            var _strings = data.split(markerRegex);

            var lastIndex = _strings.length - 1; // Generate a new text node for each literal section
            // These nodes are also used as the markers for node parts

            for (var _i = 0; _i < lastIndex; _i++) {
              var insert = void 0;
              var s = _strings[_i];

              if (s === '') {
                insert = createMarker();
              } else {
                var match = lastAttributeNameRegex.exec(s);

                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                  s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                }

                insert = document.createTextNode(s);
              }

              parent.insertBefore(insert, node);
              this.parts.push({
                type: 'node',
                index: ++index
              });
            } // If there's no text, we must insert a comment to mark our place.
            // Else, we can trust it will stick around after cloning.


            if (_strings[lastIndex] === '') {
              parent.insertBefore(createMarker(), node);
              nodesToRemove.push(node);
            } else {
              node.data = _strings[lastIndex];
            } // We have a part for each match found


            partIndex += lastIndex;
          }
        } else if (node.nodeType === 8
      /* Node.COMMENT_NODE */
      ) {
          if (node.data === marker) {
            var _parent = node.parentNode; // Add a new marker node to be the startNode of the Part if any of
            // the following are true:
            //  * We don't have a previousSibling
            //  * The previousSibling is already the start of a previous part

            if (node.previousSibling === null || index === lastPartIndex) {
              index++;

              _parent.insertBefore(createMarker(), node);
            }

            lastPartIndex = index;
            this.parts.push({
              type: 'node',
              index: index
            }); // If we don't have a nextSibling, keep this node so we have an end.
            // Else, we can remove it to save future costs.

            if (node.nextSibling === null) {
              node.data = '';
            } else {
              nodesToRemove.push(node);
              index--;
            }

            partIndex++;
          } else {
            var _i2 = -1;

            while ((_i2 = node.data.indexOf(marker, _i2 + 1)) !== -1) {
              // Comment node has a binding marker inside, make an inactive part
              // The binding won't work, but subsequent bindings will
              // TODO (justinfagnani): consider whether it's even worth it to
              // make bindings in comments work
              this.parts.push({
                type: 'node',
                index: -1
              });
              partIndex++;
            }
          }
        }
    } // Remove text binding nodes after the walk to not disturb the TreeWalker


    for (var _i3 = 0, _nodesToRemove = nodesToRemove; _i3 < _nodesToRemove.length; _i3++) {
      var n = _nodesToRemove[_i3];
      n.parentNode.removeChild(n);
    }
  };

  var endsWith = function endsWith(str, suffix) {
    var index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
  };

  var isTemplatePartActive = function isTemplatePartActive(part) {
    return part.index !== -1;
  }; // Allows `document.createComment('')` to be renamed for a
  // small manual size-savings.

  var createMarker = function createMarker() {
    return document.createComment('');
  };
  /**
   * This regex extracts the attribute name preceding an attribute-position
   * expression. It does this by matching the syntax allowed for attributes
   * against the string literal directly preceding the expression, assuming that
   * the expression is in an attribute-value position.
   *
   * See attributes in the HTML spec:
   * https://www.w3.org/TR/html5/syntax.html#elements-attributes
   *
   * " \x09\x0a\x0c\x0d" are HTML space characters:
   * https://www.w3.org/TR/html5/infrastructure.html#space-characters
   *
   * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
   * space character except " ".
   *
   * So an attribute is:
   *  * The name: any character except a control character, space character, ('),
   *    ("), ">", "=", or "/"
   *  * Followed by zero or more space characters
   *  * Followed by "="
   *  * Followed by zero or more space characters
   *  * Followed by:
   *    * Any character except space, ('), ("), "<", ">", "=", (`), or
   *    * (") then any non-("), or
   *    * (') then any non-(')
   */

  var lastAttributeNameRegex = // eslint-disable-next-line no-control-regex
  /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

  /**
   * An instance of a `Template` that can be attached to the DOM and updated
   * with new values.
   */

  var TemplateInstance = /*#__PURE__*/function () {
    function TemplateInstance(template, processor, options) {
      _classCallCheck(this, TemplateInstance);

      this.__parts = [];
      this.template = template;
      this.processor = processor;
      this.options = options;
    }

    _createClass(TemplateInstance, [{
      key: "update",
      value: function update(values) {
        var i = 0;

        var _iterator = _createForOfIteratorHelper(this.__parts),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var part = _step.value;

            if (part !== undefined) {
              part.setValue(values[i]);
            }

            i++;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        var _iterator2 = _createForOfIteratorHelper(this.__parts),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _part = _step2.value;

            if (_part !== undefined) {
              _part.commit();
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }, {
      key: "_clone",
      value: function _clone() {
        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        //     method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //    through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //    cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari does not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        var fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
        var stack = [];
        var parts = this.template.parts; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

        var walker = document.createTreeWalker(fragment, 133
        /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
        , null, false);
        var partIndex = 0;
        var nodeIndex = 0;
        var part;
        var node = walker.nextNode(); // Loop through all the nodes and parts of a template

        while (partIndex < parts.length) {
          part = parts[partIndex];

          if (!isTemplatePartActive(part)) {
            this.__parts.push(undefined);

            partIndex++;
            continue;
          } // Progress the tree walker until we find our next part's node.
          // Note that multiple parts may share the same node (attribute parts
          // on a single element), so this loop may not run at all.


          while (nodeIndex < part.index) {
            nodeIndex++;

            if (node.nodeName === 'TEMPLATE') {
              stack.push(node);
              walker.currentNode = node.content;
            }

            if ((node = walker.nextNode()) === null) {
              // We've exhausted the content inside a nested template element.
              // Because we still have parts (the outer for-loop), we know:
              // - There is a template in the stack
              // - The walker will find a nextNode outside the template
              walker.currentNode = stack.pop();
              node = walker.nextNode();
            }
          } // We've arrived at our part's node.


          if (part.type === 'node') {
            var _part2 = this.processor.handleTextExpression(this.options);

            _part2.insertAfterNode(node.previousSibling);

            this.__parts.push(_part2);
          } else {
            var _this$__parts;

            (_this$__parts = this.__parts).push.apply(_this$__parts, _toConsumableArray(this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options)));
          }

          partIndex++;
        }

        if (isCEPolyfill) {
          document.adoptNode(fragment);
          customElements.upgrade(fragment);
        }

        return fragment;
      }
    }]);

    return TemplateInstance;
  }();

  /**
   * Our TrustedTypePolicy for HTML which is declared using the html template
   * tag function.
   *
   * That HTML is a developer-authored constant, and is parsed with innerHTML
   * before any untrusted expressions have been mixed in. Therefor it is
   * considered safe by construction.
   */

  var policy = window.trustedTypes && trustedTypes.createPolicy('lit-html', {
    createHTML: function createHTML(s) {
      return s;
    }
  });
  var commentMarker = " ".concat(marker, " ");
  /**
   * The return type of `html`, which holds a Template and the values from
   * interpolated expressions.
   */

  var TemplateResult = /*#__PURE__*/function () {
    function TemplateResult(strings, values, type, processor) {
      _classCallCheck(this, TemplateResult);

      this.strings = strings;
      this.values = values;
      this.type = type;
      this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */


    _createClass(TemplateResult, [{
      key: "getHTML",
      value: function getHTML() {
        var l = this.strings.length - 1;
        var html = '';
        var isCommentBinding = false;

        for (var i = 0; i < l; i++) {
          var s = this.strings[i]; // For each binding we want to determine the kind of marker to insert
          // into the template source before it's parsed by the browser's HTML
          // parser. The marker type is based on whether the expression is in an
          // attribute, text, or comment position.
          //   * For node-position bindings we insert a comment with the marker
          //     sentinel as its text content, like <!--{{lit-guid}}-->.
          //   * For attribute bindings we insert just the marker sentinel for the
          //     first binding, so that we support unquoted attribute bindings.
          //     Subsequent bindings can use a comment marker because multi-binding
          //     attributes must be quoted.
          //   * For comment bindings we insert just the marker sentinel so we don't
          //     close the comment.
          //
          // The following code scans the template source, but is *not* an HTML
          // parser. We don't need to track the tree structure of the HTML, only
          // whether a binding is inside a comment, and if not, if it appears to be
          // the first binding in an attribute.

          var commentOpen = s.lastIndexOf('<!--'); // We're in comment position if we have a comment open with no following
          // comment close. Because <-- can appear in an attribute value there can
          // be false positives.

          isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf('-->', commentOpen + 1) === -1; // Check to see if we have an attribute-like sequence preceding the
          // expression. This can match "name=value" like structures in text,
          // comments, and attribute values, so there can be false-positives.

          var attributeMatch = lastAttributeNameRegex.exec(s);

          if (attributeMatch === null) {
            // We're only in this branch if we don't have a attribute-like
            // preceding sequence. For comments, this guards against unusual
            // attribute values like <div foo="<!--${'bar'}">. Cases like
            // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
            // below.
            html += s + (isCommentBinding ? commentMarker : nodeMarker);
          } else {
            // For attributes we use just a marker sentinel, and also append a
            // $lit$ suffix to the name to opt-out of attribute-specific parsing
            // that IE and Edge do for style and certain SVG attributes.
            html += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
          }
        }

        html += this.strings[l];
        return html;
      }
    }, {
      key: "getTemplateElement",
      value: function getTemplateElement() {
        var template = document.createElement('template');
        var value = this.getHTML();

        if (policy !== undefined) {
          // this is secure because `this.strings` is a TemplateStringsArray.
          // TODO: validate this when
          // https://github.com/tc39/proposal-array-is-template-object is
          // implemented.
          value = policy.createHTML(value);
        }

        template.innerHTML = value;
        return template;
      }
    }]);

    return TemplateResult;
  }();

  var isPrimitive = function isPrimitive(value) {
    return value === null || !(_typeof(value) === 'object' || typeof value === 'function');
  };
  var isIterable = function isIterable(value) {
    return Array.isArray(value) || // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(value && value[Symbol.iterator]);
  };
  /**
   * Writes attribute values to the DOM for a group of AttributeParts bound to a
   * single attribute. The value is only set once even if there are multiple parts
   * for an attribute.
   */

  var AttributeCommitter = /*#__PURE__*/function () {
    function AttributeCommitter(element, name, strings) {
      _classCallCheck(this, AttributeCommitter);

      this.dirty = true;
      this.element = element;
      this.name = name;
      this.strings = strings;
      this.parts = [];

      for (var i = 0; i < strings.length - 1; i++) {
        this.parts[i] = this._createPart();
      }
    }
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */


    _createClass(AttributeCommitter, [{
      key: "_createPart",
      value: function _createPart() {
        return new AttributePart(this);
      }
    }, {
      key: "_getValue",
      value: function _getValue() {
        var strings = this.strings;
        var l = strings.length - 1;
        var parts = this.parts; // If we're assigning an attribute via syntax like:
        //    attr="${foo}"  or  attr=${foo}
        // but not
        //    attr="${foo} ${bar}" or attr="${foo} baz"
        // then we don't want to coerce the attribute value into one long
        // string. Instead we want to just return the value itself directly,
        // so that sanitizeDOMValue can get the actual value rather than
        // String(value)
        // The exception is if v is an array, in which case we do want to smash
        // it together into a string without calling String() on the array.
        //
        // This also allows trusted values (when using TrustedTypes) being
        // assigned to DOM sinks without being stringified in the process.

        if (l === 1 && strings[0] === '' && strings[1] === '') {
          var v = parts[0].value;

          if (_typeof(v) === 'symbol') {
            return String(v);
          }

          if (typeof v === 'string' || !isIterable(v)) {
            return v;
          }
        }

        var text = '';

        for (var i = 0; i < l; i++) {
          text += strings[i];
          var part = parts[i];

          if (part !== undefined) {
            var _v = part.value;

            if (isPrimitive(_v) || !isIterable(_v)) {
              text += typeof _v === 'string' ? _v : String(_v);
            } else {
              var _iterator = _createForOfIteratorHelper(_v),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var t = _step.value;
                  text += typeof t === 'string' ? t : String(t);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }
          }
        }

        text += strings[l];
        return text;
      }
    }, {
      key: "commit",
      value: function commit() {
        if (this.dirty) {
          this.dirty = false;
          this.element.setAttribute(this.name, this._getValue());
        }
      }
    }]);

    return AttributeCommitter;
  }();
  /**
   * A Part that controls all or part of an attribute value.
   */

  var AttributePart = /*#__PURE__*/function () {
    function AttributePart(committer) {
      _classCallCheck(this, AttributePart);

      this.value = undefined;
      this.committer = committer;
    }

    _createClass(AttributePart, [{
      key: "setValue",
      value: function setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
          this.value = value; // If the value is a not a directive, dirty the committer so that it'll
          // call setAttribute. If the value is a directive, it'll dirty the
          // committer if it calls setValue().

          if (!isDirective(value)) {
            this.committer.dirty = true;
          }
        }
      }
    }, {
      key: "commit",
      value: function commit() {
        while (isDirective(this.value)) {
          var directive = this.value;
          this.value = noChange;
          directive(this);
        }

        if (this.value === noChange) {
          return;
        }

        this.committer.commit();
      }
    }]);

    return AttributePart;
  }();
  /**
   * A Part that controls a location within a Node tree. Like a Range, NodePart
   * has start and end locations and can set and update the Nodes between those
   * locations.
   *
   * NodeParts support several value types: primitives, Nodes, TemplateResults,
   * as well as arrays and iterables of those types.
   */

  var NodePart = /*#__PURE__*/function () {
    function NodePart(options) {
      _classCallCheck(this, NodePart);

      this.value = undefined;
      this.__pendingValue = undefined;
      this.options = options;
    }
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */


    _createClass(NodePart, [{
      key: "appendInto",
      value: function appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
      }
      /**
       * Inserts this part after the `ref` node (between `ref` and `ref`'s next
       * sibling). Both `ref` and its next sibling must be static, unchanging nodes
       * such as those that appear in a literal section of a template.
       *
       * This part must be empty, as its contents are not automatically moved.
       */

    }, {
      key: "insertAfterNode",
      value: function insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
      }
      /**
       * Appends this part into a parent part.
       *
       * This part must be empty, as its contents are not automatically moved.
       */

    }, {
      key: "appendIntoPart",
      value: function appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());

        part.__insert(this.endNode = createMarker());
      }
      /**
       * Inserts this part after the `ref` part.
       *
       * This part must be empty, as its contents are not automatically moved.
       */

    }, {
      key: "insertAfterPart",
      value: function insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());

        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
      }
    }, {
      key: "setValue",
      value: function setValue(value) {
        this.__pendingValue = value;
      }
    }, {
      key: "commit",
      value: function commit() {
        if (this.startNode.parentNode === null) {
          return;
        }

        while (isDirective(this.__pendingValue)) {
          var directive = this.__pendingValue;
          this.__pendingValue = noChange;
          directive(this);
        }

        var value = this.__pendingValue;

        if (value === noChange) {
          return;
        }

        if (isPrimitive(value)) {
          if (value !== this.value) {
            this.__commitText(value);
          }
        } else if (value instanceof TemplateResult) {
          this.__commitTemplateResult(value);
        } else if (value instanceof Node) {
          this.__commitNode(value);
        } else if (isIterable(value)) {
          this.__commitIterable(value);
        } else if (value === nothing) {
          this.value = nothing;
          this.clear();
        } else {
          // Fallback, will render the string representation
          this.__commitText(value);
        }
      }
    }, {
      key: "__insert",
      value: function __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
      }
    }, {
      key: "__commitNode",
      value: function __commitNode(value) {
        if (this.value === value) {
          return;
        }

        this.clear();

        this.__insert(value);

        this.value = value;
      }
    }, {
      key: "__commitText",
      value: function __commitText(value) {
        var node = this.startNode.nextSibling;
        value = value == null ? '' : value; // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.

        var valueAsString = typeof value === 'string' ? value : String(value);

        if (node === this.endNode.previousSibling && node.nodeType === 3
        /* Node.TEXT_NODE */
        ) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.data = valueAsString;
          } else {
          this.__commitNode(document.createTextNode(valueAsString));
        }

        this.value = value;
      }
    }, {
      key: "__commitTemplateResult",
      value: function __commitTemplateResult(value) {
        var template = this.options.templateFactory(value);

        if (this.value instanceof TemplateInstance && this.value.template === template) {
          this.value.update(value.values);
        } else {
          // Make sure we propagate the template processor from the TemplateResult
          // so that we use its syntax extension, etc. The template factory comes
          // from the render function options so that it can control template
          // caching and preprocessing.
          var instance = new TemplateInstance(template, value.processor, this.options);

          var fragment = instance._clone();

          instance.update(value.values);

          this.__commitNode(fragment);

          this.value = instance;
        }
      }
    }, {
      key: "__commitIterable",
      value: function __commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
          this.value = [];
          this.clear();
        } // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render


        var itemParts = this.value;
        var partIndex = 0;
        var itemPart;

        var _iterator2 = _createForOfIteratorHelper(value),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var item = _step2.value;
            // Try to reuse an existing part
            itemPart = itemParts[partIndex]; // If no existing part, create a new one

            if (itemPart === undefined) {
              itemPart = new NodePart(this.options);
              itemParts.push(itemPart);

              if (partIndex === 0) {
                itemPart.appendIntoPart(this);
              } else {
                itemPart.insertAfterPart(itemParts[partIndex - 1]);
              }
            }

            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        if (partIndex < itemParts.length) {
          // Truncate the parts array so _value reflects the current state
          itemParts.length = partIndex;
          this.clear(itemPart && itemPart.endNode);
        }
      }
    }, {
      key: "clear",
      value: function clear() {
        var startNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.startNode;
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
      }
    }]);

    return NodePart;
  }();
  /**
   * Implements a boolean attribute, roughly as defined in the HTML
   * specification.
   *
   * If the value is truthy, then the attribute is present with a value of
   * ''. If the value is falsey, the attribute is removed.
   */

  var BooleanAttributePart = /*#__PURE__*/function () {
    function BooleanAttributePart(element, name, strings) {
      _classCallCheck(this, BooleanAttributePart);

      this.value = undefined;
      this.__pendingValue = undefined;

      if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
        throw new Error('Boolean attributes can only contain a single expression');
      }

      this.element = element;
      this.name = name;
      this.strings = strings;
    }

    _createClass(BooleanAttributePart, [{
      key: "setValue",
      value: function setValue(value) {
        this.__pendingValue = value;
      }
    }, {
      key: "commit",
      value: function commit() {
        while (isDirective(this.__pendingValue)) {
          var directive = this.__pendingValue;
          this.__pendingValue = noChange;
          directive(this);
        }

        if (this.__pendingValue === noChange) {
          return;
        }

        var value = !!this.__pendingValue;

        if (this.value !== value) {
          if (value) {
            this.element.setAttribute(this.name, '');
          } else {
            this.element.removeAttribute(this.name);
          }

          this.value = value;
        }

        this.__pendingValue = noChange;
      }
    }]);

    return BooleanAttributePart;
  }();
  /**
   * Sets attribute values for PropertyParts, so that the value is only set once
   * even if there are multiple parts for a property.
   *
   * If an expression controls the whole property value, then the value is simply
   * assigned to the property under control. If there are string literals or
   * multiple expressions, then the strings are expressions are interpolated into
   * a string first.
   */

  var PropertyCommitter = /*#__PURE__*/function (_AttributeCommitter) {
    _inherits(PropertyCommitter, _AttributeCommitter);

    var _super = _createSuper(PropertyCommitter);

    function PropertyCommitter(element, name, strings) {
      var _this;

      _classCallCheck(this, PropertyCommitter);

      _this = _super.call(this, element, name, strings);
      _this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
      return _this;
    }

    _createClass(PropertyCommitter, [{
      key: "_createPart",
      value: function _createPart() {
        return new PropertyPart(this);
      }
    }, {
      key: "_getValue",
      value: function _getValue() {
        if (this.single) {
          return this.parts[0].value;
        }

        return _get(_getPrototypeOf(PropertyCommitter.prototype), "_getValue", this).call(this);
      }
    }, {
      key: "commit",
      value: function commit() {
        if (this.dirty) {
          this.dirty = false; // eslint-disable-next-line @typescript-eslint/no-explicit-any

          this.element[this.name] = this._getValue();
        }
      }
    }]);

    return PropertyCommitter;
  }(AttributeCommitter);
  var PropertyPart = /*#__PURE__*/function (_AttributePart) {
    _inherits(PropertyPart, _AttributePart);

    var _super2 = _createSuper(PropertyPart);

    function PropertyPart() {
      _classCallCheck(this, PropertyPart);

      return _super2.apply(this, arguments);
    }

    return PropertyPart;
  }(AttributePart); // Detect event listener options support. If the `capture` property is read
  // from the options object, then options are supported. If not, then the third
  // argument to add/removeEventListener is interpreted as the boolean capture
  // value so we should only pass the `capture` property.

  var eventOptionsSupported = false; // Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
  // blocks right into the body of a module

  (function () {
    try {
      var options = {
        get capture() {
          eventOptionsSupported = true;
          return false;
        }

      }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

      window.addEventListener('test', options, options); // eslint-disable-next-line @typescript-eslint/no-explicit-any

      window.removeEventListener('test', options, options);
    } catch (_e) {// event options not supported
    }
  })();

  var EventPart = /*#__PURE__*/function () {
    function EventPart(element, eventName, eventContext) {
      var _this2 = this;

      _classCallCheck(this, EventPart);

      this.value = undefined;
      this.__pendingValue = undefined;
      this.element = element;
      this.eventName = eventName;
      this.eventContext = eventContext;

      this.__boundHandleEvent = function (e) {
        return _this2.handleEvent(e);
      };
    }

    _createClass(EventPart, [{
      key: "setValue",
      value: function setValue(value) {
        this.__pendingValue = value;
      }
    }, {
      key: "commit",
      value: function commit() {
        while (isDirective(this.__pendingValue)) {
          var directive = this.__pendingValue;
          this.__pendingValue = noChange;
          directive(this);
        }

        if (this.__pendingValue === noChange) {
          return;
        }

        var newListener = this.__pendingValue;
        var oldListener = this.value;
        var shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
        var shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);

        if (shouldRemoveListener) {
          this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }

        if (shouldAddListener) {
          this.__options = getOptions(newListener);
          this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }

        this.value = newListener;
        this.__pendingValue = noChange;
      }
    }, {
      key: "handleEvent",
      value: function handleEvent(event) {
        if (typeof this.value === 'function') {
          this.value.call(this.eventContext || this.element, event);
        } else {
          this.value.handleEvent(event);
        }
      }
    }]);

    return EventPart;
  }(); // We copy options because of the inconsistent behavior of browsers when reading
  // the third argument of add/removeEventListener. IE11 doesn't support options
  // at all. Chrome 41 only reads `capture` if the argument is an object.

  var getOptions = function getOptions(o) {
    return o && (eventOptionsSupported ? {
      capture: o.capture,
      passive: o.passive,
      once: o.once
    } : o.capture);
  };

  /**
   * Creates Parts when a template is instantiated.
   */

  var DefaultTemplateProcessor = /*#__PURE__*/function () {
    function DefaultTemplateProcessor() {
      _classCallCheck(this, DefaultTemplateProcessor);
    }

    _createClass(DefaultTemplateProcessor, [{
      key: "handleAttributeExpressions",

      /**
       * Create parts for an attribute-position binding, given the event, attribute
       * name, and string literals.
       *
       * @param element The element containing the binding
       * @param name  The attribute name
       * @param strings The string literals. There are always at least two strings,
       *   event for fully-controlled bindings with a single expression.
       */
      value: function handleAttributeExpressions(element, name, strings, options) {
        var prefix = name[0];

        if (prefix === '.') {
          var _committer = new PropertyCommitter(element, name.slice(1), strings);

          return _committer.parts;
        }

        if (prefix === '@') {
          return [new EventPart(element, name.slice(1), options.eventContext)];
        }

        if (prefix === '?') {
          return [new BooleanAttributePart(element, name.slice(1), strings)];
        }

        var committer = new AttributeCommitter(element, name, strings);
        return committer.parts;
      }
      /**
       * Create parts for a text-position binding.
       * @param templateFactory
       */

    }, {
      key: "handleTextExpression",
      value: function handleTextExpression(options) {
        return new NodePart(options);
      }
    }]);

    return DefaultTemplateProcessor;
  }();
  var defaultTemplateProcessor = new DefaultTemplateProcessor();

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * The default TemplateFactory which caches Templates keyed on
   * result.type and result.strings.
   */

  function templateFactory(result) {
    var templateCache = templateCaches.get(result.type);

    if (templateCache === undefined) {
      templateCache = {
        stringsArray: new WeakMap(),
        keyString: new Map()
      };
      templateCaches.set(result.type, templateCache);
    }

    var template = templateCache.stringsArray.get(result.strings);

    if (template !== undefined) {
      return template;
    } // If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content


    var key = result.strings.join(marker); // Check if we already have a Template for this key

    template = templateCache.keyString.get(key);

    if (template === undefined) {
      // If we have not seen this key before, create a new Template
      template = new Template(result, result.getTemplateElement()); // Cache the Template for this key

      templateCache.keyString.set(key, template);
    } // Cache all future queries for this TemplateStringsArray


    templateCache.stringsArray.set(result.strings, template);
    return template;
  }
  var templateCaches = new Map();

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var parts = new WeakMap();
  /**
   * Renders a template result or other value to a container.
   *
   * To update a container with new values, reevaluate the template literal and
   * call `render` with the new result.
   *
   * @param result Any value renderable by NodePart - typically a TemplateResult
   *     created by evaluating a template tag like `html` or `svg`.
   * @param container A DOM parent to render to. The entire contents are either
   *     replaced, or efficiently updated if the same result type was previous
   *     rendered there.
   * @param options RenderOptions for the entire render tree rendered to this
   *     container. Render options must *not* change between renders to the same
   *     container, as those changes will not effect previously rendered DOM.
   */

  var render = function render(result, container, options) {
    var part = parts.get(container);

    if (part === undefined) {
      removeNodes(container, container.firstChild);
      parts.set(container, part = new NodePart(Object.assign({
        templateFactory: templateFactory
      }, options)));
      part.appendInto(container);
    }

    part.setValue(result);
    part.commit();
  };

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // This line will be used in regexes to search for lit-html usage.
  // TODO(justinfagnani): inject version number at build time

  if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.3.0');
  }
  /**
   * Interprets a template literal as an HTML template that can efficiently
   * render to and update a container.
   */


  var html = function html(strings) {
    for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }

    return new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
  };

  var current;
  var currentId = 0;

  function setCurrent(state) {
    current = state;
  }

  function clear() {
    current = null;
    currentId = 0;
  }

  function notify() {
    return currentId++;
  }

  var phaseSymbol = Symbol('haunted.phase');
  var hookSymbol = Symbol('haunted.hook');
  var updateSymbol = Symbol('haunted.update');
  var commitSymbol = Symbol('haunted.commit');
  var effectsSymbol = Symbol('haunted.effects');
  var layoutEffectsSymbol = Symbol('haunted.layoutEffects');
  var contextEvent = 'haunted.context';

  var State = /*#__PURE__*/function () {
    function State(update, host) {
      _classCallCheck(this, State);

      this.update = update;
      this.host = host;
      this[hookSymbol] = new Map();
      this[effectsSymbol] = [];
      this[layoutEffectsSymbol] = [];
    }

    _createClass(State, [{
      key: "run",
      value: function run(cb) {
        setCurrent(this);
        var res = cb();
        clear();
        return res;
      }
    }, {
      key: "_runEffects",
      value: function _runEffects(phase) {
        var effects = this[phase];
        setCurrent(this);

        var _iterator = _createForOfIteratorHelper(effects),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var effect = _step.value;
            effect.call(this);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        clear();
      }
    }, {
      key: "runEffects",
      value: function runEffects() {
        this._runEffects(effectsSymbol);
      }
    }, {
      key: "runLayoutEffects",
      value: function runLayoutEffects() {
        this._runEffects(layoutEffectsSymbol);
      }
    }, {
      key: "teardown",
      value: function teardown() {
        var hooks = this[hookSymbol];
        hooks.forEach(function (hook) {
          if (typeof hook.teardown === 'function') {
            hook.teardown();
          }
        });
      }
    }]);

    return State;
  }();

  var defer = Promise.resolve().then.bind(Promise.resolve());

  function runner() {
    var tasks = [];
    var id;

    function runTasks() {
      id = null;
      var t = tasks;
      tasks = [];

      for (var i = 0, len = t.length; i < len; i++) {
        t[i]();
      }
    }

    return function (task) {
      tasks.push(task);

      if (id == null) {
        id = defer(runTasks);
      }
    };
  }

  var read = runner();
  var write = runner();

  var BaseScheduler = /*#__PURE__*/function () {
    function BaseScheduler(renderer, host) {
      _classCallCheck(this, BaseScheduler);

      this.renderer = renderer;
      this.host = host;
      this.state = new State(this.update.bind(this), host);
      this[phaseSymbol] = null;
      this._updateQueued = false;
    }

    _createClass(BaseScheduler, [{
      key: "update",
      value: function update() {
        var _this = this;

        if (this._updateQueued) return;
        read(function () {
          var result = _this.handlePhase(updateSymbol);

          write(function () {
            _this.handlePhase(commitSymbol, result);

            write(function () {
              _this.handlePhase(effectsSymbol);
            });
          });
          _this._updateQueued = false;
        });
        this._updateQueued = true;
      }
    }, {
      key: "handlePhase",
      value: function handlePhase(phase, arg) {
        this[phaseSymbol] = phase;

        switch (phase) {
          case commitSymbol:
            this.commit(arg);
            this.runEffects(layoutEffectsSymbol);
            return;

          case updateSymbol:
            return this.render();

          case effectsSymbol:
            return this.runEffects(effectsSymbol);
        }

        this[phaseSymbol] = null;
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        return this.state.run(function () {
          return _this2.renderer.call(_this2.host, _this2.host);
        });
      }
    }, {
      key: "runEffects",
      value: function runEffects(phase) {
        this.state._runEffects(phase);
      }
    }, {
      key: "teardown",
      value: function teardown() {
        this.state.teardown();
      }
    }]);

    return BaseScheduler;
  }();

  var toCamelCase = function toCamelCase() {
    var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return val.replace(/-+([a-z])?/g, function (_, _char) {
      return _char ? _char.toUpperCase() : '';
    });
  };

  function makeComponent(render) {
    var Scheduler = /*#__PURE__*/function (_BaseScheduler) {
      _inherits(Scheduler, _BaseScheduler);

      var _super = _createSuper(Scheduler);

      function Scheduler(renderer, frag, host) {
        var _this;

        _classCallCheck(this, Scheduler);

        _this = _super.call(this, renderer, host || frag);
        _this.frag = frag;
        return _this;
      }

      _createClass(Scheduler, [{
        key: "commit",
        value: function commit(result) {
          render(result, this.frag);
        }
      }]);

      return Scheduler;
    }(BaseScheduler);

    function component(renderer, baseElementOrOptions, options) {
      var BaseElement = (options || baseElementOrOptions || {}).baseElement || HTMLElement;

      var _ref = options || baseElementOrOptions || {},
          _ref$observedAttribut = _ref.observedAttributes,
          observedAttributes = _ref$observedAttribut === void 0 ? [] : _ref$observedAttribut,
          _ref$useShadowDOM = _ref.useShadowDOM,
          useShadowDOM = _ref$useShadowDOM === void 0 ? true : _ref$useShadowDOM,
          _ref$shadowRootInit = _ref.shadowRootInit,
          shadowRootInit = _ref$shadowRootInit === void 0 ? {} : _ref$shadowRootInit;

      var Element = /*#__PURE__*/function (_BaseElement) {
        _inherits(Element, _BaseElement);

        var _super2 = _createSuper(Element);

        function Element() {
          var _this2;

          _classCallCheck(this, Element);

          _this2 = _super2.call(this);

          if (useShadowDOM === false) {
            _this2._scheduler = new Scheduler(renderer, _assertThisInitialized(_this2));
          } else {
            _this2.attachShadow(_objectSpread2({
              mode: 'open'
            }, shadowRootInit));

            _this2._scheduler = new Scheduler(renderer, _this2.shadowRoot, _assertThisInitialized(_this2));
          }

          return _this2;
        }

        _createClass(Element, [{
          key: "connectedCallback",
          value: function connectedCallback() {
            this._scheduler.update();
          }
        }, {
          key: "disconnectedCallback",
          value: function disconnectedCallback() {
            this._scheduler.teardown();
          }
        }, {
          key: "attributeChangedCallback",
          value: function attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) {
              return;
            }

            var val = newValue === '' ? true : newValue;
            Reflect.set(this, toCamelCase(name), val);
          }
        }], [{
          key: "observedAttributes",
          get: function get() {
            return renderer.observedAttributes || observedAttributes || [];
          }
        }]);

        return Element;
      }(BaseElement);

      function reflectiveProp(initialValue) {
        var value = initialValue;
        return Object.freeze({
          enumerable: true,
          configurable: true,
          get: function get() {
            return value;
          },
          set: function set(newValue) {
            value = newValue;

            this._scheduler.update();
          }
        });
      }

      var proto = new Proxy(BaseElement.prototype, {
        getPrototypeOf: function getPrototypeOf(target) {
          return target;
        },
        set: function set(target, key, value, receiver) {
          var desc;

          if (key in target) {
            desc = Object.getOwnPropertyDescriptor(target, key);

            if (desc && desc.set) {
              desc.set.call(receiver, value);
              return true;
            }

            Reflect.set(target, key, value);
          }

          if (_typeof(key) === 'symbol' || key[0] === '_') {
            desc = {
              enumerable: true,
              configurable: true,
              writable: true,
              value: value
            };
          } else {
            desc = reflectiveProp(value);
          }

          Object.defineProperty(receiver, key, desc);

          if (desc.set) {
            desc.set.call(receiver, value);
          }

          return true;
        }
      });
      Object.setPrototypeOf(Element.prototype, proto);
      return Element;
    }

    return component;
  }

  var Hook = function Hook(id, state) {
    _classCallCheck(this, Hook);

    this.id = id;
    this.state = state;
  };

  function use(Hook) {
    var _hook;

    var id = notify();
    var hooks = current[hookSymbol];
    var hook = hooks.get(id);

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (!hook) {
      hook = _construct(Hook, [id, current].concat(args));
      hooks.set(id, hook);
    }

    return (_hook = hook).update.apply(_hook, args);
  }

  function hook(Hook) {
    return use.bind(null, Hook);
  }

  function createEffect(setEffects) {
    return hook( /*#__PURE__*/function (_Hook) {
      _inherits(_class, _Hook);

      var _super = _createSuper(_class);

      function _class(id, state, ignored1, ignored2) {
        var _this;

        _classCallCheck(this, _class);

        _this = _super.call(this, id, state);
        setEffects(state, _assertThisInitialized(_this));
        return _this;
      }

      _createClass(_class, [{
        key: "update",
        value: function update(callback, values) {
          this.callback = callback;
          this.lastValues = this.values;
          this.values = values;
        }
      }, {
        key: "call",
        value: function call() {
          if (!this.values || this.hasChanged()) {
            this.run();
          }
        }
      }, {
        key: "run",
        value: function run() {
          this.teardown();
          this._teardown = this.callback.call(this.state);
        }
      }, {
        key: "teardown",
        value: function teardown() {
          if (typeof this._teardown === 'function') {
            this._teardown();
          }
        }
      }, {
        key: "hasChanged",
        value: function hasChanged() {
          var _this2 = this;

          return !this.lastValues || this.values.some(function (value, i) {
            return _this2.lastValues[i] !== value;
          });
        }
      }]);

      return _class;
    }(Hook));
  }

  function setEffects(state, cb) {
    state[effectsSymbol].push(cb);
  }

  var useEffect = createEffect(setEffects);

  var useContext = hook( /*#__PURE__*/function (_Hook) {
    _inherits(_class, _Hook);

    var _super = _createSuper(_class);

    function _class(id, state, _) {
      var _this;

      _classCallCheck(this, _class);

      _this = _super.call(this, id, state);
      _this._updater = _this._updater.bind(_assertThisInitialized(_this));
      _this._ranEffect = false;
      _this._unsubscribe = null;
      setEffects(state, _assertThisInitialized(_this));
      return _this;
    }

    _createClass(_class, [{
      key: "update",
      value: function update(Context) {
        if (this.state.virtual) {
          throw new Error('can\'t be used with virtual components');
        }

        if (this.Context !== Context) {
          this._subscribe(Context);

          this.Context = Context;
        }

        return this.value;
      }
    }, {
      key: "call",
      value: function call() {
        if (!this._ranEffect) {
          this._ranEffect = true;
          if (this._unsubscribe) this._unsubscribe();

          this._subscribe(this.Context);

          this.state.update();
        }
      }
    }, {
      key: "_updater",
      value: function _updater(value) {
        this.value = value;
        this.state.update();
      }
    }, {
      key: "_subscribe",
      value: function _subscribe(Context) {
        var detail = {
          Context: Context,
          callback: this._updater
        };
        this.state.host.dispatchEvent(new CustomEvent(contextEvent, {
          detail: detail,
          bubbles: true,
          cancelable: true,
          composed: true
        }));
        var unsubscribe = detail.unsubscribe,
            value = detail.value;
        this.value = unsubscribe ? value : Context.defaultValue;
        this._unsubscribe = unsubscribe;
      }
    }, {
      key: "teardown",
      value: function teardown() {
        if (this._unsubscribe) {
          this._unsubscribe();
        }
      }
    }]);

    return _class;
  }(Hook));

  function makeContext(component) {
    return function (defaultValue) {
      var Context = {
        Provider: /*#__PURE__*/function (_HTMLElement) {
          _inherits(Provider, _HTMLElement);

          var _super = _createSuper(Provider);

          function Provider() {
            var _this;

            _classCallCheck(this, Provider);

            _this = _super.call(this);
            _this.listeners = new Set();

            _this.addEventListener(contextEvent, _assertThisInitialized(_this));

            return _this;
          }

          _createClass(Provider, [{
            key: "disconnectedCallback",
            value: function disconnectedCallback() {
              this.removeEventListener(contextEvent, this);
            }
          }, {
            key: "handleEvent",
            value: function handleEvent(event) {
              var detail = event.detail;

              if (detail.Context === Context) {
                detail.value = this.value;
                detail.unsubscribe = this.unsubscribe.bind(this, detail.callback);
                this.listeners.add(detail.callback);
                event.stopPropagation();
              }
            }
          }, {
            key: "unsubscribe",
            value: function unsubscribe(callback) {
              this.listeners["delete"](callback);
            }
          }, {
            key: "value",
            set: function set(value) {
              this._value = value;

              var _iterator = _createForOfIteratorHelper(this.listeners),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var callback = _step.value;
                  callback(value);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            },
            get: function get() {
              return this._value;
            }
          }]);

          return Provider;
        }( /*#__PURE__*/_wrapNativeSuper(HTMLElement)),
        Consumer: component(function (_ref) {
          var render = _ref.render;
          var context = useContext(Context);
          return render(context);
        }),
        defaultValue: defaultValue
      };
      return Context;
    };
  }

  var useMemo = hook( /*#__PURE__*/function (_Hook) {
    _inherits(_class, _Hook);

    var _super = _createSuper(_class);

    function _class(id, state, fn, values) {
      var _this;

      _classCallCheck(this, _class);

      _this = _super.call(this, id, state);
      _this.value = fn();
      _this.values = values;
      return _this;
    }

    _createClass(_class, [{
      key: "update",
      value: function update(fn, values) {
        if (this.hasChanged(values)) {
          this.values = values;
          this.value = fn();
        }

        return this.value;
      }
    }, {
      key: "hasChanged",
      value: function hasChanged() {
        var _this2 = this;

        var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        return values.some(function (value, i) {
          return _this2.values[i] !== value;
        });
      }
    }]);

    return _class;
  }(Hook));

  var useCallback = function useCallback(fn, inputs) {
    return useMemo(function () {
      return fn;
    }, inputs);
  };

  function setLayoutEffects(state, cb) {
    state[layoutEffectsSymbol].push(cb);
  }

  var useLayoutEffect = createEffect(setLayoutEffects);

  var useState = hook( /*#__PURE__*/function (_Hook) {
    _inherits(_class, _Hook);

    var _super = _createSuper(_class);

    function _class(id, state, initialValue) {
      var _this;

      _classCallCheck(this, _class);

      _this = _super.call(this, id, state);
      _this.updater = _this.updater.bind(_assertThisInitialized(_this));

      if (typeof initialValue === 'function') {
        initialValue = initialValue();
      }

      _this.makeArgs(initialValue);

      return _this;
    }

    _createClass(_class, [{
      key: "update",
      value: function update() {
        return this.args;
      }
    }, {
      key: "updater",
      value: function updater(value) {
        if (typeof value === 'function') {
          var updaterFn = value;

          var _this$args = _slicedToArray(this.args, 1),
              previousValue = _this$args[0];

          value = updaterFn(previousValue);
        }

        this.makeArgs(value);
        this.state.update();
      }
    }, {
      key: "makeArgs",
      value: function makeArgs(value) {
        this.args = Object.freeze([value, this.updater]);
      }
    }]);

    return _class;
  }(Hook));

  var useReducer = hook( /*#__PURE__*/function (_Hook) {
    _inherits(_class, _Hook);

    var _super = _createSuper(_class);

    function _class(id, state, _, initialState, init) {
      var _this;

      _classCallCheck(this, _class);

      _this = _super.call(this, id, state);
      _this.dispatch = _this.dispatch.bind(_assertThisInitialized(_this));
      _this.currentState = init !== undefined ? init(initialState) : initialState;
      return _this;
    }

    _createClass(_class, [{
      key: "update",
      value: function update(reducer) {
        this.reducer = reducer;
        return [this.currentState, this.dispatch];
      }
    }, {
      key: "dispatch",
      value: function dispatch(action) {
        this.currentState = this.reducer(this.currentState, action);
        this.state.update();
      }
    }]);

    return _class;
  }(Hook));

  var useRef = function useRef(initialValue) {
    return useMemo(function () {
      return {
        current: initialValue
      };
    }, []);
  };

  function haunted(_ref) {
    var render = _ref.render;
    var component = makeComponent(render);
    var createContext = makeContext(component);
    return {
      component: component,
      createContext: createContext
    };
  }

  var _haunted = haunted({
    render: render
  }),
      component = _haunted.component;

  function useDebouncedCallback(func, rawWait) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      leading: false,
      trailing: true
    };
    var lastCallTime = useRef(undefined);
    var lastInvokeTime = useRef(0);
    var timerId = useRef(undefined);
    var lastArgs = useRef([]);
    var lastThis = useRef(null);
    var result = useRef(null);
    var funcRef = useRef(func);
    var mounted = useRef(true);
    funcRef.current = func; // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.

    var useRAF = !rawWait && rawWait !== 0 && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';

    if (typeof func !== 'function') {
      throw new TypeError('Expected a function');
    }

    var wait = Number(rawWait) || 0;
    var leading = !!options.leading;
    var trailing = 'trailing' in options ? !!options.trailing : true;
    var maxing = ('maxWait' in options);
    var maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : undefined;
    var invokeFunc = useCallback(function (time) {
      var args = lastArgs.current;
      var thisArg = lastThis.current;
      lastThis.current = undefined;
      lastArgs.current = undefined;
      lastInvokeTime.current = time;
      result.current = funcRef.current.apply(thisArg, args);
      return result.current;
    }, []);
    var startTimer = useCallback(function (pendingFunc, timeout) {
      if (useRAF) {
        window.cancelAnimationFrame(timerId.current);
        return window.requestAnimationFrame(pendingFunc);
      }

      return setTimeout(pendingFunc, timeout);
    }, [useRAF]);
    var cancelTimer = useCallback(function (id) {
      if (useRAF) {
        return window.cancelAnimationFrame(id);
      }

      clearTimeout(id);
      return true;
    }, [useRAF]);
    var remainingWait = useCallback(function (time) {
      var timeSinceLastCall = time - lastCallTime.current;
      var timeSinceLastInvoke = time - lastInvokeTime.current;
      var timeWaiting = wait - timeSinceLastCall;
      return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }, [maxWait, maxing, wait]);
    var shouldInvoke = useCallback(function (time) {
      if (!mounted.current) return false;
      var timeSinceLastCall = time - lastCallTime.current;
      var timeSinceLastInvoke = time - lastInvokeTime.current; // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.

      return lastCallTime.current === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
    }, [maxWait, maxing, wait]);
    var trailingEdge = useCallback(function (time) {
      timerId.current = undefined; // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.

      if (trailing && lastArgs.current) {
        return invokeFunc(time);
      }

      lastThis.current = undefined;
      lastArgs.current = undefined;
      return result.current;
    }, [invokeFunc, trailing]);
    var timerExpired = useCallback(function () {
      var time = Date.now();

      if (shouldInvoke(time)) {
        return trailingEdge(time);
      } // Restart the timer.


      timerId.current = startTimer(timerExpired, remainingWait(time));
      return true;
    }, [remainingWait, shouldInvoke, startTimer, trailingEdge]);
    var leadingEdge = useCallback(function (time) {
      // Reset any `maxWait` timer.
      lastInvokeTime.current = time; // Start the timer for the trailing edge.

      timerId.current = startTimer(timerExpired, wait); // Invoke the leading edge.

      return leading ? invokeFunc(time) : result.current;
    }, [invokeFunc, startTimer, leading, timerExpired, wait]);
    var cancel = useCallback(function () {
      if (timerId.current !== undefined) {
        cancelTimer(timerId.current);
      }

      lastInvokeTime.current = 0;
      timerId.current = undefined;
      lastThis.current = undefined;
      lastCallTime.current = undefined;
      lastArgs.current = undefined;
    }, [cancelTimer]);
    var flush = useCallback(function () {
      return timerId.current === undefined ? result.current : trailingEdge(Date.now());
    }, [trailingEdge]);
    useEffect(function () {
      mounted.current = true;
      return function () {
        mounted.current = false;
      };
    }, []);
    var debounced = useCallback(function () {
      var time = Date.now();
      var isInvoking = shouldInvoke(time);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      lastArgs.current = args;
      lastThis.current = _this;
      lastCallTime.current = time;

      if (isInvoking) {
        if (timerId.current === undefined && mounted.current) {
          return leadingEdge(lastCallTime.current);
        }

        if (maxing) {
          // Handle invocations in a tight loop.
          timerId.current = startTimer(timerExpired, wait);
          return invokeFunc(lastCallTime.current);
        }
      }

      if (timerId.current === undefined) {
        timerId.current = startTimer(timerExpired, wait);
      }

      return result.current;
    }, [invokeFunc, leadingEdge, maxing, shouldInvoke, startTimer, timerExpired, wait]);
    var pending = useCallback(function () {
      return timerId.current !== undefined;
    }, []);
    var debouncedState = useMemo(function () {
      return {
        callback: debounced,
        cancel: cancel,
        flush: flush,
        pending: pending
      };
    }, [debounced, cancel, flush, pending]);
    return debouncedState;
  }

  function _templateObject() {
    var data = _taggedTemplateLiteral(["\n    <h1>", "</h1>\n    <input type=\"text\" @keyup=", " value=", " />\n    <div>", "</div>\n  "]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  function predictiveSearch() {
    var _useState = useState(''),
        _useState2 = _slicedToArray(_useState, 2),
        q = _useState2[0],
        setQ = _useState2[1];

    var _useState3 = useState({}),
        _useState4 = _slicedToArray(_useState3, 2),
        results = _useState4[0],
        setResults = _useState4[1];

    var _useState5 = useState(false),
        _useState6 = _slicedToArray(_useState5, 2),
        loading = _useState6[0],
        setLoading = _useState6[1];

    var debounced = useDebouncedCallback(function () {
      getPredictiveSearchResults(q).then(function setValue(response) {
        setLoading(false);

        if (response.message) {
          setResults({});
        } else {
          setResults(response.resources.results);
        }
      });
    }, 500);

    var handleKeyup = function handleKeyup(event) {
      setLoading(true);
      setQ(event.target.value);
      debounced.callback(event.target.value);
    };

    return html(_templateObject(), "".concat(loading ? 'loading...' : 'loaded'), handleKeyup, q, JSON.stringify(results));
  }

  customElements.define('predictive-search', component(predictiveSearch, {
    useShadowDOM: false
  }));

  function _templateObject8() {
    var data = _taggedTemplateLiteral([""]);

    _templateObject8 = function _templateObject8() {
      return data;
    };

    return data;
  }

  function _templateObject7() {
    var data = _taggedTemplateLiteral(["Added"]);

    _templateObject7 = function _templateObject7() {
      return data;
    };

    return data;
  }

  function _templateObject6() {
    var data = _taggedTemplateLiteral(["<span class=\"spinner-border\"></span>"]);

    _templateObject6 = function _templateObject6() {
      return data;
    };

    return data;
  }

  function _templateObject5() {
    var data = _taggedTemplateLiteral(["Add To Cart"]);

    _templateObject5 = function _templateObject5() {
      return data;
    };

    return data;
  }

  function _templateObject4() {
    var data = _taggedTemplateLiteral(["Not Available"]);

    _templateObject4 = function _templateObject4() {
      return data;
    };

    return data;
  }

  function _templateObject3() {
    var data = _taggedTemplateLiteral(["<option\n                  value=\"", "\"\n                  ?selected=", "\n                >\n                  ", "\n                </option>"]);

    _templateObject3 = function _templateObject3() {
      return data;
    };

    return data;
  }

  function _templateObject2() {
    var data = _taggedTemplateLiteral(["<div\n          class=\"selector-wrapper form-group ", "\"\n          ?hidden=", "\n        >\n          <label class=\"", "\" for=\"", "\"\n            >", ":</label\n          >\n          <select\n            id=\"", "\"\n            data-option=\"option", "\"\n            @change=", "\n            class=\"form-control ", "\"\n          >\n            ", "\n          </select>\n        </div>"]);

    _templateObject2 = function _templateObject2() {
      return data;
    };

    return data;
  }

  function _templateObject$1() {
    var data = _taggedTemplateLiteral(["<input\n      name=\"id\"\n      value=\"", "\"\n      type=\"hidden\"\n    />\n    ", "\n    <input\n      class=\"form-control quantity_input ", "\"\n      name=\"quantity\"\n      type=\"number\"\n      value=\"1\"\n      step=\"1\"\n    />\n    <button\n      ?disabled=", "\n      @click=", "\n      type=\"submit\"\n      name=\"add\"\n      class=\"form-control AddToCart btn ", "\"\n    >\n      <span class=\"AddToCartText\"\n        >", "</span\n      >\n    </button>\n    <div class=\"bold_options\"></div>\n    <div class=\"error-description\" ?hidden=", ">\n      ", "\n    </div>"]);

    _templateObject$1 = function _templateObject() {
      return data;
    };

    return data;
  }

  function atcDropdownInputs(_ref) {
    var _this = this;

    var dataProduct = _ref.dataProduct,
        dataSelectedOrFirstAvailableVariant = _ref.dataSelectedOrFirstAvailableVariant,
        dataOptionsWithValues = _ref.dataOptionsWithValues,
        _ref$selectorWrapperC = _ref.selectorWrapperCustomClasses,
        selectorWrapperCustomClasses = _ref$selectorWrapperC === void 0 ? '' : _ref$selectorWrapperC,
        _ref$selectorLabelCus = _ref.selectorLabelCustomClasses,
        selectorLabelCustomClasses = _ref$selectorLabelCus === void 0 ? '' : _ref$selectorLabelCus,
        _ref$selectorCustomCl = _ref.selectorCustomClasses,
        selectorCustomClasses = _ref$selectorCustomCl === void 0 ? '' : _ref$selectorCustomCl,
        _ref$quantityInputCus = _ref.quantityInputCustomClasses,
        quantityInputCustomClasses = _ref$quantityInputCus === void 0 ? '' : _ref$quantityInputCus,
        _ref$atcButtonCustomC = _ref.atcButtonCustomClasses,
        atcButtonCustomClasses = _ref$atcButtonCustomC === void 0 ? '' : _ref$atcButtonCustomC;
    var product = JSON.parse(dataProduct);
    var optionsWithValues = JSON.parse(dataOptionsWithValues);

    var _useState = useState(product.variants.find(function (variant) {
      return variant.id === parseInt(dataSelectedOrFirstAvailableVariant, 10);
    })),
        _useState2 = _slicedToArray(_useState, 2),
        currentVariant = _useState2[0],
        setCurrentVariant = _useState2[1];

    var _useState3 = useState('suspended'),
        _useState4 = _slicedToArray(_useState3, 2),
        status = _useState4[0],
        setStatus = _useState4[1]; // there should be four kinds of status, suspended, loading, success, error


    var _useState5 = useState(''),
        _useState6 = _slicedToArray(_useState5, 2),
        errorDescription = _useState6[0],
        setErrorDescription = _useState6[1];

    var handleOptionChange = function handleOptionChange() {
      var form = _this.closest('form');

      var option1 = _this.querySelector('select[data-option="option1"]') && _this.querySelector('select[data-option="option1"]').value;

      var option2 = _this.querySelector('select[data-option="option2"]') && _this.querySelector('select[data-option="option2"]').value;

      var option3 = _this.querySelector('select[data-option="option3"]') && _this.querySelector('select[data-option="option3"]').value;

      var cVariant = product.variants.find(function (variant) {
        return variant.option1 === option1 && variant.option2 === option2 && variant.option3 === option3;
      });
      setCurrentVariant(cVariant);
      dispatchCustomEvent$1(form, 'variantchanged', {
        bubbles: true,
        composed: true,
        detail: {
          currentVariant: cVariant,
          formatMoney: formatMoney
        }
      });
    };

    var handleATCButtonClick = function handleATCButtonClick(e) {
      if (_this.closest('form').id) {
        e.preventDefault();

        var form = _this.closest('form');

        setStatus('loading');
        addItemFromForm(form).then(function (addedItem) {
          if (addedItem.id) {
            setStatus('success');
            getCart().then(function (cart) {
              dispatchCustomEvent$1(form, 'cartupdated', {
                bubbles: true,
                composed: true,
                detail: {
                  cart: cart
                }
              });
            });
            setTimeout(function () {
              setStatus('suspended');
            }, 1000);
          }

          if (addedItem.description) {
            setStatus('error');
            setErrorDescription(addedItem.description);
            setTimeout(function () {
              setErrorDescription('');
              setStatus('suspended');
            }, 1000);
          }
        });
      }
    };

    return html(_templateObject$1(), currentVariant && currentVariant.id, optionsWithValues.map(function (option) {
      return html(_templateObject2(), selectorWrapperCustomClasses, option.name === 'Title' && option.values[0] === 'Default Title', selectorLabelCustomClasses, option.name, option.name, option.name, option.position, handleOptionChange, selectorCustomClasses, option.values.map(function (value) {
        return html(_templateObject3(), value, currentVariant && currentVariant["option".concat(option.position)] === value, value);
      }));
    }), quantityInputCustomClasses, !currentVariant || !currentVariant.available, handleATCButtonClick, atcButtonCustomClasses, currentVariant && !currentVariant.available ? html(_templateObject4()) : status === 'suspended' ? html(_templateObject5()) : status === 'loading' ? html(_templateObject6()) : status === 'success' ? html(_templateObject7()) : html(_templateObject8()), errorDescription === '', errorDescription);
  }

  customElements.define('atc-dropdown-inputs', component(atcDropdownInputs, {
    useShadowDOM: false,
    observedAttributes: ['data-product', 'data-selected-or-first-available-variant', 'data-options-with-values', 'selector-wrapper-custom-classes', 'selector-label-custom-classes', 'selector-custom-classes', 'quantity-input-custom-classes', 'atc-button-custom-classes']
  }));

  function _templateObject2$1() {
    var data = _taggedTemplateLiteral(["<div\n          class=\"product-grid col-12 col-sm-12 col-md-6\"\n          @click=", "\n        >\n          <div style=\"float: right;width: 30%;\">\n            <img class=\"img-fluid\" src=\"https://picsum.photos/300/300\" />\n          </div>\n          <div style=\"float: left;width: 70%;\">\n            <h6>", "</h6>\n            <p>\n              Lorem ipsum dolor sit ament, consectetuer adipiscing elit, sed\n              diam nonummy nibh euismod lincidunt ut laoreet dolore magna\n              aliquam erat\n            </p>\n            <p>\n              <span class=\"text-danger\">$100 .00 \u2190 </span>\n              <span>$120.00</span>\n            </p>\n            <p>\n              <img\n                height=\"20\"\n                src=\"https://picsum.photos/20/20\"\n                width=\"20\"\n              /><img\n                height=\"20\"\n                src=\"https://picsum.photos/20/20\"\n                width=\"20\"\n              /><img\n                height=\"20\"\n                src=\"https://picsum.photos/20/20\"\n                width=\"20\"\n              /><img\n                height=\"20\"\n                src=\"https://picsum.photos/20/20\"\n                width=\"20\"\n              /><img height=\"20\" src=\"https://picsum.photos/20/20\" width=\"20\" />\n            </p>\n          </div>\n        </div>"]);

    _templateObject2$1 = function _templateObject2() {
      return data;
    };

    return data;
  }

  function _templateObject$2() {
    var data = _taggedTemplateLiteral(["<h5>", "</h5>\n    <div class=\"row\">\n      ", "\n    </div>"]);

    _templateObject$2 = function _templateObject() {
      return data;
    };

    return data;
  }

  function collectionItem(_ref) {
    var _ref$collectionHandle = _ref.collectionHandle,
        collectionHandle = _ref$collectionHandle === void 0 ? '' : _ref$collectionHandle,
        _ref$collectionTitle = _ref.collectionTitle,
        collectionTitle = _ref$collectionTitle === void 0 ? '' : _ref$collectionTitle,
        _ref$dataTag = _ref.dataTag,
        dataTag = _ref$dataTag === void 0 ? '' : _ref$dataTag;

    var _useState = useState({}),
        _useState2 = _slicedToArray(_useState, 2),
        collection = _useState2[0],
        setCollection = _useState2[1];

    useEffect(function () {
      if (collectionHandle !== '') {
        getCollectionWithProductsDetails(collectionHandle, dataTag, function (updatedCollection) {
          setCollection(updatedCollection);
        }).then(function (updatedCollection) {
          setCollection(updatedCollection);
        });
      }
    }, [collectionHandle, dataTag]);

    var handleClick = function handleClick(product, e) {
      dispatchCustomEvent$1(e.target.closest('.product-grid'), 'productgridclicked', {
        bubbles: true,
        composed: true,
        detail: {
          originalEvent: e,
          product: product,
          escape: escape,
          unescape: unescape$1
        }
      });
    };

    return html(_templateObject$2(), collectionTitle, collection.products && collection.products.map(function (product) {
      return html(_templateObject2$1(), function (e) {
        handleClick(product, e);
      }, product.title);
    }));
  }

  customElements.define('collection-item', component(collectionItem, {
    useShadowDOM: false,
    observedAttributes: ['collection-handle', 'collection-title', 'data-tag']
  }));

  function _templateObject$3() {
    var data = _taggedTemplateLiteral([" <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <h5 class=\"modal-title\" id=\"exampleModalLabel\">New message</h5>\n      <button\n        type=\"button\"\n        class=\"close\"\n        data-dismiss=\"modal\"\n        aria-label=\"Close\"\n      >\n        <span aria-hidden=\"true\">&times;</span>\n      </button>\n    </div>\n    <div class=\"modal-body\">\n      <form>\n        <div class=\"form-group\">\n          <label for=\"recipient-name\" class=\"col-form-label\">Recipient:</label>\n          <input type=\"text\" class=\"form-control\" id=\"recipient-name\" />\n        </div>\n        <div class=\"form-group\">\n          <label for=\"message-text\" class=\"col-form-label\">Message:</label>\n          <textarea class=\"form-control\" id=\"message-text\"></textarea>\n        </div>\n      </form>\n    </div>\n    <div class=\"modal-footer\">\n      <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">\n        Close\n      </button>\n      <button type=\"button\" class=\"btn btn-primary\">Send message</button>\n    </div>\n  </div>"]);

    _templateObject$3 = function _templateObject() {
      return data;
    };

    return data;
  }

  function atcRadiobuttonForm(_ref) {

    var dataProduct = _ref.dataProduct,
        dataSelectedOrFirstAvailableVariant = _ref.dataSelectedOrFirstAvailableVariant,
        dataOptionsWithValues = _ref.dataOptionsWithValues,
        _ref$selectorWrapperC = _ref.selectorWrapperCustomClasses,
        _ref$selectorLabelCus = _ref.selectorLabelCustomClasses,
        _ref$selectorCustomCl = _ref.selectorCustomClasses,
        _ref$quantityInputCus = _ref.quantityInputCustomClasses,
        _ref$atcButtonCustomC = _ref.atcButtonCustomClasses;
    var product = JSON.parse(dataProduct);
    var optionsWithValues = JSON.parse(dataOptionsWithValues);

    var _useState = useState(product.variants.find(function (variant) {
      return variant.id === parseInt(dataSelectedOrFirstAvailableVariant, 10);
    })),
        _useState2 = _slicedToArray(_useState, 2),
        currentVariant = _useState2[0],
        setCurrentVariant = _useState2[1];

    var _useState3 = useState('suspended'),
        _useState4 = _slicedToArray(_useState3, 2),
        status = _useState4[0],
        setStatus = _useState4[1]; // there should be four kinds of status, suspended, loading, success, error


    var _useState5 = useState(''),
        _useState6 = _slicedToArray(_useState5, 2),
        errorDescription = _useState6[0],
        setErrorDescription = _useState6[1];

    return html(_templateObject$3());
  }

  customElements.define('atc-radiobutton-form', component(atcRadiobuttonForm, {
    useShadowDOM: false,
    observedAttributes: ['data-product', 'data-selected-or-first-available-variant', 'data-options-with-values', 'selector-wrapper-custom-classes', 'selector-label-custom-classes', 'selector-custom-classes', 'quantity-input-custom-classes', 'atc-button-custom-classes']
  }));

  window.datomar = {
    BSN: index,
    apis: apis,
    helper: helper
  };

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ib290c3RyYXAubmF0aXZlL2Rpc3QvYm9vdHN0cmFwLW5hdGl2ZS5lc20uanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2FzeW5jLnV0aWwub25jZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy51dGlsLm5vb3AvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXN5bmMudXRpbC5pc2FycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2FzeW5jLnV0aWwuaXNhcnJheWxpa2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXN5bmMudXRpbC5tYXBhc3luYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy51dGlsLm9ubHlvbmNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2FzeW5jLnV0aWwua2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy51dGlsLmtleWl0ZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2FzeW5jLnV0aWwuZWFjaG9mbGltaXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXN5bmMudXRpbC5kb3BhcmFsbGVsbGltaXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXN5bmMubWFwbGltaXQvaW5kZXguanMiLCJzcmMvc2NyaXB0cy9oZWxwZXIuanMiLCJzcmMvc2NyaXB0cy9hamF4YXBpcy5qcyIsIm5vZGVfbW9kdWxlcy9nbGlkZXItanMvZ2xpZGVyLmpzIiwic3JjL3NjcmlwdHMvc2VjdGlvbnMvdGVzdGltb25pYWxzLmpzIiwic3JjL3NjcmlwdHMvc2VjdGlvbnMvaGVhZGVyLmpzIiwibm9kZV9tb2R1bGVzL21hY3kvZGlzdC9tYWN5LmpzIiwic3JjL3NjcmlwdHMvc2VjdGlvbnMvbWFzb25yeS1nYWxsZXJ5LmpzIiwibm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kaXJlY3RpdmUuanMiLCJub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL2RvbS5qcyIsIm5vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvcGFydC5qcyIsIm5vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUuanMiLCJub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWluc3RhbmNlLmpzIiwibm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMiLCJub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnRzLmpzIiwibm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyIsIm5vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtZmFjdG9yeS5qcyIsIm5vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvcmVuZGVyLmpzIiwibm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpdC1odG1sLmpzIiwibm9kZV9tb2R1bGVzL2hhdW50ZWQvbGliL2ludGVyZmFjZS5qcyIsIm5vZGVfbW9kdWxlcy9oYXVudGVkL2xpYi9zeW1ib2xzLmpzIiwibm9kZV9tb2R1bGVzL2hhdW50ZWQvbGliL3N0YXRlLmpzIiwibm9kZV9tb2R1bGVzL2hhdW50ZWQvbGliL3NjaGVkdWxlci5qcyIsIm5vZGVfbW9kdWxlcy9oYXVudGVkL2xpYi9jb21wb25lbnQuanMiLCJub2RlX21vZHVsZXMvaGF1bnRlZC9saWIvaG9vay5qcyIsIm5vZGVfbW9kdWxlcy9oYXVudGVkL2xpYi9jcmVhdGUtZWZmZWN0LmpzIiwibm9kZV9tb2R1bGVzL2hhdW50ZWQvbGliL3VzZS1lZmZlY3QuanMiLCJub2RlX21vZHVsZXMvaGF1bnRlZC9saWIvdXNlLWNvbnRleHQuanMiLCJub2RlX21vZHVsZXMvaGF1bnRlZC9saWIvY3JlYXRlLWNvbnRleHQuanMiLCJub2RlX21vZHVsZXMvaGF1bnRlZC9saWIvdXNlLW1lbW8uanMiLCJub2RlX21vZHVsZXMvaGF1bnRlZC9saWIvdXNlLWNhbGxiYWNrLmpzIiwibm9kZV9tb2R1bGVzL2hhdW50ZWQvbGliL3VzZS1sYXlvdXQtZWZmZWN0LmpzIiwibm9kZV9tb2R1bGVzL2hhdW50ZWQvbGliL3VzZS1zdGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9oYXVudGVkL2xpYi91c2UtcmVkdWNlci5qcyIsIm5vZGVfbW9kdWxlcy9oYXVudGVkL2xpYi91c2UtcmVmLmpzIiwibm9kZV9tb2R1bGVzL2hhdW50ZWQvbGliL2NvcmUuanMiLCJub2RlX21vZHVsZXMvaGF1bnRlZC9saWIvbGl0LWhhdW50ZWQuanMiLCJzcmMvc2NyaXB0cy9jb21wb25lbnRzL2N1c3RvbS1ob29rcy5qcyIsInNyYy9zY3JpcHRzL2NvbXBvbmVudHMvcHJlZGljdGl2ZS1zZWFyY2guanMiLCJzcmMvc2NyaXB0cy9jb21wb25lbnRzL2F0Yy1kcm9wZG93bi1pbnB1dHMuanMiLCJzcmMvc2NyaXB0cy9jb21wb25lbnRzL2NvbGxlY3Rpb24taXRlbS5qcyIsInNyYy9zY3JpcHRzL2NvbXBvbmVudHMvYXRjLXJhZGlvYnV0dG9uLWZvcm0uanMiLCJzcmMvc2NyaXB0cy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAgKiBOYXRpdmUgSmF2YVNjcmlwdCBmb3IgQm9vdHN0cmFwIHYzLjAuMTAgKGh0dHBzOi8vdGhlZG5wLmdpdGh1Yi5pby9ib290c3RyYXAubmF0aXZlLylcbiAgKiBDb3B5cmlnaHQgMjAxNS0yMDIwIMKpIGRucF90aGVtZVxuICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3RoZWRucC9ib290c3RyYXAubmF0aXZlL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gICovXG52YXIgdHJhbnNpdGlvbkVuZEV2ZW50ID0gJ3dlYmtpdFRyYW5zaXRpb24nIGluIGRvY3VtZW50LmhlYWQuc3R5bGUgPyAnd2Via2l0VHJhbnNpdGlvbkVuZCcgOiAndHJhbnNpdGlvbmVuZCc7XG5cbnZhciBzdXBwb3J0VHJhbnNpdGlvbiA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5oZWFkLnN0eWxlIHx8ICd0cmFuc2l0aW9uJyBpbiBkb2N1bWVudC5oZWFkLnN0eWxlO1xuXG52YXIgdHJhbnNpdGlvbkR1cmF0aW9uID0gJ3dlYmtpdFRyYW5zaXRpb24nIGluIGRvY3VtZW50LmhlYWQuc3R5bGUgPyAnd2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uJyA6ICd0cmFuc2l0aW9uRHVyYXRpb24nO1xuXG5mdW5jdGlvbiBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGR1cmF0aW9uID0gc3VwcG9ydFRyYW5zaXRpb24gPyBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoZWxlbWVudClbdHJhbnNpdGlvbkR1cmF0aW9uXSkgOiAwO1xuICBkdXJhdGlvbiA9IHR5cGVvZiBkdXJhdGlvbiA9PT0gJ251bWJlcicgJiYgIWlzTmFOKGR1cmF0aW9uKSA/IGR1cmF0aW9uICogMTAwMCA6IDA7XG4gIHJldHVybiBkdXJhdGlvbjtcbn1cblxuZnVuY3Rpb24gZW11bGF0ZVRyYW5zaXRpb25FbmQoZWxlbWVudCxoYW5kbGVyKXtcbiAgdmFyIGNhbGxlZCA9IDAsIGR1cmF0aW9uID0gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihlbGVtZW50KTtcbiAgZHVyYXRpb24gPyBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoIHRyYW5zaXRpb25FbmRFdmVudCwgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZFdyYXBwZXIoZSl7XG4gICAgICAgICAgICAgICFjYWxsZWQgJiYgaGFuZGxlcihlKSwgY2FsbGVkID0gMTtcbiAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCB0cmFuc2l0aW9uRW5kRXZlbnQsIHRyYW5zaXRpb25FbmRXcmFwcGVyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgIDogc2V0VGltZW91dChmdW5jdGlvbigpIHsgIWNhbGxlZCAmJiBoYW5kbGVyKCksIGNhbGxlZCA9IDE7IH0sIDE3KTtcbn1cblxuZnVuY3Rpb24gcXVlcnlFbGVtZW50KHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgdmFyIGxvb2tVcCA9IHBhcmVudCAmJiBwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogZG9jdW1lbnQ7XG4gIHJldHVybiBzZWxlY3RvciBpbnN0YW5jZW9mIEVsZW1lbnQgPyBzZWxlY3RvciA6IGxvb2tVcC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCBjb21wb25lbnROYW1lLCByZWxhdGVkKSB7XG4gIHZhciBPcmlnaW5hbEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCBldmVudE5hbWUgKyAnLmJzLicgKyBjb21wb25lbnROYW1lLCB7Y2FuY2VsYWJsZTogdHJ1ZX0pO1xuICBPcmlnaW5hbEN1c3RvbUV2ZW50LnJlbGF0ZWRUYXJnZXQgPSByZWxhdGVkO1xuICByZXR1cm4gT3JpZ2luYWxDdXN0b21FdmVudDtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hDdXN0b21FdmVudChjdXN0b21FdmVudCl7XG4gIHRoaXMgJiYgdGhpcy5kaXNwYXRjaEV2ZW50KGN1c3RvbUV2ZW50KTtcbn1cblxuZnVuY3Rpb24gQWxlcnQoZWxlbWVudCkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgYWxlcnQsXG4gICAgY2xvc2VDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdjbG9zZScsJ2FsZXJ0JyksXG4gICAgY2xvc2VkQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnY2xvc2VkJywnYWxlcnQnKTtcbiAgZnVuY3Rpb24gdHJpZ2dlckhhbmRsZXIoKSB7XG4gICAgYWxlcnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChhbGVydCx0cmFuc2l0aW9uRW5kSGFuZGxlcikgOiB0cmFuc2l0aW9uRW5kSGFuZGxlcigpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pe1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0oJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgYWxlcnQgPSBlICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuYWxlcnRcIik7XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudCgnW2RhdGEtZGlzbWlzcz1cImFsZXJ0XCJdJyxhbGVydCk7XG4gICAgZWxlbWVudCAmJiBhbGVydCAmJiAoZWxlbWVudCA9PT0gZS50YXJnZXQgfHwgZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkpICYmIHNlbGYuY2xvc2UoKTtcbiAgfVxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kSGFuZGxlcigpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBhbGVydC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGFsZXJ0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoYWxlcnQsY2xvc2VkQ3VzdG9tRXZlbnQpO1xuICB9XG4gIHNlbGYuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBhbGVydCAmJiBlbGVtZW50ICYmIGFsZXJ0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFsZXJ0LGNsb3NlQ3VzdG9tRXZlbnQpO1xuICAgICAgaWYgKCBjbG9zZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgICAgc2VsZi5kaXNwb3NlKCk7XG4gICAgICBhbGVydC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICB0cmlnZ2VySGFuZGxlcigpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkFsZXJ0O1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBhbGVydCA9IGVsZW1lbnQuY2xvc2VzdCgnLmFsZXJ0Jyk7XG4gIGVsZW1lbnQuQWxlcnQgJiYgZWxlbWVudC5BbGVydC5kaXNwb3NlKCk7XG4gIGlmICggIWVsZW1lbnQuQWxlcnQgKSB7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICB9XG4gIHNlbGYuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIGVsZW1lbnQuQWxlcnQgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBCdXR0b24oZWxlbWVudCkge1xuICB2YXIgc2VsZiA9IHRoaXMsIGxhYmVscyxcbiAgICAgIGNoYW5nZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2NoYW5nZScsICdidXR0b24nKTtcbiAgZnVuY3Rpb24gdG9nZ2xlKGUpIHtcbiAgICB2YXIgaW5wdXQsXG4gICAgICAgIGxhYmVsID0gZS50YXJnZXQudGFnTmFtZSA9PT0gJ0xBQkVMJyA/IGUudGFyZ2V0XG4gICAgICAgICAgICAgIDogZS50YXJnZXQuY2xvc2VzdCgnTEFCRUwnKSA/IGUudGFyZ2V0LmNsb3Nlc3QoJ0xBQkVMJykgOiBudWxsO1xuICAgIGlucHV0ID0gbGFiZWwgJiYgbGFiZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0lOUFVUJylbMF07XG4gICAgaWYgKCAhaW5wdXQgKSB7IHJldHVybjsgfVxuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChpbnB1dCwgY2hhbmdlQ3VzdG9tRXZlbnQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBjaGFuZ2VDdXN0b21FdmVudCk7XG4gICAgaWYgKCBpbnB1dC50eXBlID09PSAnY2hlY2tib3gnICkge1xuICAgICAgaWYgKCBjaGFuZ2VDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgIGlmICggIWlucHV0LmNoZWNrZWQgKSB7XG4gICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKCdjaGVja2VkJywnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudC50b2dnbGVkKSB7XG4gICAgICAgIGVsZW1lbnQudG9nZ2xlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggaW5wdXQudHlwZSA9PT0gJ3JhZGlvJyAmJiAhZWxlbWVudC50b2dnbGVkICkge1xuICAgICAgaWYgKCBjaGFuZ2VDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgIGlmICggIWlucHV0LmNoZWNrZWQgfHwgKGUuc2NyZWVuWCA9PT0gMCAmJiBlLnNjcmVlblkgPT0gMCkgKSB7XG4gICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdmb2N1cycpO1xuICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBlbGVtZW50LnRvZ2dsZWQgPSB0cnVlO1xuICAgICAgICBBcnJheS5mcm9tKGxhYmVscykubWFwKGZ1bmN0aW9uIChvdGhlckxhYmVsKXtcbiAgICAgICAgICB2YXIgb3RoZXJJbnB1dCA9IG90aGVyTGFiZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0lOUFVUJylbMF07XG4gICAgICAgICAgaWYgKCBvdGhlckxhYmVsICE9PSBsYWJlbCAmJiBvdGhlckxhYmVsLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgKSAge1xuICAgICAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG90aGVySW5wdXQsIGNoYW5nZUN1c3RvbUV2ZW50KTtcbiAgICAgICAgICAgIG90aGVyTGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICBvdGhlcklucHV0LnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgb3RoZXJJbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkgeyBlbGVtZW50LnRvZ2dsZWQgPSBmYWxzZTsgfSwgNTAgKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKGUpIHtcbiAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAga2V5ID09PSAzMiAmJiBlLnRhcmdldCA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiB0b2dnbGUoZSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJldmVudFNjcm9sbChlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGtleSA9PT0gMzIgJiYgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIGZ1bmN0aW9uIGZvY3VzVG9nZ2xlKGUpIHtcbiAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0lOUFVUJyApIHtcbiAgICAgIHZhciBhY3Rpb24gPSBlLnR5cGUgPT09ICdmb2N1c2luJyA/ICdhZGQnIDogJ3JlbW92ZSc7XG4gICAgICBlLnRhcmdldC5jbG9zZXN0KCcuYnRuJykuY2xhc3NMaXN0W2FjdGlvbl0oJ2ZvY3VzJyk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCdjbGljaycsdG9nZ2xlLGZhbHNlICk7XG4gICAgZWxlbWVudFthY3Rpb25dKCdrZXl1cCcsa2V5SGFuZGxlcixmYWxzZSksIGVsZW1lbnRbYWN0aW9uXSgna2V5ZG93bicscHJldmVudFNjcm9sbCxmYWxzZSk7XG4gICAgZWxlbWVudFthY3Rpb25dKCdmb2N1c2luJyxmb2N1c1RvZ2dsZSxmYWxzZSksIGVsZW1lbnRbYWN0aW9uXSgnZm9jdXNvdXQnLGZvY3VzVG9nZ2xlLGZhbHNlKTtcbiAgfVxuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgZGVsZXRlIGVsZW1lbnQuQnV0dG9uO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LkJ1dHRvbiAmJiBlbGVtZW50LkJ1dHRvbi5kaXNwb3NlKCk7XG4gIGxhYmVscyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYnRuJyk7XG4gIGlmICghbGFiZWxzLmxlbmd0aCkgeyByZXR1cm47IH1cbiAgaWYgKCAhZWxlbWVudC5CdXR0b24gKSB7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICB9XG4gIGVsZW1lbnQudG9nZ2xlZCA9IGZhbHNlO1xuICBlbGVtZW50LkJ1dHRvbiA9IHNlbGY7XG4gIEFycmF5LmZyb20obGFiZWxzKS5tYXAoZnVuY3Rpb24gKGJ0bil7XG4gICAgIWJ0bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpXG4gICAgICAmJiBxdWVyeUVsZW1lbnQoJ2lucHV0OmNoZWNrZWQnLGJ0bilcbiAgICAgICYmIGJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBidG4uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKVxuICAgICAgJiYgIXF1ZXJ5RWxlbWVudCgnaW5wdXQ6Y2hlY2tlZCcsYnRuKVxuICAgICAgJiYgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICB9KTtcbn1cblxudmFyIG1vdXNlSG92ZXJFdmVudHMgPSAoJ29ubW91c2VsZWF2ZScgaW4gZG9jdW1lbnQpID8gWyAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gOiBbICdtb3VzZW92ZXInLCAnbW91c2VvdXQnIF07XG5cbnZhciBzdXBwb3J0UGFzc2l2ZSA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiB3cmFwKCl7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgd3JhcCwgb3B0cyk7XG4gICAgfSwgb3B0cyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHJldHVybiByZXN1bHQ7XG59KSgpO1xuXG52YXIgcGFzc2l2ZUhhbmRsZXIgPSBzdXBwb3J0UGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2U7XG5cbmZ1bmN0aW9uIGlzRWxlbWVudEluU2Nyb2xsUmFuZ2UoZWxlbWVudCkge1xuICB2YXIgYmNyID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gIHJldHVybiBiY3IudG9wIDw9IHZpZXdwb3J0SGVpZ2h0ICYmIGJjci5ib3R0b20gPj0gMDtcbn1cblxuZnVuY3Rpb24gQ2Fyb3VzZWwgKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIHZhcnMsIG9wcyxcbiAgICBzbGlkZUN1c3RvbUV2ZW50LCBzbGlkQ3VzdG9tRXZlbnQsXG4gICAgc2xpZGVzLCBsZWZ0QXJyb3csIHJpZ2h0QXJyb3csIGluZGljYXRvciwgaW5kaWNhdG9ycztcbiAgZnVuY3Rpb24gcGF1c2VIYW5kbGVyKCkge1xuICAgIGlmICggb3BzLmludGVydmFsICE9PWZhbHNlICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3BhdXNlZCcpO1xuICAgICAgIXZhcnMuaXNTbGlkaW5nICYmICggY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKSwgdmFycy50aW1lciA9IG51bGwgKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVzdW1lSGFuZGxlcigpIHtcbiAgICBpZiAoIG9wcy5pbnRlcnZhbCAhPT0gZmFsc2UgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BhdXNlZCcpICkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdwYXVzZWQnKTtcbiAgICAgICF2YXJzLmlzU2xpZGluZyAmJiAoIGNsZWFySW50ZXJ2YWwodmFycy50aW1lciksIHZhcnMudGltZXIgPSBudWxsICk7XG4gICAgICAhdmFycy5pc1NsaWRpbmcgJiYgc2VsZi5jeWNsZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBpbmRpY2F0b3JIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHZhciBldmVudFRhcmdldCA9IGUudGFyZ2V0O1xuICAgIGlmICggZXZlbnRUYXJnZXQgJiYgIWV2ZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgJiYgZXZlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNsaWRlLXRvJykgKSB7XG4gICAgICB2YXJzLmluZGV4ID0gcGFyc2VJbnQoIGV2ZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zbGlkZS10bycpKTtcbiAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBzZWxmLnNsaWRlVG8oIHZhcnMuaW5kZXggKTtcbiAgfVxuICBmdW5jdGlvbiBjb250cm9sc0hhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodmFycy5pc1NsaWRpbmcpIHsgcmV0dXJuOyB9XG4gICAgdmFyIGV2ZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZiAoIGV2ZW50VGFyZ2V0ID09PSByaWdodEFycm93ICkge1xuICAgICAgdmFycy5pbmRleCsrO1xuICAgIH0gZWxzZSBpZiAoIGV2ZW50VGFyZ2V0ID09PSBsZWZ0QXJyb3cgKSB7XG4gICAgICB2YXJzLmluZGV4LS07XG4gICAgfVxuICAgIHNlbGYuc2xpZGVUbyggdmFycy5pbmRleCApO1xuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIocmVmKSB7XG4gICAgdmFyIHdoaWNoID0gcmVmLndoaWNoO1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICBzd2l0Y2ggKHdoaWNoKSB7XG4gICAgICBjYXNlIDM5OlxuICAgICAgICB2YXJzLmluZGV4Kys7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzNzpcbiAgICAgICAgdmFycy5pbmRleC0tO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5zbGlkZVRvKCB2YXJzLmluZGV4ICk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBpZiAoIG9wcy5wYXVzZSAmJiBvcHMuaW50ZXJ2YWwgKSB7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMF0sIHBhdXNlSGFuZGxlciwgZmFsc2UgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggbW91c2VIb3ZlckV2ZW50c1sxXSwgcmVzdW1lSGFuZGxlciwgZmFsc2UgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCBwYXVzZUhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaGVuZCcsIHJlc3VtZUhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgfVxuICAgIG9wcy50b3VjaCAmJiBzbGlkZXMubGVuZ3RoID4gMSAmJiBlbGVtZW50W2FjdGlvbl0oICd0b3VjaHN0YXJ0JywgdG91Y2hEb3duSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICByaWdodEFycm93ICYmIHJpZ2h0QXJyb3dbYWN0aW9uXSggJ2NsaWNrJywgY29udHJvbHNIYW5kbGVyLGZhbHNlICk7XG4gICAgbGVmdEFycm93ICYmIGxlZnRBcnJvd1thY3Rpb25dKCAnY2xpY2snLCBjb250cm9sc0hhbmRsZXIsZmFsc2UgKTtcbiAgICBpbmRpY2F0b3IgJiYgaW5kaWNhdG9yW2FjdGlvbl0oICdjbGljaycsIGluZGljYXRvckhhbmRsZXIsZmFsc2UgKTtcbiAgICBvcHMua2V5Ym9hcmQgJiYgd2luZG93W2FjdGlvbl0oICdrZXlkb3duJywga2V5SGFuZGxlcixmYWxzZSApO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZVRvdWNoRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaG1vdmUnLCB0b3VjaE1vdmVIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIGVsZW1lbnRbYWN0aW9uXSggJ3RvdWNoZW5kJywgdG91Y2hFbmRIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICB9XG4gIGZ1bmN0aW9uIHRvdWNoRG93bkhhbmRsZXIoZSkge1xuICAgIGlmICggdmFycy5pc1RvdWNoICkgeyByZXR1cm47IH1cbiAgICB2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcbiAgICBpZiAoIGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpICkge1xuICAgICAgdmFycy5pc1RvdWNoID0gdHJ1ZTtcbiAgICAgIHRvZ2dsZVRvdWNoRXZlbnRzKDEpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b3VjaE1vdmVIYW5kbGVyKGUpIHtcbiAgICBpZiAoICF2YXJzLmlzVG91Y2ggKSB7IGUucHJldmVudERlZmF1bHQoKTsgcmV0dXJuOyB9XG4gICAgdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcbiAgICBpZiAoIGUudHlwZSA9PT0gJ3RvdWNobW92ZScgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPiAxICkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b3VjaEVuZEhhbmRsZXIgKGUpIHtcbiAgICBpZiAoICF2YXJzLmlzVG91Y2ggfHwgdmFycy5pc1NsaWRpbmcgKSB7IHJldHVybiB9XG4gICAgdmFycy50b3VjaFBvc2l0aW9uLmVuZFggPSB2YXJzLnRvdWNoUG9zaXRpb24uY3VycmVudFggfHwgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcbiAgICBpZiAoIHZhcnMuaXNUb3VjaCApIHtcbiAgICAgIGlmICggKCFlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSB8fCAhZWxlbWVudC5jb250YWlucyhlLnJlbGF0ZWRUYXJnZXQpIClcbiAgICAgICAgICAmJiBNYXRoLmFicyh2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYIC0gdmFycy50b3VjaFBvc2l0aW9uLmVuZFgpIDwgNzUgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICggdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYIDwgdmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCApIHtcbiAgICAgICAgICB2YXJzLmluZGV4Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA+IHZhcnMudG91Y2hQb3NpdGlvbi5zdGFydFggKSB7XG4gICAgICAgICAgdmFycy5pbmRleC0tO1xuICAgICAgICB9XG4gICAgICAgIHZhcnMuaXNUb3VjaCA9IGZhbHNlO1xuICAgICAgICBzZWxmLnNsaWRlVG8odmFycy5pbmRleCk7XG4gICAgICB9XG4gICAgICB0b2dnbGVUb3VjaEV2ZW50cygpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBzZXRBY3RpdmVQYWdlKHBhZ2VJbmRleCkge1xuICAgIEFycmF5LmZyb20oaW5kaWNhdG9ycykubWFwKGZ1bmN0aW9uICh4KXt4LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO30pO1xuICAgIGluZGljYXRvcnNbcGFnZUluZGV4XSAmJiBpbmRpY2F0b3JzW3BhZ2VJbmRleF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gIH1cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZEhhbmRsZXIoZSl7XG4gICAgaWYgKHZhcnMudG91Y2hQb3NpdGlvbil7XG4gICAgICB2YXIgbmV4dCA9IHZhcnMuaW5kZXgsXG4gICAgICAgICAgdGltZW91dCA9IGUgJiYgZS50YXJnZXQgIT09IHNsaWRlc1tuZXh0XSA/IGUuZWxhcHNlZFRpbWUqMTAwMCsxMDAgOiAyMCxcbiAgICAgICAgICBhY3RpdmVJdGVtID0gc2VsZi5nZXRBY3RpdmVJbmRleCgpLFxuICAgICAgICAgIG9yaWVudGF0aW9uID0gdmFycy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICduZXh0JyA6ICdwcmV2JztcbiAgICAgIHZhcnMuaXNTbGlkaW5nICYmIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodmFycy50b3VjaFBvc2l0aW9uKXtcbiAgICAgICAgICB2YXJzLmlzU2xpZGluZyA9IGZhbHNlO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArIG9yaWVudGF0aW9uKSk7XG4gICAgICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LnJlbW92ZSgoXCJjYXJvdXNlbC1pdGVtLVwiICsgKHZhcnMuZGlyZWN0aW9uKSkpO1xuICAgICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkQ3VzdG9tRXZlbnQpO1xuICAgICAgICAgIGlmICggIWRvY3VtZW50LmhpZGRlbiAmJiBvcHMuaW50ZXJ2YWwgJiYgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgICAgICAgIHNlbGYuY3ljbGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH1cbiAgfVxuICBzZWxmLmN5Y2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh2YXJzLnRpbWVyKSB7XG4gICAgICBjbGVhckludGVydmFsKHZhcnMudGltZXIpO1xuICAgICAgdmFycy50aW1lciA9IG51bGw7XG4gICAgfVxuICAgIHZhcnMudGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaWR4ID0gdmFycy5pbmRleCB8fCBzZWxmLmdldEFjdGl2ZUluZGV4KCk7XG4gICAgICBpc0VsZW1lbnRJblNjcm9sbFJhbmdlKGVsZW1lbnQpICYmIChpZHgrKywgc2VsZi5zbGlkZVRvKCBpZHggKSApO1xuICAgIH0sIG9wcy5pbnRlcnZhbCk7XG4gIH07XG4gIHNlbGYuc2xpZGVUbyA9IGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHZhciBhY3RpdmVJdGVtID0gc2VsZi5nZXRBY3RpdmVJbmRleCgpLCBvcmllbnRhdGlvbjtcbiAgICBpZiAoIGFjdGl2ZUl0ZW0gPT09IG5leHQgKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICAoIChhY3RpdmVJdGVtIDwgbmV4dCApIHx8IChhY3RpdmVJdGVtID09PSAwICYmIG5leHQgPT09IHNsaWRlcy5sZW5ndGggLTEgKSApIHtcbiAgICAgIHZhcnMuZGlyZWN0aW9uID0gJ2xlZnQnO1xuICAgIH0gZWxzZSBpZiAgKCAoYWN0aXZlSXRlbSA+IG5leHQpIHx8IChhY3RpdmVJdGVtID09PSBzbGlkZXMubGVuZ3RoIC0gMSAmJiBuZXh0ID09PSAwICkgKSB7XG4gICAgICB2YXJzLmRpcmVjdGlvbiA9ICdyaWdodCc7XG4gICAgfVxuICAgIGlmICggbmV4dCA8IDAgKSB7IG5leHQgPSBzbGlkZXMubGVuZ3RoIC0gMTsgfVxuICAgIGVsc2UgaWYgKCBuZXh0ID49IHNsaWRlcy5sZW5ndGggKXsgbmV4dCA9IDA7IH1cbiAgICBvcmllbnRhdGlvbiA9IHZhcnMuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAnbmV4dCcgOiAncHJldic7XG4gICAgc2xpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzbGlkZScsICdjYXJvdXNlbCcsIHNsaWRlc1tuZXh0XSk7XG4gICAgc2xpZEN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3NsaWQnLCAnY2Fyb3VzZWwnLCBzbGlkZXNbbmV4dF0pO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoc2xpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgIHZhcnMuaW5kZXggPSBuZXh0O1xuICAgIHZhcnMuaXNTbGlkaW5nID0gdHJ1ZTtcbiAgICBjbGVhckludGVydmFsKHZhcnMudGltZXIpO1xuICAgIHZhcnMudGltZXIgPSBudWxsO1xuICAgIHNldEFjdGl2ZVBhZ2UoIG5leHQgKTtcbiAgICBpZiAoIGdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24oc2xpZGVzW25leHRdKSAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnc2xpZGUnKSApIHtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKChcImNhcm91c2VsLWl0ZW0tXCIgKyBvcmllbnRhdGlvbikpO1xuICAgICAgc2xpZGVzW25leHRdLm9mZnNldFdpZHRoO1xuICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5hZGQoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgIHNsaWRlc1thY3RpdmVJdGVtXS5jbGFzc0xpc3QuYWRkKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChzbGlkZXNbbmV4dF0sIHRyYW5zaXRpb25FbmRIYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgc2xpZGVzW25leHRdLm9mZnNldFdpZHRoO1xuICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhcnMuaXNTbGlkaW5nID0gZmFsc2U7XG4gICAgICAgIGlmICggb3BzLmludGVydmFsICYmIGVsZW1lbnQgJiYgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgICAgICBzZWxmLmN5Y2xlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNsaWRDdXN0b21FdmVudCk7XG4gICAgICB9LCAxMDAgKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZ2V0QWN0aXZlSW5kZXggPSBmdW5jdGlvbiAoKSB7IHJldHVybiBBcnJheS5mcm9tKHNsaWRlcykuaW5kZXhPZihlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWl0ZW0gYWN0aXZlJylbMF0pIHx8IDA7IH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXRlbUNsYXNzZXMgPSBbJ2xlZnQnLCdyaWdodCcsJ3ByZXYnLCduZXh0J107XG4gICAgQXJyYXkuZnJvbShzbGlkZXMpLm1hcChmdW5jdGlvbiAoc2xpZGUsaWR4KSB7XG4gICAgICBzbGlkZS5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmIHNldEFjdGl2ZVBhZ2UoIGlkeCApO1xuICAgICAgaXRlbUNsYXNzZXMubWFwKGZ1bmN0aW9uIChjbHMpIHsgcmV0dXJuIHNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArIGNscykpOyB9KTtcbiAgICB9KTtcbiAgICBjbGVhckludGVydmFsKHZhcnMudGltZXIpO1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIHZhcnMgPSB7fTtcbiAgICBvcHMgPSB7fTtcbiAgICBkZWxldGUgZWxlbWVudC5DYXJvdXNlbDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuICBlbGVtZW50LkNhcm91c2VsICYmIGVsZW1lbnQuQ2Fyb3VzZWwuZGlzcG9zZSgpO1xuICBzbGlkZXMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWl0ZW0nKTtcbiAgbGVmdEFycm93ID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1jb250cm9sLXByZXYnKVswXTtcbiAgcmlnaHRBcnJvdyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtY29udHJvbC1uZXh0JylbMF07XG4gIGluZGljYXRvciA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtaW5kaWNhdG9ycycpWzBdO1xuICBpbmRpY2F0b3JzID0gaW5kaWNhdG9yICYmIGluZGljYXRvci5nZXRFbGVtZW50c0J5VGFnTmFtZSggXCJMSVwiICkgfHwgW107XG4gIGlmIChzbGlkZXMubGVuZ3RoIDwgMikgeyByZXR1cm4gfVxuICB2YXJcbiAgICBpbnRlcnZhbEF0dHJpYnV0ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWludGVydmFsJyksXG4gICAgaW50ZXJ2YWxEYXRhID0gaW50ZXJ2YWxBdHRyaWJ1dGUgPT09ICdmYWxzZScgPyAwIDogcGFyc2VJbnQoaW50ZXJ2YWxBdHRyaWJ1dGUpLFxuICAgIHRvdWNoRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRvdWNoJykgPT09ICdmYWxzZScgPyAwIDogMSxcbiAgICBwYXVzZURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXVzZScpID09PSAnaG92ZXInIHx8IGZhbHNlLFxuICAgIGtleWJvYXJkRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWtleWJvYXJkJykgPT09ICd0cnVlJyB8fCBmYWxzZSxcbiAgICBpbnRlcnZhbE9wdGlvbiA9IG9wdGlvbnMuaW50ZXJ2YWwsXG4gICAgdG91Y2hPcHRpb24gPSBvcHRpb25zLnRvdWNoO1xuICBvcHMgPSB7fTtcbiAgb3BzLmtleWJvYXJkID0gb3B0aW9ucy5rZXlib2FyZCA9PT0gdHJ1ZSB8fCBrZXlib2FyZERhdGE7XG4gIG9wcy5wYXVzZSA9IChvcHRpb25zLnBhdXNlID09PSAnaG92ZXInIHx8IHBhdXNlRGF0YSkgPyAnaG92ZXInIDogZmFsc2U7XG4gIG9wcy50b3VjaCA9IHRvdWNoT3B0aW9uIHx8IHRvdWNoRGF0YTtcbiAgb3BzLmludGVydmFsID0gdHlwZW9mIGludGVydmFsT3B0aW9uID09PSAnbnVtYmVyJyA/IGludGVydmFsT3B0aW9uXG4gICAgICAgICAgICAgIDogaW50ZXJ2YWxPcHRpb24gPT09IGZhbHNlIHx8IGludGVydmFsRGF0YSA9PT0gMCB8fCBpbnRlcnZhbERhdGEgPT09IGZhbHNlID8gMFxuICAgICAgICAgICAgICA6IGlzTmFOKGludGVydmFsRGF0YSkgPyA1MDAwXG4gICAgICAgICAgICAgIDogaW50ZXJ2YWxEYXRhO1xuICBpZiAoc2VsZi5nZXRBY3RpdmVJbmRleCgpPDApIHtcbiAgICBzbGlkZXMubGVuZ3RoICYmIHNsaWRlc1swXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBpbmRpY2F0b3JzLmxlbmd0aCAmJiBzZXRBY3RpdmVQYWdlKDApO1xuICB9XG4gIHZhcnMgPSB7fTtcbiAgdmFycy5kaXJlY3Rpb24gPSAnbGVmdCc7XG4gIHZhcnMuaW5kZXggPSAwO1xuICB2YXJzLnRpbWVyID0gbnVsbDtcbiAgdmFycy5pc1NsaWRpbmcgPSBmYWxzZTtcbiAgdmFycy5pc1RvdWNoID0gZmFsc2U7XG4gIHZhcnMudG91Y2hQb3NpdGlvbiA9IHtcbiAgICBzdGFydFggOiAwLFxuICAgIGN1cnJlbnRYIDogMCxcbiAgICBlbmRYIDogMFxuICB9O1xuICB0b2dnbGVFdmVudHMoMSk7XG4gIGlmICggb3BzLmludGVydmFsICl7IHNlbGYuY3ljbGUoKTsgfVxuICBlbGVtZW50LkNhcm91c2VsID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gQ29sbGFwc2UoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBhY2NvcmRpb24gPSBudWxsLFxuICAgICAgY29sbGFwc2UgPSBudWxsLFxuICAgICAgYWN0aXZlQ29sbGFwc2UsXG4gICAgICBhY3RpdmVFbGVtZW50LFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50O1xuICBmdW5jdGlvbiBvcGVuQWN0aW9uKGNvbGxhcHNlRWxlbWVudCwgdG9nZ2xlKSB7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzaW5nJyk7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlJyk7XG4gICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9IChjb2xsYXBzZUVsZW1lbnQuc2Nyb2xsSGVpZ2h0KSArIFwicHhcIjtcbiAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChjb2xsYXBzZUVsZW1lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgY29sbGFwc2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ3RydWUnKTtcbiAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCd0cnVlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgc2hvd25DdXN0b21FdmVudCk7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VBY3Rpb24oY29sbGFwc2VFbGVtZW50LCB0b2dnbGUpIHtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIGNvbGxhcHNlRWxlbWVudC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9IChjb2xsYXBzZUVsZW1lbnQuc2Nyb2xsSGVpZ2h0KSArIFwicHhcIjtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2UnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzaW5nJyk7XG4gICAgY29sbGFwc2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMHB4JztcbiAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChjb2xsYXBzZUVsZW1lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgY29sbGFwc2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ2ZhbHNlJyk7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywnZmFsc2UnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzaW5nJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2UnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgICB9KTtcbiAgfVxuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUgJiYgZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gJ0EnKSB7ZS5wcmV2ZW50RGVmYXVsdCgpO31cbiAgICBpZiAoZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkgfHwgZS50YXJnZXQgPT09IGVsZW1lbnQpIHtcbiAgICAgIGlmICghY29sbGFwc2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHsgc2VsZi5zaG93KCk7IH1cbiAgICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICAgIH1cbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggY29sbGFwc2UuaXNBbmltYXRpbmcgKSB7IHJldHVybjsgfVxuICAgIGNsb3NlQWN0aW9uKGNvbGxhcHNlLGVsZW1lbnQpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2VkJyk7XG4gIH07XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIGFjY29yZGlvbiApIHtcbiAgICAgIGFjdGl2ZUNvbGxhcHNlID0gYWNjb3JkaW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjb2xsYXBzZSBzaG93XCIpWzBdO1xuICAgICAgYWN0aXZlRWxlbWVudCA9IGFjdGl2ZUNvbGxhcHNlICYmIChxdWVyeUVsZW1lbnQoKFwiW2RhdGEtdGFyZ2V0PVxcXCIjXCIgKyAoYWN0aXZlQ29sbGFwc2UuaWQpICsgXCJcXFwiXVwiKSxhY2NvcmRpb24pXG4gICAgICAgICAgICAgICAgICAgIHx8IHF1ZXJ5RWxlbWVudCgoXCJbaHJlZj1cXFwiI1wiICsgKGFjdGl2ZUNvbGxhcHNlLmlkKSArIFwiXFxcIl1cIiksYWNjb3JkaW9uKSApO1xuICAgIH1cbiAgICBpZiAoICFjb2xsYXBzZS5pc0FuaW1hdGluZyApIHtcbiAgICAgIGlmICggYWN0aXZlRWxlbWVudCAmJiBhY3RpdmVDb2xsYXBzZSAhPT0gY29sbGFwc2UgKSB7XG4gICAgICAgIGNsb3NlQWN0aW9uKGFjdGl2ZUNvbGxhcHNlLGFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICBhY3RpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICAgICAgfVxuICAgICAgb3BlbkFjdGlvbihjb2xsYXBzZSxlbGVtZW50KTtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2VkJyk7XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsc2VsZi50b2dnbGUsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkNvbGxhcHNlO1xuICB9O1xuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gICAgZWxlbWVudC5Db2xsYXBzZSAmJiBlbGVtZW50LkNvbGxhcHNlLmRpc3Bvc2UoKTtcbiAgICB2YXIgYWNjb3JkaW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBhcmVudCcpO1xuICAgIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ2NvbGxhcHNlJyk7XG4gICAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICdjb2xsYXBzZScpO1xuICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ2NvbGxhcHNlJyk7XG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ2NvbGxhcHNlJyk7XG4gICAgY29sbGFwc2UgPSBxdWVyeUVsZW1lbnQob3B0aW9ucy50YXJnZXQgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgY29sbGFwc2UuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICBhY2NvcmRpb24gPSBlbGVtZW50LmNsb3Nlc3Qob3B0aW9ucy5wYXJlbnQgfHwgYWNjb3JkaW9uRGF0YSk7XG4gICAgaWYgKCAhZWxlbWVudC5Db2xsYXBzZSApIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYudG9nZ2xlLGZhbHNlKTtcbiAgICB9XG4gICAgZWxlbWVudC5Db2xsYXBzZSA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIHNldEZvY3VzIChlbGVtZW50KXtcbiAgZWxlbWVudC5mb2N1cyA/IGVsZW1lbnQuZm9jdXMoKSA6IGVsZW1lbnQuc2V0QWN0aXZlKCk7XG59XG5cbmZ1bmN0aW9uIERyb3Bkb3duKGVsZW1lbnQsb3B0aW9uKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBudWxsLFxuICAgICAgcGFyZW50LCBtZW51LCBtZW51SXRlbXMgPSBbXSxcbiAgICAgIHBlcnNpc3Q7XG4gIGZ1bmN0aW9uIHByZXZlbnRFbXB0eUFuY2hvcihhbmNob3IpIHtcbiAgICAoYW5jaG9yLmhyZWYgJiYgYW5jaG9yLmhyZWYuc2xpY2UoLTEpID09PSAnIycgfHwgYW5jaG9yLnBhcmVudE5vZGUgJiYgYW5jaG9yLnBhcmVudE5vZGUuaHJlZlxuICAgICAgJiYgYW5jaG9yLnBhcmVudE5vZGUuaHJlZi5zbGljZSgtMSkgPT09ICcjJykgJiYgdGhpcy5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZURpc21pc3MoKSB7XG4gICAgdmFyIGFjdGlvbiA9IGVsZW1lbnQub3BlbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBkb2N1bWVudFthY3Rpb25dKCdjbGljaycsZGlzbWlzc0hhbmRsZXIsZmFsc2UpO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oJ2tleWRvd24nLHByZXZlbnRTY3JvbGwsZmFsc2UpO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oJ2tleXVwJyxrZXlIYW5kbGVyLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdmb2N1cycsZGlzbWlzc0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGRpc21pc3NIYW5kbGVyKGUpIHtcbiAgICB2YXIgZXZlbnRUYXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgICBoYXNEYXRhID0gZXZlbnRUYXJnZXQgJiYgKGV2ZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBldmVudFRhcmdldC5wYXJlbnROb2RlICYmIGV2ZW50VGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGV2ZW50VGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRvZ2dsZScpKTtcbiAgICBpZiAoIGUudHlwZSA9PT0gJ2ZvY3VzJyAmJiAoZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQgfHwgZXZlbnRUYXJnZXQgPT09IG1lbnUgfHwgbWVudS5jb250YWlucyhldmVudFRhcmdldCkgKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCAoZXZlbnRUYXJnZXQgPT09IG1lbnUgfHwgbWVudS5jb250YWlucyhldmVudFRhcmdldCkpICYmIChwZXJzaXN0IHx8IGhhc0RhdGEpICkgeyByZXR1cm47IH1cbiAgICBlbHNlIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBldmVudFRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50LmNvbnRhaW5zKGV2ZW50VGFyZ2V0KSA/IGVsZW1lbnQgOiBudWxsO1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICAgIHByZXZlbnRFbXB0eUFuY2hvci5jYWxsKGUsZXZlbnRUYXJnZXQpO1xuICB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgcmVsYXRlZFRhcmdldCA9IGVsZW1lbnQ7XG4gICAgc2VsZi5zaG93KCk7XG4gICAgcHJldmVudEVtcHR5QW5jaG9yLmNhbGwoZSxlLnRhcmdldCk7XG4gIH1cbiAgZnVuY3Rpb24gcHJldmVudFNjcm9sbChlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGlmKCBrZXkgPT09IDM4IHx8IGtleSA9PT0gNDAgKSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZSxcbiAgICAgICAgYWN0aXZlSXRlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsXG4gICAgICAgIGlzU2FtZUVsZW1lbnQgPSBhY3RpdmVJdGVtID09PSBlbGVtZW50LFxuICAgICAgICBpc0luc2lkZU1lbnUgPSBtZW51LmNvbnRhaW5zKGFjdGl2ZUl0ZW0pLFxuICAgICAgICBpc01lbnVJdGVtID0gYWN0aXZlSXRlbS5wYXJlbnROb2RlID09PSBtZW51IHx8IGFjdGl2ZUl0ZW0ucGFyZW50Tm9kZS5wYXJlbnROb2RlID09PSBtZW51LFxuICAgICAgICBpZHggPSBtZW51SXRlbXMuaW5kZXhPZihhY3RpdmVJdGVtKTtcbiAgICBpZiAoIGlzTWVudUl0ZW0gKSB7XG4gICAgICBpZHggPSBpc1NhbWVFbGVtZW50ID8gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtleSA9PT0gMzggPyAoaWR4PjE/aWR4LTE6MClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBrZXkgPT09IDQwID8gKGlkeDxtZW51SXRlbXMubGVuZ3RoLTE/aWR4KzE6aWR4KSA6IGlkeDtcbiAgICAgIG1lbnVJdGVtc1tpZHhdICYmIHNldEZvY3VzKG1lbnVJdGVtc1tpZHhdKTtcbiAgICB9XG4gICAgaWYgKCAobWVudUl0ZW1zLmxlbmd0aCAmJiBpc01lbnVJdGVtXG4gICAgICAgICAgfHwgIW1lbnVJdGVtcy5sZW5ndGggJiYgKGlzSW5zaWRlTWVudSB8fCBpc1NhbWVFbGVtZW50KVxuICAgICAgICAgIHx8ICFpc0luc2lkZU1lbnUgKVxuICAgICAgICAgICYmIGVsZW1lbnQub3BlbiAmJiBrZXkgPT09IDI3XG4gICAgKSB7XG4gICAgICBzZWxmLnRvZ2dsZSgpO1xuICAgICAgcmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgfVxuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdkcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbWVudS5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgcGFyZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsdHJ1ZSk7XG4gICAgZWxlbWVudC5vcGVuID0gdHJ1ZTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc2V0Rm9jdXMoIG1lbnUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0lOUFVUJylbMF0gfHwgZWxlbWVudCApO1xuICAgICAgdG9nZ2xlRGlzbWlzcygpO1xuICAgICAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnc2hvd24nLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIH0sMSk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICdkcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKCBoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgcGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsZmFsc2UpO1xuICAgIGVsZW1lbnQub3BlbiA9IGZhbHNlO1xuICAgIHRvZ2dsZURpc21pc3MoKTtcbiAgICBzZXRGb2N1cyhlbGVtZW50KTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsZW1lbnQuRHJvcGRvd24gJiYgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICB9LDEpO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdkcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfTtcbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiBlbGVtZW50Lm9wZW4pIHsgc2VsZi5oaWRlKCk7IH1cbiAgICBlbHNlIHsgc2VsZi5zaG93KCk7IH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgZWxlbWVudC5vcGVuKSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5Ecm9wZG93bjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5Ecm9wZG93biAmJiBlbGVtZW50LkRyb3Bkb3duLmRpc3Bvc2UoKTtcbiAgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICBtZW51ID0gcXVlcnlFbGVtZW50KCcuZHJvcGRvd24tbWVudScsIHBhcmVudCk7XG4gIEFycmF5LmZyb20obWVudS5jaGlsZHJlbikubWFwKGZ1bmN0aW9uIChjaGlsZCl7XG4gICAgY2hpbGQuY2hpbGRyZW4ubGVuZ3RoICYmIChjaGlsZC5jaGlsZHJlblswXS50YWdOYW1lID09PSAnQScgJiYgbWVudUl0ZW1zLnB1c2goY2hpbGQuY2hpbGRyZW5bMF0pKTtcbiAgICBjaGlsZC50YWdOYW1lID09PSAnQScgJiYgbWVudUl0ZW1zLnB1c2goY2hpbGQpO1xuICB9KTtcbiAgaWYgKCAhZWxlbWVudC5Ecm9wZG93biApIHtcbiAgICAhKCd0YWJpbmRleCcgaW4gbWVudSkgJiYgbWVudS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIHBlcnNpc3QgPSBvcHRpb24gPT09IHRydWUgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGVyc2lzdCcpID09PSAndHJ1ZScgfHwgZmFsc2U7XG4gIGVsZW1lbnQub3BlbiA9IGZhbHNlO1xuICBlbGVtZW50LkRyb3Bkb3duID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gTW9kYWwoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsIG1vZGFsLFxuICAgIHNob3dDdXN0b21FdmVudCxcbiAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbCxcbiAgICBzY3JvbGxCYXJXaWR0aCxcbiAgICBvdmVybGF5LFxuICAgIG92ZXJsYXlEZWxheSxcbiAgICBmaXhlZEl0ZW1zLFxuICAgIG9wcyA9IHt9O1xuICBmdW5jdGlvbiBzZXRTY3JvbGxiYXIoKSB7XG4gICAgdmFyIG9wZW5Nb2RhbCA9IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2RhbC1vcGVuJyksXG4gICAgICAgIGJvZHlQYWQgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLnBhZGRpbmdSaWdodCksXG4gICAgICAgIGJvZHlPdmVyZmxvdyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgIT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgIT09IGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0LFxuICAgICAgICBtb2RhbE92ZXJmbG93ID0gbW9kYWwuY2xpZW50SGVpZ2h0ICE9PSBtb2RhbC5zY3JvbGxIZWlnaHQ7XG4gICAgc2Nyb2xsQmFyV2lkdGggPSBtZWFzdXJlU2Nyb2xsYmFyKCk7XG4gICAgbW9kYWwuc3R5bGUucGFkZGluZ1JpZ2h0ID0gIW1vZGFsT3ZlcmZsb3cgJiYgc2Nyb2xsQmFyV2lkdGggPyAoc2Nyb2xsQmFyV2lkdGggKyBcInB4XCIpIDogJyc7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBtb2RhbE92ZXJmbG93IHx8IGJvZHlPdmVyZmxvdyA/ICgoYm9keVBhZCArIChvcGVuTW9kYWwgPyAwOnNjcm9sbEJhcldpZHRoKSkgKyBcInB4XCIpIDogJyc7XG4gICAgZml4ZWRJdGVtcy5sZW5ndGggJiYgZml4ZWRJdGVtcy5tYXAoZnVuY3Rpb24gKGZpeGVkKXtcbiAgICAgIHZhciBpdGVtUGFkID0gZ2V0Q29tcHV0ZWRTdHlsZShmaXhlZCkucGFkZGluZ1JpZ2h0O1xuICAgICAgZml4ZWQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gbW9kYWxPdmVyZmxvdyB8fCBib2R5T3ZlcmZsb3cgPyAoKHBhcnNlSW50KGl0ZW1QYWQpICsgKG9wZW5Nb2RhbD8wOnNjcm9sbEJhcldpZHRoKSkgKyBcInB4XCIpIDogKChwYXJzZUludChpdGVtUGFkKSkgKyBcInB4XCIpO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIHJlc2V0U2Nyb2xsYmFyKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJyc7XG4gICAgbW9kYWwuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJyc7XG4gICAgZml4ZWRJdGVtcy5sZW5ndGggJiYgZml4ZWRJdGVtcy5tYXAoZnVuY3Rpb24gKGZpeGVkKXtcbiAgICAgIGZpeGVkLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIG1lYXN1cmVTY3JvbGxiYXIoKSB7XG4gICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLCB3aWR0aFZhbHVlO1xuICAgIHNjcm9sbERpdi5jbGFzc05hbWUgPSAnbW9kYWwtc2Nyb2xsYmFyLW1lYXN1cmUnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgICB3aWR0aFZhbHVlID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoO1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgICByZXR1cm4gd2lkdGhWYWx1ZTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVPdmVybGF5KCkge1xuICAgIHZhciBuZXdPdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3ZlcmxheSA9IHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWJhY2tkcm9wJyk7XG4gICAgaWYgKCBvdmVybGF5ID09PSBudWxsICkge1xuICAgICAgbmV3T3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ21vZGFsLWJhY2tkcm9wJyArIChvcHMuYW5pbWF0aW9uID8gJyBmYWRlJyA6ICcnKSk7XG4gICAgICBvdmVybGF5ID0gbmV3T3ZlcmxheTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG4gICAgfVxuICAgIHJldHVybiBvdmVybGF5O1xuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZU92ZXJsYXkgKCkge1xuICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy5tb2RhbC1iYWNrZHJvcCcpO1xuICAgIGlmICggb3ZlcmxheSAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdICkge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChvdmVybGF5KTsgb3ZlcmxheSA9IG51bGw7XG4gICAgfVxuICAgIG92ZXJsYXkgPT09IG51bGwgJiYgKGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtb3BlbicpLCByZXNldFNjcm9sbGJhcigpKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIHdpbmRvd1thY3Rpb25dKCAncmVzaXplJywgc2VsZi51cGRhdGUsIHBhc3NpdmVIYW5kbGVyKTtcbiAgICBtb2RhbFthY3Rpb25dKCAnY2xpY2snLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCAna2V5ZG93bicsa2V5SGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgZnVuY3Rpb24gYmVmb3JlU2hvdygpIHtcbiAgICBtb2RhbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBzZXRTY3JvbGxiYXIoKTtcbiAgICAhZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdICYmIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtb3BlbicpO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gZW11bGF0ZVRyYW5zaXRpb25FbmQobW9kYWwsIHRyaWdnZXJTaG93KSA6IHRyaWdnZXJTaG93KCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJpZ2dlclNob3coKSB7XG4gICAgc2V0Rm9jdXMobW9kYWwpO1xuICAgIG1vZGFsLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAnbW9kYWwnLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJIaWRlKGZvcmNlKSB7XG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIGVsZW1lbnQgJiYgKHNldEZvY3VzKGVsZW1lbnQpKTtcbiAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcubW9kYWwtYmFja2Ryb3AnKTtcbiAgICBpZiAoZm9yY2UgIT09IDEgJiYgb3ZlcmxheSAmJiBvdmVybGF5LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICFkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbCBzaG93JylbMF0pIHtcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQob3ZlcmxheSxyZW1vdmVPdmVybGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlT3ZlcmxheSgpO1xuICAgIH1cbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdtb2RhbCcpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgaWYgKCBtb2RhbC5pc0FuaW1hdGluZyApIHsgcmV0dXJuOyB9XG4gICAgdmFyIGNsaWNrVGFyZ2V0ID0gZS50YXJnZXQsXG4gICAgICAgIG1vZGFsSUQgPSBcIiNcIiArIChtb2RhbC5nZXRBdHRyaWJ1dGUoJ2lkJykpLFxuICAgICAgICB0YXJnZXRBdHRyVmFsdWUgPSBjbGlja1RhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgY2xpY2tUYXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJyksXG4gICAgICAgIGVsZW1BdHRyVmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgIGlmICggIW1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpXG4gICAgICAgICYmIChjbGlja1RhcmdldCA9PT0gZWxlbWVudCAmJiB0YXJnZXRBdHRyVmFsdWUgPT09IG1vZGFsSURcbiAgICAgICAgfHwgZWxlbWVudC5jb250YWlucyhjbGlja1RhcmdldCkgJiYgZWxlbUF0dHJWYWx1ZSA9PT0gbW9kYWxJRCkgKSB7XG4gICAgICBtb2RhbC5tb2RhbFRyaWdnZXIgPSBlbGVtZW50O1xuICAgICAgcmVsYXRlZFRhcmdldCA9IGVsZW1lbnQ7XG4gICAgICBzZWxmLnNob3coKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24ga2V5SGFuZGxlcihyZWYpIHtcbiAgICB2YXIgd2hpY2ggPSByZWYud2hpY2g7XG4gICAgaWYgKCFtb2RhbC5pc0FuaW1hdGluZyAmJiBvcHMua2V5Ym9hcmQgJiYgd2hpY2ggPT0gMjcgJiYgbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZGlzbWlzc0hhbmRsZXIoZSkge1xuICAgIGlmICggbW9kYWwuaXNBbmltYXRpbmcgKSB7IHJldHVybjsgfVxuICAgIHZhciBjbGlja1RhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICBoYXNEYXRhID0gY2xpY2tUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRpc21pc3MnKSA9PT0gJ21vZGFsJyxcbiAgICAgICAgcGFyZW50V2l0aERhdGEgPSBjbGlja1RhcmdldC5jbG9zZXN0KCdbZGF0YS1kaXNtaXNzPVwibW9kYWxcIl0nKTtcbiAgICBpZiAoIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICggcGFyZW50V2l0aERhdGEgfHwgaGFzRGF0YVxuICAgICAgICB8fCBjbGlja1RhcmdldCA9PT0gbW9kYWwgJiYgb3BzLmJhY2tkcm9wICE9PSAnc3RhdGljJyApICkge1xuICAgICAgc2VsZi5oaWRlKCk7IHJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge3NlbGYuaGlkZSgpO30gZWxzZSB7c2VsZi5zaG93KCk7fVxuICB9O1xuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICEhbW9kYWwuaXNBbmltYXRpbmcgKSB7cmV0dXJufVxuICAgIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ21vZGFsJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1vZGFsLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudE9wZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbCBzaG93JylbMF07XG4gICAgaWYgKGN1cnJlbnRPcGVuICYmIGN1cnJlbnRPcGVuICE9PSBtb2RhbCkge1xuICAgICAgY3VycmVudE9wZW4ubW9kYWxUcmlnZ2VyICYmIGN1cnJlbnRPcGVuLm1vZGFsVHJpZ2dlci5Nb2RhbC5oaWRlKCk7XG4gICAgICBjdXJyZW50T3Blbi5Nb2RhbCAmJiBjdXJyZW50T3Blbi5Nb2RhbC5oaWRlKCk7XG4gICAgfVxuICAgIGlmICggb3BzLmJhY2tkcm9wICkge1xuICAgICAgb3ZlcmxheSA9IGNyZWF0ZU92ZXJsYXkoKTtcbiAgICB9XG4gICAgaWYgKCBvdmVybGF5ICYmICFjdXJyZW50T3BlbiAmJiAhb3ZlcmxheS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtcbiAgICAgIG92ZXJsYXkub2Zmc2V0V2lkdGg7XG4gICAgICBvdmVybGF5RGVsYXkgPSBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKG92ZXJsYXkpO1xuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgfVxuICAgICFjdXJyZW50T3BlbiA/IHNldFRpbWVvdXQoIGJlZm9yZVNob3csIG92ZXJsYXkgJiYgb3ZlcmxheURlbGF5ID8gb3ZlcmxheURlbGF5OjAgKSA6IGJlZm9yZVNob3coKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKGZvcmNlKSB7XG4gICAgaWYgKCAhbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7cmV0dXJufVxuICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnaGlkZScsICdtb2RhbCcpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIG1vZGFsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSAmJiBmb3JjZSAhPT0gMSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKG1vZGFsLCB0cmlnZ2VySGlkZSkgOiB0cmlnZ2VySGlkZSgpO1xuICB9O1xuICBzZWxmLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoY29udGVudCkge1xuICAgIHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWNvbnRlbnQnLG1vZGFsKS5pbm5lckhUTUwgPSBjb250ZW50O1xuICB9O1xuICBzZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAobW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgIHNldFNjcm9sbGJhcigpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuaGlkZSgxKTtcbiAgICBpZiAoZWxlbWVudCkge2VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7IGRlbGV0ZSBlbGVtZW50Lk1vZGFsOyB9XG4gICAgZWxzZSB7ZGVsZXRlIG1vZGFsLk1vZGFsO31cbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgdmFyIGNoZWNrTW9kYWwgPSBxdWVyeUVsZW1lbnQoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykgKTtcbiAgbW9kYWwgPSBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbW9kYWwnKSA/IGVsZW1lbnQgOiBjaGVja01vZGFsO1xuICBmaXhlZEl0ZW1zID0gQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaXhlZC10b3AnKSlcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChBcnJheS5mcm9tKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ZpeGVkLWJvdHRvbScpKSk7XG4gIGlmICggZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGFsJykgKSB7IGVsZW1lbnQgPSBudWxsOyB9XG4gIGVsZW1lbnQgJiYgZWxlbWVudC5Nb2RhbCAmJiBlbGVtZW50Lk1vZGFsLmRpc3Bvc2UoKTtcbiAgbW9kYWwgJiYgbW9kYWwuTW9kYWwgJiYgbW9kYWwuTW9kYWwuZGlzcG9zZSgpO1xuICBvcHMua2V5Ym9hcmQgPSBvcHRpb25zLmtleWJvYXJkID09PSBmYWxzZSB8fCBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEta2V5Ym9hcmQnKSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZTtcbiAgb3BzLmJhY2tkcm9wID0gb3B0aW9ucy5iYWNrZHJvcCA9PT0gJ3N0YXRpYycgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJhY2tkcm9wJykgPT09ICdzdGF0aWMnID8gJ3N0YXRpYycgOiB0cnVlO1xuICBvcHMuYmFja2Ryb3AgPSBvcHRpb25zLmJhY2tkcm9wID09PSBmYWxzZSB8fCBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmFja2Ryb3AnKSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogb3BzLmJhY2tkcm9wO1xuICBvcHMuYW5pbWF0aW9uID0gbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgPyB0cnVlIDogZmFsc2U7XG4gIG9wcy5jb250ZW50ID0gb3B0aW9ucy5jb250ZW50O1xuICBtb2RhbC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICBpZiAoIGVsZW1lbnQgJiYgIWVsZW1lbnQuTW9kYWwgKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBpZiAoIG9wcy5jb250ZW50ICkge1xuICAgIHNlbGYuc2V0Q29udGVudCggb3BzLmNvbnRlbnQudHJpbSgpICk7XG4gIH1cbiAgaWYgKGVsZW1lbnQpIHtcbiAgICBtb2RhbC5tb2RhbFRyaWdnZXIgPSBlbGVtZW50O1xuICAgIGVsZW1lbnQuTW9kYWwgPSBzZWxmO1xuICB9IGVsc2Uge1xuICAgIG1vZGFsLk1vZGFsID0gc2VsZjtcbiAgfVxufVxuXG52YXIgbW91c2VDbGlja0V2ZW50cyA9IHsgZG93bjogJ21vdXNlZG93bicsIHVwOiAnbW91c2V1cCcgfTtcblxuZnVuY3Rpb24gZ2V0U2Nyb2xsKCkge1xuICByZXR1cm4ge1xuICAgIHkgOiB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCxcbiAgICB4IDogd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0XG4gIH1cbn1cblxuZnVuY3Rpb24gc3R5bGVUaXAobGluayxlbGVtZW50LHBvc2l0aW9uLHBhcmVudCkge1xuICB2YXIgdGlwUG9zaXRpb25zID0gL1xcYih0b3B8Ym90dG9tfGxlZnR8cmlnaHQpKy8sXG4gICAgICBlbGVtZW50RGltZW5zaW9ucyA9IHsgdyA6IGVsZW1lbnQub2Zmc2V0V2lkdGgsIGg6IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IH0sXG4gICAgICB3aW5kb3dXaWR0aCA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCksXG4gICAgICB3aW5kb3dIZWlnaHQgPSAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCksXG4gICAgICByZWN0ID0gbGluay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHNjcm9sbCA9IHBhcmVudCA9PT0gZG9jdW1lbnQuYm9keSA/IGdldFNjcm9sbCgpIDogeyB4OiBwYXJlbnQub2Zmc2V0TGVmdCArIHBhcmVudC5zY3JvbGxMZWZ0LCB5OiBwYXJlbnQub2Zmc2V0VG9wICsgcGFyZW50LnNjcm9sbFRvcCB9LFxuICAgICAgbGlua0RpbWVuc2lvbnMgPSB7IHc6IHJlY3QucmlnaHQgLSByZWN0LmxlZnQsIGg6IHJlY3QuYm90dG9tIC0gcmVjdC50b3AgfSxcbiAgICAgIGlzUG9wb3ZlciA9IGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwb3BvdmVyJyksXG4gICAgICBhcnJvdyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYXJyb3cnKVswXSxcbiAgICAgIGhhbGZUb3BFeGNlZWQgPSByZWN0LnRvcCArIGxpbmtEaW1lbnNpb25zLmgvMiAtIGVsZW1lbnREaW1lbnNpb25zLmgvMiA8IDAsXG4gICAgICBoYWxmTGVmdEV4Y2VlZCA9IHJlY3QubGVmdCArIGxpbmtEaW1lbnNpb25zLncvMiAtIGVsZW1lbnREaW1lbnNpb25zLncvMiA8IDAsXG4gICAgICBoYWxmUmlnaHRFeGNlZWQgPSByZWN0LmxlZnQgKyBlbGVtZW50RGltZW5zaW9ucy53LzIgKyBsaW5rRGltZW5zaW9ucy53LzIgPj0gd2luZG93V2lkdGgsXG4gICAgICBoYWxmQm90dG9tRXhjZWVkID0gcmVjdC50b3AgKyBlbGVtZW50RGltZW5zaW9ucy5oLzIgKyBsaW5rRGltZW5zaW9ucy5oLzIgPj0gd2luZG93SGVpZ2h0LFxuICAgICAgdG9wRXhjZWVkID0gcmVjdC50b3AgLSBlbGVtZW50RGltZW5zaW9ucy5oIDwgMCxcbiAgICAgIGxlZnRFeGNlZWQgPSByZWN0LmxlZnQgLSBlbGVtZW50RGltZW5zaW9ucy53IDwgMCxcbiAgICAgIGJvdHRvbUV4Y2VlZCA9IHJlY3QudG9wICsgZWxlbWVudERpbWVuc2lvbnMuaCArIGxpbmtEaW1lbnNpb25zLmggPj0gd2luZG93SGVpZ2h0LFxuICAgICAgcmlnaHRFeGNlZWQgPSByZWN0LmxlZnQgKyBlbGVtZW50RGltZW5zaW9ucy53ICsgbGlua0RpbWVuc2lvbnMudyA+PSB3aW5kb3dXaWR0aDtcbiAgcG9zaXRpb24gPSAocG9zaXRpb24gPT09ICdsZWZ0JyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JykgJiYgbGVmdEV4Y2VlZCAmJiByaWdodEV4Y2VlZCA/ICd0b3AnIDogcG9zaXRpb247XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gPT09ICd0b3AnICYmIHRvcEV4Y2VlZCA/ICdib3R0b20nIDogcG9zaXRpb247XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gPT09ICdib3R0b20nICYmIGJvdHRvbUV4Y2VlZCA/ICd0b3AnIDogcG9zaXRpb247XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gPT09ICdsZWZ0JyAmJiBsZWZ0RXhjZWVkID8gJ3JpZ2h0JyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAncmlnaHQnICYmIHJpZ2h0RXhjZWVkID8gJ2xlZnQnIDogcG9zaXRpb247XG4gIHZhciB0b3BQb3NpdGlvbixcbiAgICBsZWZ0UG9zaXRpb24sXG4gICAgYXJyb3dUb3AsXG4gICAgYXJyb3dMZWZ0LFxuICAgIGFycm93V2lkdGgsXG4gICAgYXJyb3dIZWlnaHQ7XG4gIGVsZW1lbnQuY2xhc3NOYW1lLmluZGV4T2YocG9zaXRpb24pID09PSAtMSAmJiAoZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKHRpcFBvc2l0aW9ucyxwb3NpdGlvbikpO1xuICBhcnJvd1dpZHRoID0gYXJyb3cub2Zmc2V0V2lkdGg7IGFycm93SGVpZ2h0ID0gYXJyb3cub2Zmc2V0SGVpZ2h0O1xuICBpZiAoIHBvc2l0aW9uID09PSAnbGVmdCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcgKSB7XG4gICAgaWYgKCBwb3NpdGlvbiA9PT0gJ2xlZnQnICkge1xuICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdC5sZWZ0ICsgc2Nyb2xsLnggLSBlbGVtZW50RGltZW5zaW9ucy53IC0gKCBpc1BvcG92ZXIgPyBhcnJvd1dpZHRoIDogMCApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSByZWN0LmxlZnQgKyBzY3JvbGwueCArIGxpbmtEaW1lbnNpb25zLnc7XG4gICAgfVxuICAgIGlmIChoYWxmVG9wRXhjZWVkKSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnk7XG4gICAgICBhcnJvd1RvcCA9IGxpbmtEaW1lbnNpb25zLmgvMiAtIGFycm93V2lkdGg7XG4gICAgfSBlbHNlIGlmIChoYWxmQm90dG9tRXhjZWVkKSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oICsgbGlua0RpbWVuc2lvbnMuaDtcbiAgICAgIGFycm93VG9wID0gZWxlbWVudERpbWVuc2lvbnMuaCAtIGxpbmtEaW1lbnNpb25zLmgvMiAtIGFycm93V2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gcmVjdC50b3AgKyBzY3JvbGwueSAtIGVsZW1lbnREaW1lbnNpb25zLmgvMiArIGxpbmtEaW1lbnNpb25zLmgvMjtcbiAgICAgIGFycm93VG9wID0gZWxlbWVudERpbWVuc2lvbnMuaC8yIC0gKGlzUG9wb3ZlciA/IGFycm93SGVpZ2h0KjAuOSA6IGFycm93SGVpZ2h0LzIpO1xuICAgIH1cbiAgfSBlbHNlIGlmICggcG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJyApIHtcbiAgICBpZiAoIHBvc2l0aW9uID09PSAndG9wJykge1xuICAgICAgdG9wUG9zaXRpb24gPSAgcmVjdC50b3AgKyBzY3JvbGwueSAtIGVsZW1lbnREaW1lbnNpb25zLmggLSAoIGlzUG9wb3ZlciA/IGFycm93SGVpZ2h0IDogMCApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnkgKyBsaW5rRGltZW5zaW9ucy5oO1xuICAgIH1cbiAgICBpZiAoaGFsZkxlZnRFeGNlZWQpIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IDA7XG4gICAgICBhcnJvd0xlZnQgPSByZWN0LmxlZnQgKyBsaW5rRGltZW5zaW9ucy53LzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSBpZiAoaGFsZlJpZ2h0RXhjZWVkKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSB3aW5kb3dXaWR0aCAtIGVsZW1lbnREaW1lbnNpb25zLncqMS4wMTtcbiAgICAgIGFycm93TGVmdCA9IGVsZW1lbnREaW1lbnNpb25zLncgLSAoIHdpbmRvd1dpZHRoIC0gcmVjdC5sZWZ0ICkgKyBsaW5rRGltZW5zaW9ucy53LzIgLSBhcnJvd1dpZHRoLzI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3QubGVmdCArIHNjcm9sbC54IC0gZWxlbWVudERpbWVuc2lvbnMudy8yICsgbGlua0RpbWVuc2lvbnMudy8yO1xuICAgICAgYXJyb3dMZWZ0ID0gZWxlbWVudERpbWVuc2lvbnMudy8yIC0gKCBpc1BvcG92ZXIgPyBhcnJvd1dpZHRoIDogYXJyb3dXaWR0aC8yICk7XG4gICAgfVxuICB9XG4gIGVsZW1lbnQuc3R5bGUudG9wID0gdG9wUG9zaXRpb24gKyAncHgnO1xuICBlbGVtZW50LnN0eWxlLmxlZnQgPSBsZWZ0UG9zaXRpb24gKyAncHgnO1xuICBhcnJvd1RvcCAmJiAoYXJyb3cuc3R5bGUudG9wID0gYXJyb3dUb3AgKyAncHgnKTtcbiAgYXJyb3dMZWZ0ICYmIChhcnJvdy5zdHlsZS5sZWZ0ID0gYXJyb3dMZWZ0ICsgJ3B4Jyk7XG59XG5cbmZ1bmN0aW9uIFBvcG92ZXIoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBwb3BvdmVyID0gbnVsbCxcbiAgICAgIHRpbWVyID0gMCxcbiAgICAgIGlzSXBob25lID0gLyhpUGhvbmV8aVBvZHxpUGFkKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSxcbiAgICAgIHRpdGxlU3RyaW5nLFxuICAgICAgY29udGVudFN0cmluZyxcbiAgICAgIG9wcyA9IHt9O1xuICB2YXIgdHJpZ2dlckRhdGEsXG4gICAgICBhbmltYXRpb25EYXRhLFxuICAgICAgcGxhY2VtZW50RGF0YSxcbiAgICAgIGRpc21pc3NpYmxlRGF0YSxcbiAgICAgIGRlbGF5RGF0YSxcbiAgICAgIGNvbnRhaW5lckRhdGEsXG4gICAgICBjbG9zZUJ0bixcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIGNvbnRhaW5lckVsZW1lbnQsXG4gICAgICBjb250YWluZXJEYXRhRWxlbWVudCxcbiAgICAgIG1vZGFsLFxuICAgICAgbmF2YmFyRml4ZWRUb3AsXG4gICAgICBuYXZiYXJGaXhlZEJvdHRvbSxcbiAgICAgIHBsYWNlbWVudENsYXNzO1xuICBmdW5jdGlvbiBkaXNtaXNzaWJsZUhhbmRsZXIoZSkge1xuICAgIGlmIChwb3BvdmVyICE9PSBudWxsICYmIGUudGFyZ2V0ID09PSBxdWVyeUVsZW1lbnQoJy5jbG9zZScscG9wb3ZlcikpIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBnZXRDb250ZW50cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgMCA6IG9wdGlvbnMudGl0bGUgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSB8fCBudWxsLFxuICAgICAgMSA6IG9wdGlvbnMuY29udGVudCB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jb250ZW50JykgfHwgbnVsbFxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiByZW1vdmVQb3BvdmVyKCkge1xuICAgIG9wcy5jb250YWluZXIucmVtb3ZlQ2hpbGQocG9wb3Zlcik7XG4gICAgdGltZXIgPSBudWxsOyBwb3BvdmVyID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVQb3BvdmVyKCkge1xuICAgIHRpdGxlU3RyaW5nID0gZ2V0Q29udGVudHMoKVswXSB8fCBudWxsO1xuICAgIGNvbnRlbnRTdHJpbmcgPSBnZXRDb250ZW50cygpWzFdO1xuICAgIGNvbnRlbnRTdHJpbmcgPSAhIWNvbnRlbnRTdHJpbmcgPyBjb250ZW50U3RyaW5nLnRyaW0oKSA6IG51bGw7XG4gICAgcG9wb3ZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBwb3BvdmVyQXJyb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwb3BvdmVyQXJyb3cuY2xhc3NMaXN0LmFkZCgnYXJyb3cnKTtcbiAgICBwb3BvdmVyLmFwcGVuZENoaWxkKHBvcG92ZXJBcnJvdyk7XG4gICAgaWYgKCBjb250ZW50U3RyaW5nICE9PSBudWxsICYmIG9wcy50ZW1wbGF0ZSA9PT0gbnVsbCApIHtcbiAgICAgIHBvcG92ZXIuc2V0QXR0cmlidXRlKCdyb2xlJywndG9vbHRpcCcpO1xuICAgICAgaWYgKHRpdGxlU3RyaW5nICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBwb3BvdmVyVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICAgICBwb3BvdmVyVGl0bGUuY2xhc3NMaXN0LmFkZCgncG9wb3Zlci1oZWFkZXInKTtcbiAgICAgICAgcG9wb3ZlclRpdGxlLmlubmVySFRNTCA9IG9wcy5kaXNtaXNzaWJsZSA/IHRpdGxlU3RyaW5nICsgY2xvc2VCdG4gOiB0aXRsZVN0cmluZztcbiAgICAgICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyVGl0bGUpO1xuICAgICAgfVxuICAgICAgdmFyIHBvcG92ZXJCb2R5TWFya3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBwb3BvdmVyQm9keU1hcmt1cC5jbGFzc0xpc3QuYWRkKCdwb3BvdmVyLWJvZHknKTtcbiAgICAgIHBvcG92ZXJCb2R5TWFya3VwLmlubmVySFRNTCA9IG9wcy5kaXNtaXNzaWJsZSAmJiB0aXRsZVN0cmluZyA9PT0gbnVsbCA/IGNvbnRlbnRTdHJpbmcgKyBjbG9zZUJ0biA6IGNvbnRlbnRTdHJpbmc7XG4gICAgICBwb3BvdmVyLmFwcGVuZENoaWxkKHBvcG92ZXJCb2R5TWFya3VwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHBvcG92ZXJUZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgcG9wb3ZlclRlbXBsYXRlLmlubmVySFRNTCA9IG9wcy50ZW1wbGF0ZS50cmltKCk7XG4gICAgICBwb3BvdmVyLmNsYXNzTmFtZSA9IHBvcG92ZXJUZW1wbGF0ZS5maXJzdENoaWxkLmNsYXNzTmFtZTtcbiAgICAgIHBvcG92ZXIuaW5uZXJIVE1MID0gcG9wb3ZlclRlbXBsYXRlLmZpcnN0Q2hpbGQuaW5uZXJIVE1MO1xuICAgICAgdmFyIHBvcG92ZXJIZWFkZXIgPSBxdWVyeUVsZW1lbnQoJy5wb3BvdmVyLWhlYWRlcicscG9wb3ZlciksXG4gICAgICAgICAgcG9wb3ZlckJvZHkgPSBxdWVyeUVsZW1lbnQoJy5wb3BvdmVyLWJvZHknLHBvcG92ZXIpO1xuICAgICAgdGl0bGVTdHJpbmcgJiYgcG9wb3ZlckhlYWRlciAmJiAocG9wb3ZlckhlYWRlci5pbm5lckhUTUwgPSB0aXRsZVN0cmluZy50cmltKCkpO1xuICAgICAgY29udGVudFN0cmluZyAmJiBwb3BvdmVyQm9keSAmJiAocG9wb3ZlckJvZHkuaW5uZXJIVE1MID0gY29udGVudFN0cmluZy50cmltKCkpO1xuICAgIH1cbiAgICBvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKHBvcG92ZXIpO1xuICAgIHBvcG92ZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgIXBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCAncG9wb3ZlcicpICYmIHBvcG92ZXIuY2xhc3NMaXN0LmFkZCgncG9wb3ZlcicpO1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucyggb3BzLmFuaW1hdGlvbikgJiYgcG9wb3Zlci5jbGFzc0xpc3QuYWRkKG9wcy5hbmltYXRpb24pO1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucyggcGxhY2VtZW50Q2xhc3MpICYmIHBvcG92ZXIuY2xhc3NMaXN0LmFkZChwbGFjZW1lbnRDbGFzcyk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd1BvcG92ZXIoKSB7XG4gICAgIXBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgKCBwb3BvdmVyLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKSApO1xuICB9XG4gIGZ1bmN0aW9uIHVwZGF0ZVBvcG92ZXIoKSB7XG4gICAgc3R5bGVUaXAoZWxlbWVudCwgcG9wb3Zlciwgb3BzLnBsYWNlbWVudCwgb3BzLmNvbnRhaW5lcik7XG4gIH1cbiAgZnVuY3Rpb24gZm9yY2VGb2N1cyAoKSB7XG4gICAgaWYgKHBvcG92ZXIgPT09IG51bGwpIHsgZWxlbWVudC5mb2N1cygpOyB9XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBpZiAob3BzLnRyaWdnZXIgPT09ICdob3ZlcicpIHtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggbW91c2VDbGlja0V2ZW50cy5kb3duLCBzZWxmLnNob3cgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggbW91c2VIb3ZlckV2ZW50c1swXSwgc2VsZi5zaG93ICk7XG4gICAgICBpZiAoIW9wcy5kaXNtaXNzaWJsZSkgeyBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMV0sIHNlbGYuaGlkZSApOyB9XG4gICAgfSBlbHNlIGlmICgnY2xpY2snID09IG9wcy50cmlnZ2VyKSB7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG9wcy50cmlnZ2VyLCBzZWxmLnRvZ2dsZSApO1xuICAgIH0gZWxzZSBpZiAoJ2ZvY3VzJyA9PSBvcHMudHJpZ2dlcikge1xuICAgICAgaXNJcGhvbmUgJiYgZWxlbWVudFthY3Rpb25dKCAnY2xpY2snLCBmb3JjZUZvY3VzLCBmYWxzZSApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBvcHMudHJpZ2dlciwgc2VsZi50b2dnbGUgKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hIYW5kbGVyKGUpe1xuICAgIGlmICggcG9wb3ZlciAmJiBwb3BvdmVyLmNvbnRhaW5zKGUudGFyZ2V0KSB8fCBlLnRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSkgOyBlbHNlIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkaXNtaXNzSGFuZGxlclRvZ2dsZShhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKG9wcy5kaXNtaXNzaWJsZSkge1xuICAgICAgZG9jdW1lbnRbYWN0aW9uXSgnY2xpY2snLCBkaXNtaXNzaWJsZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICdmb2N1cycgPT0gb3BzLnRyaWdnZXIgJiYgZWxlbWVudFthY3Rpb25dKCAnYmx1cicsIHNlbGYuaGlkZSApO1xuICAgICAgJ2hvdmVyJyA9PSBvcHMudHJpZ2dlciAmJiBkb2N1bWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHRvdWNoSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB9XG4gICAgd2luZG93W2FjdGlvbl0oJ3Jlc2l6ZScsIHNlbGYuaGlkZSwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93VHJpZ2dlcigpIHtcbiAgICBkaXNtaXNzSGFuZGxlclRvZ2dsZSgxKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gaGlkZVRyaWdnZXIoKSB7XG4gICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUoKTtcbiAgICByZW1vdmVQb3BvdmVyKCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkgeyBzZWxmLnNob3coKTsgfVxuICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICB9O1xuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChwb3BvdmVyID09PSBudWxsKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgICAgY3JlYXRlUG9wb3ZlcigpO1xuICAgICAgICB1cGRhdGVQb3BvdmVyKCk7XG4gICAgICAgIHNob3dQb3BvdmVyKCk7XG4gICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHBvcG92ZXIsIHNob3dUcmlnZ2VyKSA6IHNob3dUcmlnZ2VyKCk7XG4gICAgICB9XG4gICAgfSwgMjAgKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocG9wb3ZlciAmJiBwb3BvdmVyICE9PSBudWxsICYmIHBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgICAgICBwb3BvdmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgICAgISFvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQocG9wb3ZlciwgaGlkZVRyaWdnZXIpIDogaGlkZVRyaWdnZXIoKTtcbiAgICAgIH1cbiAgICB9LCBvcHMuZGVsYXkgKTtcbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuaGlkZSgpO1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlBvcG92ZXI7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuUG9wb3ZlciAmJiBlbGVtZW50LlBvcG92ZXIuZGlzcG9zZSgpO1xuICB0cmlnZ2VyRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRyaWdnZXInKTtcbiAgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicpO1xuICBwbGFjZW1lbnREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGxhY2VtZW50Jyk7XG4gIGRpc21pc3NpYmxlRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWRpc21pc3NpYmxlJyk7XG4gIGRlbGF5RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWRlbGF5Jyk7XG4gIGNvbnRhaW5lckRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jb250YWluZXInKTtcbiAgY2xvc2VCdG4gPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiPsOXPC9idXR0b24+JztcbiAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAncG9wb3ZlcicpO1xuICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ3BvcG92ZXInKTtcbiAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAncG9wb3ZlcicpO1xuICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAncG9wb3ZlcicpO1xuICBjb250YWluZXJFbGVtZW50ID0gcXVlcnlFbGVtZW50KG9wdGlvbnMuY29udGFpbmVyKTtcbiAgY29udGFpbmVyRGF0YUVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoY29udGFpbmVyRGF0YSk7XG4gIG1vZGFsID0gZWxlbWVudC5jbG9zZXN0KCcubW9kYWwnKTtcbiAgbmF2YmFyRml4ZWRUb3AgPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC10b3AnKTtcbiAgbmF2YmFyRml4ZWRCb3R0b20gPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC1ib3R0b20nKTtcbiAgb3BzLnRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZSA/IG9wdGlvbnMudGVtcGxhdGUgOiBudWxsO1xuICBvcHMudHJpZ2dlciA9IG9wdGlvbnMudHJpZ2dlciA/IG9wdGlvbnMudHJpZ2dlciA6IHRyaWdnZXJEYXRhIHx8ICdob3Zlcic7XG4gIG9wcy5hbmltYXRpb24gPSBvcHRpb25zLmFuaW1hdGlvbiAmJiBvcHRpb25zLmFuaW1hdGlvbiAhPT0gJ2ZhZGUnID8gb3B0aW9ucy5hbmltYXRpb24gOiBhbmltYXRpb25EYXRhIHx8ICdmYWRlJztcbiAgb3BzLnBsYWNlbWVudCA9IG9wdGlvbnMucGxhY2VtZW50ID8gb3B0aW9ucy5wbGFjZW1lbnQgOiBwbGFjZW1lbnREYXRhIHx8ICd0b3AnO1xuICBvcHMuZGVsYXkgPSBwYXJzZUludChvcHRpb25zLmRlbGF5IHx8IGRlbGF5RGF0YSkgfHwgMjAwO1xuICBvcHMuZGlzbWlzc2libGUgPSBvcHRpb25zLmRpc21pc3NpYmxlIHx8IGRpc21pc3NpYmxlRGF0YSA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlO1xuICBvcHMuY29udGFpbmVyID0gY29udGFpbmVyRWxlbWVudCA/IGNvbnRhaW5lckVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBjb250YWluZXJEYXRhRWxlbWVudCA/IGNvbnRhaW5lckRhdGFFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRUb3AgPyBuYXZiYXJGaXhlZFRvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkQm90dG9tID8gbmF2YmFyRml4ZWRCb3R0b21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBtb2RhbCA/IG1vZGFsIDogZG9jdW1lbnQuYm9keTtcbiAgcGxhY2VtZW50Q2xhc3MgPSBcImJzLXBvcG92ZXItXCIgKyAob3BzLnBsYWNlbWVudCk7XG4gIHZhciBwb3BvdmVyQ29udGVudHMgPSBnZXRDb250ZW50cygpO1xuICB0aXRsZVN0cmluZyA9IHBvcG92ZXJDb250ZW50c1swXTtcbiAgY29udGVudFN0cmluZyA9IHBvcG92ZXJDb250ZW50c1sxXTtcbiAgaWYgKCAhY29udGVudFN0cmluZyAmJiAhb3BzLnRlbXBsYXRlICkgeyByZXR1cm47IH1cbiAgaWYgKCAhZWxlbWVudC5Qb3BvdmVyICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBlbGVtZW50LlBvcG92ZXIgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBTY3JvbGxTcHkoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgdmFycyxcbiAgICB0YXJnZXREYXRhLFxuICAgIG9mZnNldERhdGEsXG4gICAgc3B5VGFyZ2V0LFxuICAgIHNjcm9sbFRhcmdldCxcbiAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gdXBkYXRlVGFyZ2V0cygpe1xuICAgIHZhciBsaW5rcyA9IHNweVRhcmdldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQScpO1xuICAgIGlmICh2YXJzLmxlbmd0aCAhPT0gbGlua3MubGVuZ3RoKSB7XG4gICAgICB2YXJzLml0ZW1zID0gW107XG4gICAgICB2YXJzLnRhcmdldHMgPSBbXTtcbiAgICAgIEFycmF5LmZyb20obGlua3MpLm1hcChmdW5jdGlvbiAobGluayl7XG4gICAgICAgIHZhciBocmVmID0gbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSxcbiAgICAgICAgICB0YXJnZXRJdGVtID0gaHJlZiAmJiBocmVmLmNoYXJBdCgwKSA9PT0gJyMnICYmIGhyZWYuc2xpY2UoLTEpICE9PSAnIycgJiYgcXVlcnlFbGVtZW50KGhyZWYpO1xuICAgICAgICBpZiAoIHRhcmdldEl0ZW0gKSB7XG4gICAgICAgICAgdmFycy5pdGVtcy5wdXNoKGxpbmspO1xuICAgICAgICAgIHZhcnMudGFyZ2V0cy5wdXNoKHRhcmdldEl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHZhcnMubGVuZ3RoID0gbGlua3MubGVuZ3RoO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVJdGVtKGluZGV4KSB7XG4gICAgdmFyIGl0ZW0gPSB2YXJzLml0ZW1zW2luZGV4XSxcbiAgICAgIHRhcmdldEl0ZW0gPSB2YXJzLnRhcmdldHNbaW5kZXhdLFxuICAgICAgZHJvcG1lbnUgPSBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24taXRlbScpICYmIGl0ZW0uY2xvc2VzdCgnLmRyb3Bkb3duLW1lbnUnKSxcbiAgICAgIGRyb3BMaW5rID0gZHJvcG1lbnUgJiYgZHJvcG1lbnUucHJldmlvdXNFbGVtZW50U2libGluZyxcbiAgICAgIG5leHRTaWJsaW5nID0gaXRlbS5uZXh0RWxlbWVudFNpYmxpbmcsXG4gICAgICBhY3RpdmVTaWJsaW5nID0gbmV4dFNpYmxpbmcgJiYgbmV4dFNpYmxpbmcuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWN0aXZlJykubGVuZ3RoLFxuICAgICAgdGFyZ2V0UmVjdCA9IHZhcnMuaXNXaW5kb3cgJiYgdGFyZ2V0SXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIGlzQWN0aXZlID0gaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpIHx8IGZhbHNlLFxuICAgICAgdG9wRWRnZSA9ICh2YXJzLmlzV2luZG93ID8gdGFyZ2V0UmVjdC50b3AgKyB2YXJzLnNjcm9sbE9mZnNldCA6IHRhcmdldEl0ZW0ub2Zmc2V0VG9wKSAtIG9wcy5vZmZzZXQsXG4gICAgICBib3R0b21FZGdlID0gdmFycy5pc1dpbmRvdyA/IHRhcmdldFJlY3QuYm90dG9tICsgdmFycy5zY3JvbGxPZmZzZXQgLSBvcHMub2Zmc2V0XG4gICAgICAgICAgICAgICAgIDogdmFycy50YXJnZXRzW2luZGV4KzFdID8gdmFycy50YXJnZXRzW2luZGV4KzFdLm9mZnNldFRvcCAtIG9wcy5vZmZzZXRcbiAgICAgICAgICAgICAgICAgOiBlbGVtZW50LnNjcm9sbEhlaWdodCxcbiAgICAgIGluc2lkZSA9IGFjdGl2ZVNpYmxpbmcgfHwgdmFycy5zY3JvbGxPZmZzZXQgPj0gdG9wRWRnZSAmJiBib3R0b21FZGdlID4gdmFycy5zY3JvbGxPZmZzZXQ7XG4gICAgIGlmICggIWlzQWN0aXZlICYmIGluc2lkZSApIHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICBpZiAoZHJvcExpbmsgJiYgIWRyb3BMaW5rLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgKSB7XG4gICAgICAgIGRyb3BMaW5rLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgfVxuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnYWN0aXZhdGUnLCAnc2Nyb2xsc3B5JywgdmFycy5pdGVtc1tpbmRleF0pKTtcbiAgICB9IGVsc2UgaWYgKCBpc0FjdGl2ZSAmJiAhaW5zaWRlICkge1xuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIGlmIChkcm9wTGluayAmJiBkcm9wTGluay5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmICFpdGVtLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWN0aXZlJykubGVuZ3RoICkge1xuICAgICAgICBkcm9wTGluay5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCBpc0FjdGl2ZSAmJiBpbnNpZGUgfHwgIWluc2lkZSAmJiAhaXNBY3RpdmUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHVwZGF0ZUl0ZW1zKCkge1xuICAgIHVwZGF0ZVRhcmdldHMoKTtcbiAgICB2YXJzLnNjcm9sbE9mZnNldCA9IHZhcnMuaXNXaW5kb3cgPyBnZXRTY3JvbGwoKS55IDogZWxlbWVudC5zY3JvbGxUb3A7XG4gICAgdmFycy5pdGVtcy5tYXAoZnVuY3Rpb24gKGwsaWR4KXsgcmV0dXJuIHVwZGF0ZUl0ZW0oaWR4KTsgfSk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBzY3JvbGxUYXJnZXRbYWN0aW9uXSgnc2Nyb2xsJywgc2VsZi5yZWZyZXNoLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIHdpbmRvd1thY3Rpb25dKCAncmVzaXplJywgc2VsZi5yZWZyZXNoLCBwYXNzaXZlSGFuZGxlciApO1xuICB9XG4gIHNlbGYucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1cGRhdGVJdGVtcygpO1xuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgZGVsZXRlIGVsZW1lbnQuU2Nyb2xsU3B5O1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlNjcm9sbFNweSAmJiBlbGVtZW50LlNjcm9sbFNweS5kaXNwb3NlKCk7XG4gIHRhcmdldERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKTtcbiAgb2Zmc2V0RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnNldCcpO1xuICBzcHlUYXJnZXQgPSBxdWVyeUVsZW1lbnQob3B0aW9ucy50YXJnZXQgfHwgdGFyZ2V0RGF0YSk7XG4gIHNjcm9sbFRhcmdldCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IDwgZWxlbWVudC5zY3JvbGxIZWlnaHQgPyBlbGVtZW50IDogd2luZG93O1xuICBpZiAoIXNweVRhcmdldCkgeyByZXR1cm4gfVxuICBvcHMudGFyZ2V0ID0gc3B5VGFyZ2V0O1xuICBvcHMub2Zmc2V0ID0gcGFyc2VJbnQob3B0aW9ucy5vZmZzZXQgfHwgb2Zmc2V0RGF0YSkgfHwgMTA7XG4gIHZhcnMgPSB7fTtcbiAgdmFycy5sZW5ndGggPSAwO1xuICB2YXJzLml0ZW1zID0gW107XG4gIHZhcnMudGFyZ2V0cyA9IFtdO1xuICB2YXJzLmlzV2luZG93ID0gc2Nyb2xsVGFyZ2V0ID09PSB3aW5kb3c7XG4gIGlmICggIWVsZW1lbnQuU2Nyb2xsU3B5ICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBzZWxmLnJlZnJlc2goKTtcbiAgZWxlbWVudC5TY3JvbGxTcHkgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBUYWIoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgaGVpZ2h0RGF0YSxcbiAgICB0YWJzLCBkcm9wZG93bixcbiAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgc2hvd25DdXN0b21FdmVudCxcbiAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgbmV4dCxcbiAgICB0YWJzQ29udGVudENvbnRhaW5lciA9IGZhbHNlLFxuICAgIGFjdGl2ZVRhYixcbiAgICBhY3RpdmVDb250ZW50LFxuICAgIG5leHRDb250ZW50LFxuICAgIGNvbnRhaW5lckhlaWdodCxcbiAgICBlcXVhbENvbnRlbnRzLFxuICAgIG5leHRIZWlnaHQsXG4gICAgYW5pbWF0ZUhlaWdodDtcbiAgZnVuY3Rpb24gdHJpZ2dlckVuZCgpIHtcbiAgICB0YWJzQ29udGVudENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICB0YWJzQ29udGVudENvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzaW5nJyk7XG4gICAgdGFicy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJTaG93KCkge1xuICAgIGlmICh0YWJzQ29udGVudENvbnRhaW5lcikge1xuICAgICAgaWYgKCBlcXVhbENvbnRlbnRzICkge1xuICAgICAgICB0cmlnZ2VyRW5kKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0YWJzQ29udGVudENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBuZXh0SGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyLm9mZnNldFdpZHRoO1xuICAgICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRhYnNDb250ZW50Q29udGFpbmVyLCB0cmlnZ2VyRW5kKTtcbiAgICAgICAgfSw1MCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0YWInLCBhY3RpdmVUYWIpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChuZXh0LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VySGlkZSgpIHtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIGFjdGl2ZUNvbnRlbnQuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XG4gICAgICBuZXh0Q29udGVudC5zdHlsZS5mbG9hdCA9ICdsZWZ0JztcbiAgICAgIGNvbnRhaW5lckhlaWdodCA9IGFjdGl2ZUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICd0YWInLCBhY3RpdmVUYWIpO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICd0YWInLCBuZXh0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobmV4dCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBuZXh0Q29udGVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBhY3RpdmVDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIGlmICh0YWJzQ29udGVudENvbnRhaW5lcikge1xuICAgICAgbmV4dEhlaWdodCA9IG5leHRDb250ZW50LnNjcm9sbEhlaWdodDtcbiAgICAgIGVxdWFsQ29udGVudHMgPSBuZXh0SGVpZ2h0ID09PSBjb250YWluZXJIZWlnaHQ7XG4gICAgICB0YWJzQ29udGVudENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzaW5nJyk7XG4gICAgICB0YWJzQ29udGVudENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XG4gICAgICB0YWJzQ29udGVudENvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgICBhY3RpdmVDb250ZW50LnN0eWxlLmZsb2F0ID0gJyc7XG4gICAgICBuZXh0Q29udGVudC5zdHlsZS5mbG9hdCA9ICcnO1xuICAgIH1cbiAgICBpZiAoIG5leHRDb250ZW50LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpICkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5leHRDb250ZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQobmV4dENvbnRlbnQsdHJpZ2dlclNob3cpO1xuICAgICAgfSwyMCk7XG4gICAgfSBlbHNlIHsgdHJpZ2dlclNob3coKTsgfVxuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhY3RpdmVUYWIsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoKSB7XG4gICAgdmFyIGFjdGl2ZVRhYnMgPSB0YWJzLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLCBhY3RpdmVUYWI7XG4gICAgaWYgKCBhY3RpdmVUYWJzLmxlbmd0aCA9PT0gMSAmJiAhYWN0aXZlVGFic1swXS5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24nKSApIHtcbiAgICAgIGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbMF07XG4gICAgfSBlbHNlIGlmICggYWN0aXZlVGFicy5sZW5ndGggPiAxICkge1xuICAgICAgYWN0aXZlVGFiID0gYWN0aXZlVGFic1thY3RpdmVUYWJzLmxlbmd0aC0xXTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGl2ZVRhYjtcbiAgfVxuICBmdW5jdGlvbiBnZXRBY3RpdmVDb250ZW50KCkgeyByZXR1cm4gcXVlcnlFbGVtZW50KGdldEFjdGl2ZVRhYigpLmdldEF0dHJpYnV0ZSgnaHJlZicpKSB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIG5leHQgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgIXRhYnMuaXNBbmltYXRpbmcgJiYgc2VsZi5zaG93KCk7XG4gIH1cbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIG5leHQgPSBuZXh0IHx8IGVsZW1lbnQ7XG4gICAgaWYgKCFuZXh0LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgIG5leHRDb250ZW50ID0gcXVlcnlFbGVtZW50KG5leHQuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuICAgICAgYWN0aXZlVGFiID0gZ2V0QWN0aXZlVGFiKCk7XG4gICAgICBhY3RpdmVDb250ZW50ID0gZ2V0QWN0aXZlQ29udGVudCgpO1xuICAgICAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoICdoaWRlJywgJ3RhYicsIG5leHQpO1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFjdGl2ZVRhYiwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICAgIGlmIChoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIHRhYnMuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgYWN0aXZlVGFiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgYWN0aXZlVGFiLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsJ2ZhbHNlJyk7XG4gICAgICBuZXh0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgbmV4dC5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCd0cnVlJyk7XG4gICAgICBpZiAoIGRyb3Bkb3duICkge1xuICAgICAgICBpZiAoICFlbGVtZW50LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdkcm9wZG93bi1tZW51JykgKSB7XG4gICAgICAgICAgaWYgKGRyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHsgZHJvcGRvd24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7IH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIWRyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHsgZHJvcGRvd24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGFjdGl2ZUNvbnRlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykpIHtcbiAgICAgICAgYWN0aXZlQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGFjdGl2ZUNvbnRlbnQsIHRyaWdnZXJIaWRlKTtcbiAgICAgIH0gZWxzZSB7IHRyaWdnZXJIaWRlKCk7IH1cbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlRhYjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5UYWIgJiYgZWxlbWVudC5UYWIuZGlzcG9zZSgpO1xuICBoZWlnaHREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0Jyk7XG4gIHRhYnMgPSBlbGVtZW50LmNsb3Nlc3QoJy5uYXYnKTtcbiAgZHJvcGRvd24gPSB0YWJzICYmIHF1ZXJ5RWxlbWVudCgnLmRyb3Bkb3duLXRvZ2dsZScsdGFicyk7XG4gIGFuaW1hdGVIZWlnaHQgPSAhc3VwcG9ydFRyYW5zaXRpb24gfHwgKG9wdGlvbnMuaGVpZ2h0ID09PSBmYWxzZSB8fCBoZWlnaHREYXRhID09PSAnZmFsc2UnKSA/IGZhbHNlIDogdHJ1ZTtcbiAgdGFicy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICBpZiAoICFlbGVtZW50LlRhYiApIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGlmIChhbmltYXRlSGVpZ2h0KSB7IHRhYnNDb250ZW50Q29udGFpbmVyID0gZ2V0QWN0aXZlQ29udGVudCgpLnBhcmVudE5vZGU7IH1cbiAgZWxlbWVudC5UYWIgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBUb2FzdChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHRvYXN0LCB0aW1lciA9IDAsXG4gICAgICBhbmltYXRpb25EYXRhLFxuICAgICAgYXV0b2hpZGVEYXRhLFxuICAgICAgZGVsYXlEYXRhLFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIHNob3dDb21wbGV0ZSgpIHtcbiAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCAnc2hvd2luZycgKTtcbiAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCAnc2hvdycgKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3Qsc2hvd25DdXN0b21FdmVudCk7XG4gICAgaWYgKG9wcy5hdXRvaGlkZSkgeyBzZWxmLmhpZGUoKTsgfVxuICB9XG4gIGZ1bmN0aW9uIGhpZGVDb21wbGV0ZSgpIHtcbiAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCAnaGlkZScgKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3QsaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlICgpIHtcbiAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93JyApO1xuICAgIG9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b2FzdCwgaGlkZUNvbXBsZXRlKSA6IGhpZGVDb21wbGV0ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGRpc3Bvc2VDb21wbGV0ZSgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYuaGlkZSxmYWxzZSk7XG4gICAgZGVsZXRlIGVsZW1lbnQuVG9hc3Q7XG4gIH1cbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0b2FzdCAmJiAhdG9hc3QuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbCh0b2FzdCxzaG93Q3VzdG9tRXZlbnQpO1xuICAgICAgaWYgKHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgb3BzLmFuaW1hdGlvbiAmJiB0b2FzdC5jbGFzc0xpc3QuYWRkKCAnZmFkZScgKTtcbiAgICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnICk7XG4gICAgICB0b2FzdC5vZmZzZXRXaWR0aDtcbiAgICAgIHRvYXN0LmNsYXNzTGlzdC5hZGQoJ3Nob3dpbmcnICk7XG4gICAgICBvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9hc3QsIHNob3dDb21wbGV0ZSkgOiBzaG93Q29tcGxldGUoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uIChub1RpbWVyKSB7XG4gICAgaWYgKHRvYXN0ICYmIHRvYXN0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3QsaGlkZUN1c3RvbUV2ZW50KTtcbiAgICAgIGlmKGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgbm9UaW1lciA/IGNsb3NlKCkgOiAodGltZXIgPSBzZXRUaW1lb3V0KCBjbG9zZSwgb3BzLmRlbGF5KSk7XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvYXN0LCBkaXNwb3NlQ29tcGxldGUpIDogZGlzcG9zZUNvbXBsZXRlKCk7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuVG9hc3QgJiYgZWxlbWVudC5Ub2FzdC5kaXNwb3NlKCk7XG4gIHRvYXN0ID0gZWxlbWVudC5jbG9zZXN0KCcudG9hc3QnKTtcbiAgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicpO1xuICBhdXRvaGlkZURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hdXRvaGlkZScpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICd0b2FzdCcpO1xuICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICd0b2FzdCcpO1xuICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ3RvYXN0Jyk7XG4gIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICd0b2FzdCcpO1xuICBvcHMuYW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRpb24gPT09IGZhbHNlIHx8IGFuaW1hdGlvbkRhdGEgPT09ICdmYWxzZScgPyAwIDogMTtcbiAgb3BzLmF1dG9oaWRlID0gb3B0aW9ucy5hdXRvaGlkZSA9PT0gZmFsc2UgfHwgYXV0b2hpZGVEYXRhID09PSAnZmFsc2UnID8gMCA6IDE7XG4gIG9wcy5kZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuZGVsYXkgfHwgZGVsYXlEYXRhKSB8fCA1MDA7XG4gIGlmICggIWVsZW1lbnQuVG9hc3QgKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsc2VsZi5oaWRlLGZhbHNlKTtcbiAgfVxuICBlbGVtZW50LlRvYXN0ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVG9vbHRpcChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHRvb2x0aXAgPSBudWxsLCB0aW1lciA9IDAsIHRpdGxlU3RyaW5nLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIHBsYWNlbWVudERhdGEsXG4gICAgICBkZWxheURhdGEsXG4gICAgICBjb250YWluZXJEYXRhLFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgICAgY29udGFpbmVyRWxlbWVudCxcbiAgICAgIGNvbnRhaW5lckRhdGFFbGVtZW50LFxuICAgICAgbW9kYWwsXG4gICAgICBuYXZiYXJGaXhlZFRvcCxcbiAgICAgIG5hdmJhckZpeGVkQm90dG9tLFxuICAgICAgcGxhY2VtZW50Q2xhc3MsXG4gICAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0aXRsZScpXG4gICAgICAgIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJylcbiAgICAgICAgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZVRvb2xUaXAoKSB7XG4gICAgb3BzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCh0b29sdGlwKTtcbiAgICB0b29sdGlwID0gbnVsbDsgdGltZXIgPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVRvb2xUaXAoKSB7XG4gICAgdGl0bGVTdHJpbmcgPSBnZXRUaXRsZSgpO1xuICAgIGlmICggdGl0bGVTdHJpbmcgKSB7XG4gICAgICB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBpZiAob3BzLnRlbXBsYXRlKSB7XG4gICAgICAgIHZhciB0b29sdGlwTWFya3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2x0aXBNYXJrdXAuaW5uZXJIVE1MID0gb3BzLnRlbXBsYXRlLnRyaW0oKTtcbiAgICAgICAgdG9vbHRpcC5jbGFzc05hbWUgPSB0b29sdGlwTWFya3VwLmZpcnN0Q2hpbGQuY2xhc3NOYW1lO1xuICAgICAgICB0b29sdGlwLmlubmVySFRNTCA9IHRvb2x0aXBNYXJrdXAuZmlyc3RDaGlsZC5pbm5lckhUTUw7XG4gICAgICAgIHF1ZXJ5RWxlbWVudCgnLnRvb2x0aXAtaW5uZXInLHRvb2x0aXApLmlubmVySFRNTCA9IHRpdGxlU3RyaW5nLnRyaW0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0b29sdGlwQXJyb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbHRpcEFycm93LmNsYXNzTGlzdC5hZGQoJ2Fycm93Jyk7XG4gICAgICAgIHRvb2x0aXAuYXBwZW5kQ2hpbGQodG9vbHRpcEFycm93KTtcbiAgICAgICAgdmFyIHRvb2x0aXBJbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b29sdGlwSW5uZXIuY2xhc3NMaXN0LmFkZCgndG9vbHRpcC1pbm5lcicpO1xuICAgICAgICB0b29sdGlwLmFwcGVuZENoaWxkKHRvb2x0aXBJbm5lcik7XG4gICAgICAgIHRvb2x0aXBJbm5lci5pbm5lckhUTUwgPSB0aXRsZVN0cmluZztcbiAgICAgIH1cbiAgICAgIHRvb2x0aXAuc3R5bGUubGVmdCA9ICcwJztcbiAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0gJzAnO1xuICAgICAgdG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCd0b29sdGlwJyk7XG4gICAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMoJ3Rvb2x0aXAnKSAmJiB0b29sdGlwLmNsYXNzTGlzdC5hZGQoJ3Rvb2x0aXAnKTtcbiAgICAgICF0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucyhvcHMuYW5pbWF0aW9uKSAmJiB0b29sdGlwLmNsYXNzTGlzdC5hZGQob3BzLmFuaW1hdGlvbik7XG4gICAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMocGxhY2VtZW50Q2xhc3MpICYmIHRvb2x0aXAuY2xhc3NMaXN0LmFkZChwbGFjZW1lbnRDbGFzcyk7XG4gICAgICBvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRvb2x0aXApO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVUb29sdGlwKCkge1xuICAgIHN0eWxlVGlwKGVsZW1lbnQsIHRvb2x0aXAsIG9wcy5wbGFjZW1lbnQsIG9wcy5jb250YWluZXIpO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dUb29sdGlwKCkge1xuICAgICF0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICggdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCdzaG93JykgKTtcbiAgfVxuICBmdW5jdGlvbiB0b3VjaEhhbmRsZXIoZSl7XG4gICAgaWYgKCB0b29sdGlwICYmIHRvb2x0aXAuY29udGFpbnMoZS50YXJnZXQpIHx8IGUudGFyZ2V0ID09PSBlbGVtZW50IHx8IGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpKSA7IGVsc2Uge1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUFjdGlvbihhY3Rpb24pe1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBkb2N1bWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHRvdWNoSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYuaGlkZSwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93QWN0aW9uKCkge1xuICAgIHRvZ2dsZUFjdGlvbigxKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gaGlkZUFjdGlvbigpIHtcbiAgICB0b2dnbGVBY3Rpb24oKTtcbiAgICByZW1vdmVUb29sVGlwKCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUNsaWNrRXZlbnRzLmRvd24sIHNlbGYuc2hvdyxmYWxzZSk7XG4gICAgZWxlbWVudFthY3Rpb25dKG1vdXNlSG92ZXJFdmVudHNbMF0sIHNlbGYuc2hvdyxmYWxzZSk7XG4gICAgZWxlbWVudFthY3Rpb25dKG1vdXNlSG92ZXJFdmVudHNbMV0sIHNlbGYuaGlkZSxmYWxzZSk7XG4gIH1cbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodG9vbHRpcCA9PT0gbnVsbCkge1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgICAgaWYgKHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgICBpZihjcmVhdGVUb29sVGlwKCkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgdXBkYXRlVG9vbHRpcCgpO1xuICAgICAgICAgIHNob3dUb29sdGlwKCk7XG4gICAgICAgICAgISFvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9vbHRpcCwgc2hvd0FjdGlvbikgOiBzaG93QWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAyMCApO1xuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0b29sdGlwICYmIHRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgICAgIGlmIChoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvb2x0aXAsIGhpZGVBY3Rpb24pIDogaGlkZUFjdGlvbigpO1xuICAgICAgfVxuICAgIH0sIG9wcy5kZWxheSk7XG4gIH07XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdG9vbHRpcCkgeyBzZWxmLnNob3coKTsgfVxuICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgc2VsZi5oaWRlKCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKSk7XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKTtcbiAgICBkZWxldGUgZWxlbWVudC5Ub29sdGlwO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlRvb2x0aXAgJiYgZWxlbWVudC5Ub29sdGlwLmRpc3Bvc2UoKTtcbiAgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicpO1xuICBwbGFjZW1lbnREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGxhY2VtZW50Jyk7XG4gIGRlbGF5RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWRlbGF5Jyk7XG4gIGNvbnRhaW5lckRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jb250YWluZXInKTtcbiAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndG9vbHRpcCcpO1xuICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ3Rvb2x0aXAnKTtcbiAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAndG9vbHRpcCcpO1xuICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndG9vbHRpcCcpO1xuICBjb250YWluZXJFbGVtZW50ID0gcXVlcnlFbGVtZW50KG9wdGlvbnMuY29udGFpbmVyKTtcbiAgY29udGFpbmVyRGF0YUVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoY29udGFpbmVyRGF0YSk7XG4gIG1vZGFsID0gZWxlbWVudC5jbG9zZXN0KCcubW9kYWwnKTtcbiAgbmF2YmFyRml4ZWRUb3AgPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC10b3AnKTtcbiAgbmF2YmFyRml4ZWRCb3R0b20gPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC1ib3R0b20nKTtcbiAgb3BzLmFuaW1hdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uICYmIG9wdGlvbnMuYW5pbWF0aW9uICE9PSAnZmFkZScgPyBvcHRpb25zLmFuaW1hdGlvbiA6IGFuaW1hdGlvbkRhdGEgfHwgJ2ZhZGUnO1xuICBvcHMucGxhY2VtZW50ID0gb3B0aW9ucy5wbGFjZW1lbnQgPyBvcHRpb25zLnBsYWNlbWVudCA6IHBsYWNlbWVudERhdGEgfHwgJ3RvcCc7XG4gIG9wcy50ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogbnVsbDtcbiAgb3BzLmRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5kZWxheSB8fCBkZWxheURhdGEpIHx8IDIwMDtcbiAgb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lckVsZW1lbnQgPyBjb250YWluZXJFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogY29udGFpbmVyRGF0YUVsZW1lbnQgPyBjb250YWluZXJEYXRhRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkVG9wID8gbmF2YmFyRml4ZWRUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZEJvdHRvbSA/IG5hdmJhckZpeGVkQm90dG9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbW9kYWwgPyBtb2RhbCA6IGRvY3VtZW50LmJvZHk7XG4gIHBsYWNlbWVudENsYXNzID0gXCJicy10b29sdGlwLVwiICsgKG9wcy5wbGFjZW1lbnQpO1xuICB0aXRsZVN0cmluZyA9IGdldFRpdGxlKCk7XG4gIGlmICggIXRpdGxlU3RyaW5nICkgeyByZXR1cm47IH1cbiAgaWYgKCFlbGVtZW50LlRvb2x0aXApIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbC10aXRsZScsdGl0bGVTdHJpbmcpO1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpO1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBlbGVtZW50LlRvb2x0aXAgPSBzZWxmO1xufVxuXG52YXIgY29tcG9uZW50c0luaXQgPSB7fTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZURhdGFBUEkoIENvbnN0cnVjdG9yLCBjb2xsZWN0aW9uICl7XG4gIEFycmF5LmZyb20oY29sbGVjdGlvbikubWFwKGZ1bmN0aW9uICh4KXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih4KTsgfSk7XG59XG5mdW5jdGlvbiBpbml0Q2FsbGJhY2sobG9va1VwKXtcbiAgbG9va1VwID0gbG9va1VwIHx8IGRvY3VtZW50O1xuICBmb3IgKHZhciBjb21wb25lbnQgaW4gY29tcG9uZW50c0luaXQpIHtcbiAgICBpbml0aWFsaXplRGF0YUFQSSggY29tcG9uZW50c0luaXRbY29tcG9uZW50XVswXSwgbG9va1VwLnF1ZXJ5U2VsZWN0b3JBbGwgKGNvbXBvbmVudHNJbml0W2NvbXBvbmVudF1bMV0pICk7XG4gIH1cbn1cblxuY29tcG9uZW50c0luaXQuQWxlcnQgPSBbIEFsZXJ0LCAnW2RhdGEtZGlzbWlzcz1cImFsZXJ0XCJdJ107XG5jb21wb25lbnRzSW5pdC5CdXR0b24gPSBbIEJ1dHRvbiwgJ1tkYXRhLXRvZ2dsZT1cImJ1dHRvbnNcIl0nIF07XG5jb21wb25lbnRzSW5pdC5DYXJvdXNlbCA9IFsgQ2Fyb3VzZWwsICdbZGF0YS1yaWRlPVwiY2Fyb3VzZWxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Db2xsYXBzZSA9IFsgQ29sbGFwc2UsICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXScgXTtcbmNvbXBvbmVudHNJbml0LkRyb3Bkb3duID0gWyBEcm9wZG93biwgJ1tkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCJdJ107XG5jb21wb25lbnRzSW5pdC5Nb2RhbCA9IFsgTW9kYWwsICdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScgXTtcbmNvbXBvbmVudHNJbml0LlBvcG92ZXIgPSBbIFBvcG92ZXIsICdbZGF0YS10b2dnbGU9XCJwb3BvdmVyXCJdLFtkYXRhLXRpcD1cInBvcG92ZXJcIl0nIF07XG5jb21wb25lbnRzSW5pdC5TY3JvbGxTcHkgPSBbIFNjcm9sbFNweSwgJ1tkYXRhLXNweT1cInNjcm9sbFwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRhYiA9IFsgVGFiLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJyBdO1xuY29tcG9uZW50c0luaXQuVG9hc3QgPSBbIFRvYXN0LCAnW2RhdGEtZGlzbWlzcz1cInRvYXN0XCJdJyBdO1xuY29tcG9uZW50c0luaXQuVG9vbHRpcCA9IFsgVG9vbHRpcCwgJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0sW2RhdGEtdGlwPVwidG9vbHRpcFwiXScgXTtcbmRvY3VtZW50LmJvZHkgPyBpbml0Q2FsbGJhY2soKSA6IGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gaW5pdFdyYXBwZXIoKXtcblx0aW5pdENhbGxiYWNrKCk7XG5cdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLGluaXRXcmFwcGVyLGZhbHNlKTtcbn0sIGZhbHNlICk7XG5cbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnREYXRhQVBJKCBDb25zdHJ1Y3Rvck5hbWUsIGNvbGxlY3Rpb24gKXtcbiAgQXJyYXkuZnJvbShjb2xsZWN0aW9uKS5tYXAoZnVuY3Rpb24gKHgpeyByZXR1cm4geFtDb25zdHJ1Y3Rvck5hbWVdLmRpc3Bvc2UoKTsgfSk7XG59XG5mdW5jdGlvbiByZW1vdmVEYXRhQVBJKGxvb2tVcCkge1xuICBsb29rVXAgPSBsb29rVXAgfHwgZG9jdW1lbnQ7XG4gIGZvciAodmFyIGNvbXBvbmVudCBpbiBjb21wb25lbnRzSW5pdCkge1xuICAgIHJlbW92ZUVsZW1lbnREYXRhQVBJKCBjb21wb25lbnQsIGxvb2tVcC5xdWVyeVNlbGVjdG9yQWxsIChjb21wb25lbnRzSW5pdFtjb21wb25lbnRdWzFdKSApO1xuICB9XG59XG5cbnZhciB2ZXJzaW9uID0gXCIzLjAuMTBcIjtcblxudmFyIGluZGV4ID0ge1xuICBBbGVydDogQWxlcnQsXG4gIEJ1dHRvbjogQnV0dG9uLFxuICBDYXJvdXNlbDogQ2Fyb3VzZWwsXG4gIENvbGxhcHNlOiBDb2xsYXBzZSxcbiAgRHJvcGRvd246IERyb3Bkb3duLFxuICBNb2RhbDogTW9kYWwsXG4gIFBvcG92ZXI6IFBvcG92ZXIsXG4gIFNjcm9sbFNweTogU2Nyb2xsU3B5LFxuICBUYWI6IFRhYixcbiAgVG9hc3Q6IFRvYXN0LFxuICBUb29sdGlwOiBUb29sdGlwLFxuICBpbml0Q2FsbGJhY2s6IGluaXRDYWxsYmFjayxcbiAgcmVtb3ZlRGF0YUFQSTogcmVtb3ZlRGF0YUFQSSxcbiAgY29tcG9uZW50c0luaXQ6IGNvbXBvbmVudHNJbml0LFxuICBWZXJzaW9uOiB2ZXJzaW9uXG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmRleDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgKHV0aWxzLmlzQmxvYihyZXF1ZXN0RGF0YSkgfHwgdXRpbHMuaXNGaWxlKHJlcXVlc3REYXRhKSkgJiZcbiAgICAgIHJlcXVlc3REYXRhLnR5cGVcbiAgICApIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSB8fCAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb25jZShmbikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGZuID0gbnVsbDtcbiAgICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub29wICgpIHt9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2FzeW5jLnV0aWwuaXNhcnJheScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXJyYXlMaWtlKGFycikge1xuICAgIHJldHVybiBpc0FycmF5KGFycikgfHwgKFxuICAgICAgICAvLyBoYXMgYSBwb3NpdGl2ZSBpbnRlZ2VyIGxlbmd0aCBwcm9wZXJ0eVxuICAgICAgICB0eXBlb2YgYXJyLmxlbmd0aCA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgYXJyLmxlbmd0aCA+PSAwICYmXG4gICAgICAgIGFyci5sZW5ndGggJSAxID09PSAwXG4gICAgKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBvbmNlID0gcmVxdWlyZSgnYXN5bmMudXRpbC5vbmNlJyk7XG52YXIgbm9vcCA9IHJlcXVpcmUoJ2FzeW5jLnV0aWwubm9vcCcpO1xudmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnYXN5bmMudXRpbC5pc2FycmF5bGlrZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1hcEFzeW5jKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2IpIHtcbiAgICBjYiA9IG9uY2UoY2IgfHwgbm9vcCk7XG4gICAgYXJyID0gYXJyIHx8IFtdO1xuICAgIHZhciByZXN1bHRzID0gaXNBcnJheUxpa2UoYXJyKSA/IFtdIDoge307XG4gICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY2IpIHtcbiAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgY2IoZXJyLCByZXN1bHRzKTtcbiAgICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb25seV9vbmNlKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZm4gPT09IG51bGwpIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLicpO1xuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBmbiA9IG51bGw7XG4gICAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgICB2YXIgX2tleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICBfa2V5cy5wdXNoKGspO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfa2V5cztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfa2V5cyA9IHJlcXVpcmUoJ2FzeW5jLnV0aWwua2V5cycpO1xudmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnYXN5bmMudXRpbC5pc2FycmF5bGlrZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtleUl0ZXJhdG9yKGNvbGwpIHtcbiAgICB2YXIgaSA9IC0xO1xuICAgIHZhciBsZW47XG4gICAgdmFyIGtleXM7XG4gICAgaWYgKGlzQXJyYXlMaWtlKGNvbGwpKSB7XG4gICAgICAgIGxlbiA9IGNvbGwubGVuZ3RoO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8gaSA6IG51bGw7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAga2V5cyA9IF9rZXlzKGNvbGwpO1xuICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICB9O1xuICAgIH1cbn07XG4iLCJ2YXIgb25jZSA9IHJlcXVpcmUoJ2FzeW5jLnV0aWwub25jZScpO1xudmFyIG5vb3AgPSByZXF1aXJlKCdhc3luYy51dGlsLm5vb3AnKTtcbnZhciBvbmx5T25jZSA9IHJlcXVpcmUoJ2FzeW5jLnV0aWwub25seW9uY2UnKTtcbnZhciBrZXlJdGVyYXRvciA9IHJlcXVpcmUoJ2FzeW5jLnV0aWwua2V5aXRlcmF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlYWNoT2ZMaW1pdChsaW1pdCkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjYikge1xuICAgICAgICBjYiA9IG9uY2UoY2IgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBrZXlJdGVyYXRvcihvYmopO1xuICAgICAgICBpZiAobGltaXQgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAoZnVuY3Rpb24gcmVwbGVuaXNoKCkge1xuICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5T25jZShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsZW5pc2goKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkoKTtcbiAgICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVhY2hPZkxpbWl0ID0gcmVxdWlyZSgnYXN5bmMudXRpbC5lYWNob2ZsaW1pdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgcmV0dXJuIGZuKGVhY2hPZkxpbWl0KGxpbWl0KSwgb2JqLCBpdGVyYXRvciwgY2IpO1xuICAgIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG1hcEFzeW5jID0gcmVxdWlyZSgnYXN5bmMudXRpbC5tYXBhc3luYycpO1xudmFyIGRvUGFyYWxsZWxMaW1pdCA9IHJlcXVpcmUoJ2FzeW5jLnV0aWwuZG9wYXJhbGxlbGxpbWl0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGRvUGFyYWxsZWxMaW1pdChtYXBBc3luYyk7XG5cblxuIiwiLyogZXNsaW50LWRpc2FibGUgbm8tdGVtcGxhdGUtY3VybHktaW4tc3RyaW5nICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dHJpYnV0ZVRvU3RyaW5nKGF0dHJpYnV0ZSkge1xuICBpZiAodHlwZW9mIGF0dHJpYnV0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICBhdHRyaWJ1dGUgKz0gJyc7XG4gICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGF0dHJpYnV0ZSA9ICcnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXR0cmlidXRlLnRyaW0oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUNsYXNzKGVsZW0sIGNsYXNzTmFtZSkge1xuICBlbGVtLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW0sIC4uLmNsYXNzTmFtZXMpIHtcbiAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKC4uLmNsYXNzTmFtZXMpO1xuICByZXR1cm4gZWxlbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoQ3VzdG9tRXZlbnQoZWxlbSwgZXZlbnROYW1lLCBwcm9wZXJ0aWVzKSB7XG4gIGVsZW0uZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCBwcm9wZXJ0aWVzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNb25leShjZW50cywgZm9ybWF0KSB7XG4gIGlmICh0eXBlb2YgY2VudHMgPT09ICdzdHJpbmcnKSB7XG4gICAgY2VudHMgPSBjZW50cy5yZXBsYWNlKCcuJywgJycpO1xuICB9XG4gIGxldCB2YWx1ZSA9ICcnO1xuICBjb25zdCBwbGFjZWhvbGRlclJlZ2V4ID0gL1xce1xce1xccyooXFx3KylcXHMqXFx9XFx9LztcbiAgY29uc3QgZm9ybWF0U3RyaW5nID0gZm9ybWF0IHx8ICcke3thbW91bnR9fSc7XG5cbiAgZnVuY3Rpb24gZm9ybWF0V2l0aERlbGltaXRlcnMoXG4gICAgbnVtYmVyLFxuICAgIHByZWNpc2lvbiA9IDIsXG4gICAgdGhvdXNhbmRzID0gJywnLFxuICAgIGRlY2ltYWwgPSAnLidcbiAgKSB7XG4gICAgaWYgKE51bWJlci5pc05hTihudW1iZXIpIHx8IG51bWJlciA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBudW1iZXIgPSAobnVtYmVyIC8gMTAwLjApLnRvRml4ZWQocHJlY2lzaW9uKTtcblxuICAgIGNvbnN0IHBhcnRzID0gbnVtYmVyLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgZG9sbGFyc0Ftb3VudCA9IHBhcnRzWzBdLnJlcGxhY2UoXG4gICAgICAvKFxcZCkoPz0oXFxkXFxkXFxkKSsoPyFcXGQpKS9nLFxuICAgICAgYCQxJHt0aG91c2FuZHN9YFxuICAgICk7XG4gICAgY29uc3QgY2VudHNBbW91bnQgPSBwYXJ0c1sxXSA/IGRlY2ltYWwgKyBwYXJ0c1sxXSA6ICcnO1xuXG4gICAgcmV0dXJuIGRvbGxhcnNBbW91bnQgKyBjZW50c0Ftb3VudDtcbiAgfVxuXG4gIHN3aXRjaCAoZm9ybWF0U3RyaW5nLm1hdGNoKHBsYWNlaG9sZGVyUmVnZXgpWzFdKSB7XG4gICAgY2FzZSAnYW1vdW50JzpcbiAgICAgIHZhbHVlID0gZm9ybWF0V2l0aERlbGltaXRlcnMoY2VudHMsIDIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYW1vdW50X25vX2RlY2ltYWxzJzpcbiAgICAgIHZhbHVlID0gZm9ybWF0V2l0aERlbGltaXRlcnMoY2VudHMsIDApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYW1vdW50X3dpdGhfY29tbWFfc2VwYXJhdG9yJzpcbiAgICAgIHZhbHVlID0gZm9ybWF0V2l0aERlbGltaXRlcnMoY2VudHMsIDIsICcuJywgJywnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Ftb3VudF9ub19kZWNpbWFsc193aXRoX2NvbW1hX3NlcGFyYXRvcic6XG4gICAgICB2YWx1ZSA9IGZvcm1hdFdpdGhEZWxpbWl0ZXJzKGNlbnRzLCAwLCAnLicsICcsJyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdmFsdWUgPSBmb3JtYXRXaXRoRGVsaW1pdGVycyhjZW50cywgMik7XG4gIH1cblxuICByZXR1cm4gZm9ybWF0U3RyaW5nLnJlcGxhY2UocGxhY2Vob2xkZXJSZWdleCwgdmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOaWwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkodmFsdWUpIHtcbiAgcmV0dXJuIGlzTmlsKHZhbHVlKSA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbn1cblxuY29uc3QgZXNjYXBlTWFwID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyYjMzQ7JyxcbiAgXCInXCI6ICcmIzM5OycsXG59O1xuY29uc3QgdW5lc2NhcGVNYXAgPSB7XG4gICcmYW1wOyc6ICcmJyxcbiAgJyZsdDsnOiAnPCcsXG4gICcmZ3Q7JzogJz4nLFxuICAnJiMzNDsnOiAnXCInLFxuICAnJiMzOTsnOiBcIidcIixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGUoc3RyKSB7XG4gIHJldHVybiBzdHJpbmdpZnkoc3RyKS5yZXBsYWNlKC8mfDx8PnxcInwnL2csIChtKSA9PiBlc2NhcGVNYXBbbV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGUoc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyKS5yZXBsYWNlKC8mKGFtcHxsdHxndHwjMzR8IzM5KTsvZywgKG0pID0+IHVuZXNjYXBlTWFwW21dKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBhdHRyaWJ1dGVUb1N0cmluZyxcbiAgdG9nZ2xlQ2xhc3MsXG4gIHJlbW92ZUNsYXNzLFxuICBkaXNwYXRjaEN1c3RvbUV2ZW50LFxuICBmb3JtYXRNb25leSxcbiAgaXNOaWwsXG4gIHN0cmluZ2lmeSxcbiAgZXNjYXBlLFxuICB1bmVzY2FwZSxcbn07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZXJzY29yZS1kYW5nbGUgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXNoYWRvdyAqL1xuLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5pbXBvcnQgQXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IG1hcExpbWl0IGZyb20gJ2FzeW5jLm1hcGxpbWl0JztcbmltcG9ydCB7IGF0dHJpYnV0ZVRvU3RyaW5nIH0gZnJvbSAnLi9oZWxwZXInO1xuXG5jb25zdCBpbnN0YW5jZSA9IEF4aW9zLmNyZWF0ZSh7XG4gIGhlYWRlcnM6IHsgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnIH0sXG59KTtcbmNvbnN0IGFqYXhUZW1wbGF0ZUZ1bmMgPSAodXJsLCBtZXRob2QgPSAnZ2V0JywgZGF0YSA9IHt9LCBjb25maWcgPSB7fSkgPT4ge1xuICBjb25zdCBlbmNvZGVkID0gZW5jb2RlVVJJKHVybCk7XG4gIGxldCByZXF1ZXN0O1xuICBpZiAobWV0aG9kID09PSAnZ2V0Jykge1xuICAgIHJlcXVlc3QgPSBpbnN0YW5jZS5nZXQoZW5jb2RlZCwgY29uZmlnKTtcbiAgfSBlbHNlIHtcbiAgICByZXF1ZXN0ID0gaW5zdGFuY2UucG9zdChlbmNvZGVkLCBkYXRhLCBjb25maWcpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0XG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIHJldHVybiBlcnJvciAmJiBlcnJvci5yZXNwb25zZSAmJiBlcnJvci5yZXNwb25zZS5kYXRhO1xuICAgIH0pO1xufTtcbi8vIHRvZG86IHVybGVuY29kZVxuXG5leHBvcnQgY29uc3QgZ2V0Q2FydCA9ICgpID0+IHtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoJy9jYXJ0LmpzJyk7XG59O1xuZXhwb3J0IGNvbnN0IGdldFByb2R1Y3QgPSAoaGFuZGxlKSA9PiB7XG4gIHJldHVybiBhamF4VGVtcGxhdGVGdW5jKGAvcHJvZHVjdHMvJHtoYW5kbGV9LmpzYCk7XG59O1xuZXhwb3J0IGNvbnN0IGNsZWFyQ2FydCA9ICgpID0+IHtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoJy9jYXJ0L2NsZWFyLmpzJywgJ3Bvc3QnKTtcbn07XG5leHBvcnQgY29uc3QgdXBkYXRlQ2FydEZyb21Gb3JtID0gKGZvcm0pID0+IHtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoJy9jYXJ0L3VwZGF0ZS5qcycsICdwb3N0JywgbmV3IEZvcm1EYXRhKGZvcm0pKTtcbn07XG5leHBvcnQgY29uc3QgY2hhbmdlSXRlbUJ5S2V5T3JJZCA9IChpZCwgcXVhbnRpdHkpID0+IHtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoJy9jYXJ0L2NoYW5nZS5qcycsICdwb3N0Jywge1xuICAgIHF1YW50aXR5LFxuICAgIGlkLFxuICB9KTtcbn07XG5leHBvcnQgY29uc3QgcmVtb3ZlSXRlbUJ5S2V5T3JJZCA9IChpZCkgPT4ge1xuICByZXR1cm4gYWpheFRlbXBsYXRlRnVuYygnL2NhcnQvY2hhbmdlLmpzJywgJ3Bvc3QnLCB7IHF1YW50aXR5OiAwLCBpZCB9KTtcbn07XG5leHBvcnQgY29uc3QgY2hhbmdlSXRlbUJ5TGluZSA9IChsaW5lLCBxdWFudGl0eSwgcHJvcGVydGllcykgPT4ge1xuICByZXR1cm4gYWpheFRlbXBsYXRlRnVuYygnL2NhcnQvY2hhbmdlLmpzJywgJ3Bvc3QnLCB7XG4gICAgcXVhbnRpdHksXG4gICAgbGluZSxcbiAgICBwcm9wZXJ0aWVzLFxuICB9KTtcbn07XG5leHBvcnQgY29uc3QgcmVtb3ZlSXRlbUJ5TGluZSA9IChsaW5lKSA9PiB7XG4gIHJldHVybiBhamF4VGVtcGxhdGVGdW5jKCcvY2FydC9jaGFuZ2UuanMnLCAncG9zdCcsIHsgcXVhbnRpdHk6IDAsIGxpbmUgfSk7XG59O1xuZXhwb3J0IGNvbnN0IGFkZEl0ZW0gPSAoaWQsIHF1YW50aXR5LCBwcm9wZXJ0aWVzID0ge30pID0+IHtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoJy9jYXJ0L2FkZC5qcycsICdwb3N0Jywge1xuICAgIGlkLFxuICAgIHF1YW50aXR5LFxuICAgIHByb3BlcnRpZXMsXG4gIH0pO1xufTtcbmV4cG9ydCBjb25zdCBhZGRJdGVtRnJvbUZvcm0gPSAoZm9ybSkgPT4ge1xuICByZXR1cm4gYWpheFRlbXBsYXRlRnVuYygnL2NhcnQvYWRkLmpzJywgJ3Bvc3QnLCBuZXcgRm9ybURhdGEoZm9ybSkpO1xufTtcbmV4cG9ydCBjb25zdCB1cGRhdGVDYXJ0QXR0cmlidXRlcyA9IChhdHRyaWJ1dGVzKSA9PiB7XG4gIGxldCBkYXRhID0gJyc7XG4gIGlmIChBcnJheS5pc0FycmF5KGF0dHJpYnV0ZXMpKSB7XG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGF0dHJpYnV0ZVRvU3RyaW5nKGF0dHJpYnV0ZS5rZXkpO1xuICAgICAgaWYgKGtleSAhPT0gJycpIHtcbiAgICAgICAgZGF0YSArPSBgYXR0cmlidXRlc1ske2tleX1dPSR7YXR0cmlidXRlVG9TdHJpbmcoYXR0cmlidXRlLnZhbHVlKX0mYDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgYXR0cmlidXRlcyA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcyAhPT0gbnVsbCkge1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICBkYXRhICs9IGBhdHRyaWJ1dGVzWyR7YXR0cmlidXRlVG9TdHJpbmcoa2V5KX1dPSR7YXR0cmlidXRlVG9TdHJpbmcoXG4gICAgICAgIHZhbHVlXG4gICAgICApfSZgO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBhamF4VGVtcGxhdGVGdW5jKCcvY2FydC91cGRhdGUuanMnLCAncG9zdCcsIGRhdGEpO1xufTtcbmV4cG9ydCBjb25zdCB1cGRhdGVDYXJ0Tm90ZSA9IChub3RlKSA9PiB7XG4gIHJldHVybiBhamF4VGVtcGxhdGVGdW5jKFxuICAgICcvY2FydC91cGRhdGUuanMnLFxuICAgICdwb3N0JyxcbiAgICBgbm90ZT0ke2F0dHJpYnV0ZVRvU3RyaW5nKG5vdGUpfWBcbiAgKTtcbn07XG5leHBvcnQgY29uc3QgZ2V0UmVjb21tZW5kZWRQcm9kdWN0cyA9IChwcm9kdWN0SWQsIGxpbWl0ID0gMTApID0+IHtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoXG4gICAgYC9yZWNvbW1lbmRhdGlvbnMvcHJvZHVjdHMuanNvbj9wcm9kdWN0X2lkPSR7cHJvZHVjdElkfSZsaW1pdD0ke1xuICAgICAgbGltaXQgJiYgcGFyc2VJbnQobGltaXQsIDEwKSA+IDAgJiYgcGFyc2VJbnQobGltaXQsIDEwKSA8PSAxMFxuICAgICAgICA/IHBhcnNlSW50KGxpbWl0LCAxMClcbiAgICAgICAgOiAxMFxuICAgIH1gXG4gICk7XG59O1xuZXhwb3J0IGNvbnN0IGdldFByZWRpY3RpdmVTZWFyY2hSZXN1bHRzID0gKFxuICBxLFxuICB0eXBlID0gWydwcm9kdWN0JywgJ3BhZ2UnLCAnYXJ0aWNsZScsICdjb2xsZWN0aW9uJ10sXG4gIGxpbWl0ID0gMTAsXG4gIHVuYXZhaWxhYmxlUHJvZHVjdHMgPSAnbGFzdCcsXG4gIGZpZWxkcyA9IFsndGl0bGUnLCAncHJvZHVjdF90eXBlJywgJ3ZhcmlhbnRzLnRpdGxlJywgJ3ZlbmRvciddXG4pID0+IHtcbiAgbGV0IHBhcmFtc1N0cmluZyA9ICcnO1xuICBwYXJhbXNTdHJpbmcgKz0gYHE9JHtxfWA7XG4gIHBhcmFtc1N0cmluZyArPSBgJnJlc291cmNlc1t0eXBlXT0ke3R5cGUuam9pbignLCcpfWA7XG4gIHBhcmFtc1N0cmluZyArPSBgJnJlc291cmNlc1tsaW1pdF09JHtsaW1pdH1gO1xuICBwYXJhbXNTdHJpbmcgKz0gYCZyZXNvdXJjZXNbb3B0aW9uc11bdW5hdmFpbGFibGVfcHJvZHVjdHNdPSR7dW5hdmFpbGFibGVQcm9kdWN0c31gO1xuICBwYXJhbXNTdHJpbmcgKz0gYCZyZXNvdXJjZXNbb3B0aW9uc11bZmllbGRzXT0ke2ZpZWxkcy5qb2luKCcsJyl9YDtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoYC9zZWFyY2gvc3VnZ2VzdC5qc29uPyR7cGFyYW1zU3RyaW5nfWApO1xufTtcbmV4cG9ydCBjb25zdCBfZ2V0UGFnZUNvbGxlY3Rpb24gPSAoaGFuZGxlLCBwYWdlID0gMSwgdGFnID0gJycpID0+IHtcbiAgcmV0dXJuIGFqYXhUZW1wbGF0ZUZ1bmMoXG4gICAgdHlwZW9mIHRhZyAhPT0gJ3N0cmluZycgfHwgdGFnID09PSAnJ1xuICAgICAgPyBgL2NvbGxlY3Rpb25zLyR7aGFuZGxlfT92aWV3PXRoZW1lJnBhZ2U9JHtwYWdlfWBcbiAgICAgIDogYC9jb2xsZWN0aW9ucy8ke2hhbmRsZX0vJHt0YWd9P3ZpZXc9dGhlbWUmcGFnZT0ke3BhZ2V9YCxcbiAgICAnZ2V0JyxcbiAgICB7fSxcbiAgICB7IGhlYWRlcnM6IHsgYWNjZXB0OiAndGV4dC9odG1sJyB9IH1cbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb2xsZWN0aW9uID0gKGhhbmRsZSwgdGFnID0gJycpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgbGV0IHByb2R1Y3RzX2hhbmRsZXMgPSBbXTtcbiAgICBjb25zdCBjdXJyZW50X3BhZ2UgPSAxO1xuICAgIGNvbnN0IGdldFBhZ2VDb2xsZWN0aW9uID0gKGhhbmRsZSwgY3VycmVudF9wYWdlLCB0YWcpID0+IHtcbiAgICAgIF9nZXRQYWdlQ29sbGVjdGlvbihoYW5kbGUsIGN1cnJlbnRfcGFnZSwgdGFnKS50aGVuKChjb2xsZWN0aW9uKSA9PiB7XG4gICAgICAgIHByb2R1Y3RzX2hhbmRsZXMgPSBbXG4gICAgICAgICAgLi4ucHJvZHVjdHNfaGFuZGxlcyxcbiAgICAgICAgICAuLi5jb2xsZWN0aW9uLnByb2R1Y3RzX2hhbmRsZXMsXG4gICAgICAgIF07XG4gICAgICAgIGlmIChjb2xsZWN0aW9uLnBhZ2luYXRlLmN1cnJlbnRfcGFnZSA8IGNvbGxlY3Rpb24ucGFnaW5hdGUucGFnZXMpIHtcbiAgICAgICAgICBjdXJyZW50X3BhZ2UgKz0gMTtcbiAgICAgICAgICBnZXRQYWdlQ29sbGVjdGlvbihoYW5kbGUsIGN1cnJlbnRfcGFnZSwgdGFnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHsgLi4uY29sbGVjdGlvbiwgcHJvZHVjdHNfaGFuZGxlcyB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgICBnZXRQYWdlQ29sbGVjdGlvbihoYW5kbGUsIGN1cnJlbnRfcGFnZSwgdGFnKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q29sbGVjdGlvbldpdGhQcm9kdWN0c0RldGFpbHMgPSAoXG4gIGhhbmRsZSxcbiAgdGFnID0gJycsXG4gIHByb2R1Y3RzTG9hZGVkQ2FsbGJhY2tcbikgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGdldENvbGxlY3Rpb24oaGFuZGxlLCB0YWcpLnRoZW4oKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgIGNvbnN0IHByb2R1Y3RzSGFuZGxlcyA9IGNvbGxlY3Rpb24ucHJvZHVjdHNfaGFuZGxlcztcbiAgICAgIGxldCBwcm9kdWN0c0NvdW50ID0gcHJvZHVjdHNIYW5kbGVzLmxlbmd0aDtcbiAgICAgIGxldCB0bXBQcm9kdWN0cyA9IFtdO1xuICAgICAgbGV0IHVwZGF0ZWRDb2xsZWN0aW9uID0gY29sbGVjdGlvbjtcbiAgICAgIG1hcExpbWl0KFxuICAgICAgICBwcm9kdWN0c0hhbmRsZXMsXG4gICAgICAgIDUsXG4gICAgICAgIChwcm9kdWN0SGFuZGxlLCBjYWxsYmFjaykgPT4ge1xuICAgICAgICAgIGdldFByb2R1Y3QocHJvZHVjdEhhbmRsZSlcbiAgICAgICAgICAgIC50aGVuKChwcm9kdWN0KSA9PiB7XG4gICAgICAgICAgICAgIHByb2R1Y3RzQ291bnQgLT0gMTtcbiAgICAgICAgICAgICAgdG1wUHJvZHVjdHMucHVzaChwcm9kdWN0KTtcbiAgICAgICAgICAgICAgaWYgKHRtcFByb2R1Y3RzLmxlbmd0aCA9PT0gNSB8fCBwcm9kdWN0c0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9kdWN0c0xvYWRlZENhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICB1cGRhdGVkQ29sbGVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgcHJvZHVjdHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlZENvbGxlY3Rpb24ucHJvZHVjdHMgfHwgW10pLFxuICAgICAgICAgICAgICAgICAgICAgIC4uLnRtcFByb2R1Y3RzLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHByb2R1Y3RzTG9hZGVkQ2FsbGJhY2sodXBkYXRlZENvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0bXBQcm9kdWN0cyA9IFtdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBwcm9kdWN0O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChwcm9kdWN0KSA9PiB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHByb2R1Y3QpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIChlcnIsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5wcm9kdWN0cyA9IHJlc3VsdHM7XG4gICAgICAgICAgICByZXNvbHZlKGNvbGxlY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGdldENhcnQsXG4gIGdldFByb2R1Y3QsXG4gIGNsZWFyQ2FydCxcbiAgdXBkYXRlQ2FydEZyb21Gb3JtLFxuICBjaGFuZ2VJdGVtQnlLZXlPcklkLFxuICByZW1vdmVJdGVtQnlLZXlPcklkLFxuICBjaGFuZ2VJdGVtQnlMaW5lLFxuICByZW1vdmVJdGVtQnlMaW5lLFxuICBhZGRJdGVtLFxuICBhZGRJdGVtRnJvbUZvcm0sXG4gIHVwZGF0ZUNhcnRBdHRyaWJ1dGVzLFxuICB1cGRhdGVDYXJ0Tm90ZSxcbiAgZ2V0UmVjb21tZW5kZWRQcm9kdWN0cyxcbiAgZ2V0UHJlZGljdGl2ZVNlYXJjaFJlc3VsdHMsXG4gIF9nZXRQYWdlQ29sbGVjdGlvbixcbiAgZ2V0Q29sbGVjdGlvbixcbiAgZ2V0Q29sbGVjdGlvbldpdGhQcm9kdWN0c0RldGFpbHMsXG59O1xuIiwiLyogQHByZXNlcnZlXG4gICAgX19fX18gX18gXyAgICAgX18gICAgICAgICAgICAgICAgX1xuICAgLyBfX18vLyAvKF8pX19fLyAvX19fICBfX19fICAgICAgKF8pX19fXG4gIC8gKF8gLy8gLy8gLy8gXyAgLy8gLV8pLyBfXy9fICAgIC8gLyhfLTxcbiAgXFxfX18vL18vL18vIFxcXyxfLyBcXF9fLy9fLyAgKF8pX18vIC8vX19fL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfF9fXy9cblxuICBWZXJzaW9uOiAxLjcuM1xuICBBdXRob3I6IE5pY2sgUGlzY2l0ZWxsaSAocGlja3lrbmVlZSlcbiAgV2Vic2l0ZTogaHR0cHM6Ly9uaWNrcGlzY2l0ZWxsaS5jb21cbiAgRG9jdW1lbnRhdGlvbjogaHR0cDovL25pY2twaXNjaXRlbGxpLmdpdGh1Yi5pby9HbGlkZXIuanNcbiAgTGljZW5zZTogTUlUIExpY2Vuc2VcbiAgUmVsZWFzZSBEYXRlOiBPY3RvYmVyIDI1dGgsIDIwMThcblxuKi9cblxuLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kXG4gICAgPyBkZWZpbmUoZmFjdG9yeSlcbiAgICA6IHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0J1xuICAgICAgPyAobW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkpXG4gICAgICA6IGZhY3RvcnkoKVxufSkoZnVuY3Rpb24gKCkge1xuICAoJ3VzZSBzdHJpY3QnKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xuXG4gIC8qIGdsb2JhbHMgd2luZG93OnRydWUgKi9cbiAgdmFyIF93aW5kb3cgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXNcblxuICB2YXIgR2xpZGVyID0gKF93aW5kb3cuR2xpZGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgdmFyIF8gPSB0aGlzXG5cbiAgICBpZiAoZWxlbWVudC5fZ2xpZGVyKSByZXR1cm4gZWxlbWVudC5fZ2xpZGVyXG5cbiAgICBfLmVsZSA9IGVsZW1lbnRcbiAgICBfLmVsZS5jbGFzc0xpc3QuYWRkKCdnbGlkZXInKVxuXG4gICAgLy8gZXhwb3NlIGdsaWRlciBvYmplY3QgdG8gaXRzIERPTSBlbGVtZW50XG4gICAgXy5lbGUuX2dsaWRlciA9IF9cblxuICAgIC8vIG1lcmdlIHVzZXIgc2V0dGluZyB3aXRoIGRlZmF1bHRzXG4gICAgXy5vcHQgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgIHJlc2l6ZUxvY2s6IHRydWUsXG4gICAgICAgIGR1cmF0aW9uOiAwLjUsXG4gICAgICAgIC8vIGVhc2VJblF1YWRcbiAgICAgICAgZWFzaW5nOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgIHJldHVybiBjICogKHQgLz0gZCkgKiB0ICsgYlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0dGluZ3NcbiAgICApXG5cbiAgICAvLyBzZXQgZGVmYXVsdHNcbiAgICBfLmFuaW1hdGVfaWQgPSBfLnBhZ2UgPSBfLnNsaWRlID0gMFxuICAgIF8uYXJyb3dzID0ge31cblxuICAgIC8vIHByZXNlcnZlIG9yaWdpbmFsIG9wdGlvbnMgdG9cbiAgICAvLyBleHRlbmQgYnJlYWtwb2ludCBzZXR0aW5nc1xuICAgIF8uX29wdCA9IF8ub3B0XG5cbiAgICBpZiAoXy5vcHQuc2tpcFRyYWNrKSB7XG4gICAgICAvLyBmaXJzdCBhbmQgb25seSBjaGlsZCBpcyB0aGUgdHJhY2tcbiAgICAgIF8udHJhY2sgPSBfLmVsZS5jaGlsZHJlblswXVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjcmVhdGUgdHJhY2sgYW5kIHdyYXAgc2xpZGVzXG4gICAgICBfLnRyYWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIF8uZWxlLmFwcGVuZENoaWxkKF8udHJhY2spXG4gICAgICB3aGlsZSAoXy5lbGUuY2hpbGRyZW4ubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIF8udHJhY2suYXBwZW5kQ2hpbGQoXy5lbGUuY2hpbGRyZW5bMF0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgXy50cmFjay5jbGFzc0xpc3QuYWRkKCdnbGlkZXItdHJhY2snKVxuXG4gICAgLy8gc3RhcnQgZ2xpZGVyXG4gICAgXy5pbml0KClcblxuICAgIC8vIHNldCBldmVudHNcbiAgICBfLnJlc2l6ZSA9IF8uaW5pdC5iaW5kKF8sIHRydWUpXG4gICAgXy5ldmVudChfLmVsZSwgJ2FkZCcsIHtcbiAgICAgIHNjcm9sbDogXy51cGRhdGVDb250cm9scy5iaW5kKF8pXG4gICAgfSlcbiAgICBfLmV2ZW50KF93aW5kb3csICdhZGQnLCB7XG4gICAgICByZXNpemU6IF8ucmVzaXplXG4gICAgfSlcbiAgfSlcblxuICB2YXIgZ2xpZGVyUHJvdG90eXBlID0gR2xpZGVyLnByb3RvdHlwZVxuICBnbGlkZXJQcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChyZWZyZXNoLCBwYWdpbmcpIHtcbiAgICB2YXIgXyA9IHRoaXNcblxuICAgIHZhciB3aWR0aCA9IDBcblxuICAgIHZhciBoZWlnaHQgPSAwXG5cbiAgICBfLnNsaWRlcyA9IF8udHJhY2suY2hpbGRyZW47XG5cbiAgICBbXS5mb3JFYWNoLmNhbGwoXy5zbGlkZXMsIGZ1bmN0aW9uIChfKSB7XG4gICAgICBfLmNsYXNzTGlzdC5hZGQoJ2dsaWRlci1zbGlkZScpXG4gICAgfSlcblxuICAgIF8uY29udGFpbmVyV2lkdGggPSBfLmVsZS5jbGllbnRXaWR0aFxuXG4gICAgdmFyIGJyZWFrcG9pbnRDaGFuZ2VkID0gXy5zZXR0aW5nc0JyZWFrcG9pbnQoKVxuICAgIGlmICghcGFnaW5nKSBwYWdpbmcgPSBicmVha3BvaW50Q2hhbmdlZFxuXG4gICAgaWYgKFxuICAgICAgXy5vcHQuc2xpZGVzVG9TaG93ID09PSAnYXV0bycgfHxcbiAgICAgIHR5cGVvZiBfLm9wdC5fYXV0b1NsaWRlICE9PSAndW5kZWZpbmVkJ1xuICAgICkge1xuICAgICAgdmFyIHNsaWRlQ291bnQgPSBfLmNvbnRhaW5lcldpZHRoIC8gXy5vcHQuaXRlbVdpZHRoXG5cbiAgICAgIF8ub3B0Ll9hdXRvU2xpZGUgPSBfLm9wdC5zbGlkZXNUb1Nob3cgPSBfLm9wdC5leGFjdFdpZHRoXG4gICAgICAgID8gc2xpZGVDb3VudFxuICAgICAgICA6IE1hdGguZmxvb3Ioc2xpZGVDb3VudClcbiAgICB9XG4gICAgaWYgKF8ub3B0LnNsaWRlc1RvU2Nyb2xsID09PSAnYXV0bycpIHtcbiAgICAgIF8ub3B0LnNsaWRlc1RvU2Nyb2xsID0gTWF0aC5mbG9vcihfLm9wdC5zbGlkZXNUb1Nob3cpXG4gICAgfVxuXG4gICAgXy5pdGVtV2lkdGggPSBfLm9wdC5leGFjdFdpZHRoXG4gICAgICA/IF8ub3B0Lml0ZW1XaWR0aFxuICAgICAgOiBfLmNvbnRhaW5lcldpZHRoIC8gXy5vcHQuc2xpZGVzVG9TaG93O1xuXG4gICAgLy8gc2V0IHNsaWRlIGRpbWVuc2lvbnNcbiAgICBbXS5mb3JFYWNoLmNhbGwoXy5zbGlkZXMsIGZ1bmN0aW9uIChfXykge1xuICAgICAgX18uc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nXG4gICAgICBfXy5zdHlsZS53aWR0aCA9IF8uaXRlbVdpZHRoICsgJ3B4J1xuICAgICAgd2lkdGggKz0gXy5pdGVtV2lkdGhcbiAgICAgIGhlaWdodCA9IE1hdGgubWF4KF9fLm9mZnNldEhlaWdodCwgaGVpZ2h0KVxuICAgIH0pXG5cbiAgICBfLnRyYWNrLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gICAgXy50cmFja1dpZHRoID0gd2lkdGhcbiAgICBfLmlzRHJhZyA9IGZhbHNlXG4gICAgXy5wcmV2ZW50Q2xpY2sgPSBmYWxzZVxuXG4gICAgXy5vcHQucmVzaXplTG9jayAmJiBfLnNjcm9sbFRvKF8uc2xpZGUgKiBfLml0ZW1XaWR0aCwgMClcblxuICAgIGlmIChicmVha3BvaW50Q2hhbmdlZCB8fCBwYWdpbmcpIHtcbiAgICAgIF8uYmluZEFycm93cygpXG4gICAgICBfLmJ1aWxkRG90cygpXG4gICAgICBfLmJpbmREcmFnKClcbiAgICB9XG5cbiAgICBfLnVwZGF0ZUNvbnRyb2xzKClcblxuICAgIF8uZW1pdChyZWZyZXNoID8gJ3JlZnJlc2gnIDogJ2xvYWRlZCcpXG4gIH1cblxuICBnbGlkZXJQcm90b3R5cGUuYmluZERyYWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF8gPSB0aGlzXG4gICAgXy5tb3VzZSA9IF8ubW91c2UgfHwgXy5oYW5kbGVNb3VzZS5iaW5kKF8pXG5cbiAgICB2YXIgbW91c2V1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIF8ubW91c2VEb3duID0gdW5kZWZpbmVkXG4gICAgICBfLmVsZS5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnJylcbiAgICAgIGlmIChfLmlzRHJhZykge1xuICAgICAgICBfLnByZXZlbnRDbGljayA9IHRydWVcbiAgICAgIH1cbiAgICAgIF8uaXNEcmFnID0gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRzID0ge1xuICAgICAgbW91c2V1cDogbW91c2V1cCxcbiAgICAgIG1vdXNlbGVhdmU6IG1vdXNldXAsXG4gICAgICBtb3VzZWRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIF8ubW91c2VEb3duID0gZS5jbGllbnRYXG4gICAgICAgIF8uZWxlLmNsYXNzTGlzdC5hZGQoJ2RyYWcnKVxuICAgICAgfSxcbiAgICAgIG1vdXNlbW92ZTogXy5tb3VzZSxcbiAgICAgIGNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoXy5wcmV2ZW50Q2xpY2spIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICAgICAgXy5wcmV2ZW50Q2xpY2sgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIF8uZWxlLmNsYXNzTGlzdC50b2dnbGUoJ2RyYWdnYWJsZScsIF8ub3B0LmRyYWdnYWJsZSA9PT0gdHJ1ZSlcbiAgICBfLmV2ZW50KF8uZWxlLCAncmVtb3ZlJywgZXZlbnRzKVxuICAgIGlmIChfLm9wdC5kcmFnZ2FibGUpIF8uZXZlbnQoXy5lbGUsICdhZGQnLCBldmVudHMpXG4gIH1cblxuICBnbGlkZXJQcm90b3R5cGUuYnVpbGREb3RzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBfID0gdGhpc1xuXG4gICAgaWYgKCFfLm9wdC5kb3RzKSB7XG4gICAgICBpZiAoXy5kb3RzKSBfLmRvdHMuaW5uZXJIVE1MID0gJydcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgXy5vcHQuZG90cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIF8uZG90cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXy5vcHQuZG90cylcbiAgICB9IGVsc2UgXy5kb3RzID0gXy5vcHQuZG90c1xuICAgIGlmICghXy5kb3RzKSByZXR1cm5cblxuICAgIF8uZG90cy5pbm5lckhUTUwgPSAnJ1xuICAgIF8uZG90cy5jbGFzc0xpc3QuYWRkKCdnbGlkZXItZG90cycpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGguY2VpbChfLnNsaWRlcy5sZW5ndGggLyBfLm9wdC5zbGlkZXNUb1Nob3cpOyArK2kpIHtcbiAgICAgIHZhciBkb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICAgICAgZG90LmRhdGFzZXQuaW5kZXggPSBpXG4gICAgICBkb3Quc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ1BhZ2UgJyArIChpICsgMSkpXG4gICAgICBkb3QuY2xhc3NOYW1lID0gJ2dsaWRlci1kb3QgJyArIChpID8gJycgOiAnYWN0aXZlJylcbiAgICAgIF8uZXZlbnQoZG90LCAnYWRkJywge1xuICAgICAgICBjbGljazogXy5zY3JvbGxJdGVtLmJpbmQoXywgaSwgdHJ1ZSlcbiAgICAgIH0pXG4gICAgICBfLmRvdHMuYXBwZW5kQ2hpbGQoZG90KVxuICAgIH1cbiAgfVxuXG4gIGdsaWRlclByb3RvdHlwZS5iaW5kQXJyb3dzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBfID0gdGhpc1xuICAgIGlmICghXy5vcHQuYXJyb3dzKSB7XG4gICAgICBPYmplY3Qua2V5cyhfLmFycm93cykuZm9yRWFjaChmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gXy5hcnJvd3NbZGlyZWN0aW9uXVxuICAgICAgICBfLmV2ZW50KGVsZW1lbnQsICdyZW1vdmUnLCB7IGNsaWNrOiBlbGVtZW50Ll9mdW5jIH0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIFsncHJldicsICduZXh0J10uZm9yRWFjaChmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgICB2YXIgYXJyb3cgPSBfLm9wdC5hcnJvd3NbZGlyZWN0aW9uXVxuICAgICAgaWYgKGFycm93KSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJyb3cgPT09ICdzdHJpbmcnKSBhcnJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYXJyb3cpXG4gICAgICAgIGFycm93Ll9mdW5jID0gYXJyb3cuX2Z1bmMgfHwgXy5zY3JvbGxJdGVtLmJpbmQoXywgZGlyZWN0aW9uKVxuICAgICAgICBfLmV2ZW50KGFycm93LCAncmVtb3ZlJywge1xuICAgICAgICAgIGNsaWNrOiBhcnJvdy5fZnVuY1xuICAgICAgICB9KVxuICAgICAgICBfLmV2ZW50KGFycm93LCAnYWRkJywge1xuICAgICAgICAgIGNsaWNrOiBhcnJvdy5fZnVuY1xuICAgICAgICB9KVxuICAgICAgICBfLmFycm93c1tkaXJlY3Rpb25dID0gYXJyb3dcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZ2xpZGVyUHJvdG90eXBlLnVwZGF0ZUNvbnRyb2xzID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIF8gPSB0aGlzXG5cbiAgICBpZiAoZXZlbnQgJiYgIV8ub3B0LnNjcm9sbFByb3BhZ2F0ZSkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB9XG5cbiAgICB2YXIgZGlzYWJsZUFycm93cyA9IF8uY29udGFpbmVyV2lkdGggPj0gXy50cmFja1dpZHRoXG5cbiAgICBpZiAoIV8ub3B0LnJld2luZCkge1xuICAgICAgaWYgKF8uYXJyb3dzLnByZXYpIHtcbiAgICAgICAgXy5hcnJvd3MucHJldi5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICdkaXNhYmxlZCcsXG4gICAgICAgICAgXy5lbGUuc2Nyb2xsTGVmdCA8PSAwIHx8IGRpc2FibGVBcnJvd3NcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKF8uYXJyb3dzLm5leHQpIHtcbiAgICAgICAgXy5hcnJvd3MubmV4dC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICdkaXNhYmxlZCcsXG4gICAgICAgICAgTWF0aC5jZWlsKF8uZWxlLnNjcm9sbExlZnQgKyBfLmNvbnRhaW5lcldpZHRoKSA+PVxuICAgICAgICAgICAgTWF0aC5mbG9vcihfLnRyYWNrV2lkdGgpIHx8IGRpc2FibGVBcnJvd3NcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIF8uc2xpZGUgPSBNYXRoLnJvdW5kKF8uZWxlLnNjcm9sbExlZnQgLyBfLml0ZW1XaWR0aClcbiAgICBfLnBhZ2UgPSBNYXRoLnJvdW5kKF8uZWxlLnNjcm9sbExlZnQgLyBfLmNvbnRhaW5lcldpZHRoKVxuXG4gICAgdmFyIG1pZGRsZSA9IF8uc2xpZGUgKyBNYXRoLmZsb29yKE1hdGguZmxvb3IoXy5vcHQuc2xpZGVzVG9TaG93KSAvIDIpXG5cbiAgICB2YXIgZXh0cmFNaWRkbGUgPSBNYXRoLmZsb29yKF8ub3B0LnNsaWRlc1RvU2hvdykgJSAyID8gMCA6IG1pZGRsZSArIDFcbiAgICBpZiAoTWF0aC5mbG9vcihfLm9wdC5zbGlkZXNUb1Nob3cpID09PSAxKSB7XG4gICAgICBleHRyYU1pZGRsZSA9IDBcbiAgICB9XG5cbiAgICAvLyB0aGUgbGFzdCBwYWdlIG1heSBiZSBsZXNzIHRoYW4gb25lIGhhbGYgb2YgYSBub3JtYWwgcGFnZSB3aWR0aCBzb1xuICAgIC8vIHRoZSBwYWdlIGlzIHJvdW5kZWQgZG93bi4gd2hlbiBhdCB0aGUgZW5kLCBmb3JjZSB0aGUgcGFnZSB0byB0dXJuXG4gICAgaWYgKF8uZWxlLnNjcm9sbExlZnQgKyBfLmNvbnRhaW5lcldpZHRoID49IE1hdGguZmxvb3IoXy50cmFja1dpZHRoKSkge1xuICAgICAgXy5wYWdlID0gXy5kb3RzID8gXy5kb3RzLmNoaWxkcmVuLmxlbmd0aCAtIDEgOiAwXG4gICAgfVxuXG4gICAgW10uZm9yRWFjaC5jYWxsKF8uc2xpZGVzLCBmdW5jdGlvbiAoc2xpZGUsIGluZGV4KSB7XG4gICAgICB2YXIgc2xpZGVDbGFzc2VzID0gc2xpZGUuY2xhc3NMaXN0XG5cbiAgICAgIHZhciB3YXNWaXNpYmxlID0gc2xpZGVDbGFzc2VzLmNvbnRhaW5zKCd2aXNpYmxlJylcblxuICAgICAgdmFyIHN0YXJ0ID0gXy5lbGUuc2Nyb2xsTGVmdFxuXG4gICAgICB2YXIgZW5kID0gXy5lbGUuc2Nyb2xsTGVmdCArIF8uY29udGFpbmVyV2lkdGhcblxuICAgICAgdmFyIGl0ZW1TdGFydCA9IF8uaXRlbVdpZHRoICogaW5kZXhcblxuICAgICAgdmFyIGl0ZW1FbmQgPSBpdGVtU3RhcnQgKyBfLml0ZW1XaWR0aDtcblxuICAgICAgW10uZm9yRWFjaC5jYWxsKHNsaWRlQ2xhc3NlcywgZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgICAgICAvXmxlZnR8cmlnaHQvLnRlc3QoY2xhc3NOYW1lKSAmJiBzbGlkZUNsYXNzZXMucmVtb3ZlKGNsYXNzTmFtZSlcbiAgICAgIH0pXG4gICAgICBzbGlkZUNsYXNzZXMudG9nZ2xlKCdhY3RpdmUnLCBfLnNsaWRlID09PSBpbmRleClcbiAgICAgIGlmIChtaWRkbGUgPT09IGluZGV4IHx8IChleHRyYU1pZGRsZSAmJiBleHRyYU1pZGRsZSA9PT0gaW5kZXgpKSB7XG4gICAgICAgIHNsaWRlQ2xhc3Nlcy5hZGQoJ2NlbnRlcicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzbGlkZUNsYXNzZXMucmVtb3ZlKCdjZW50ZXInKVxuICAgICAgICBzbGlkZUNsYXNzZXMuYWRkKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIGluZGV4IDwgbWlkZGxlID8gJ2xlZnQnIDogJ3JpZ2h0JyxcbiAgICAgICAgICAgIE1hdGguYWJzKGluZGV4IC0gKGluZGV4IDwgbWlkZGxlID8gbWlkZGxlIDogZXh0cmFNaWRkbGUgfHwgbWlkZGxlKSlcbiAgICAgICAgICBdLmpvaW4oJy0nKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHZhciBpc1Zpc2libGUgPVxuICAgICAgICBNYXRoLmNlaWwoaXRlbVN0YXJ0KSA+PSBzdGFydCAmJiBNYXRoLmZsb29yKGl0ZW1FbmQpIDw9IGVuZFxuICAgICAgc2xpZGVDbGFzc2VzLnRvZ2dsZSgndmlzaWJsZScsIGlzVmlzaWJsZSlcbiAgICAgIGlmIChpc1Zpc2libGUgIT09IHdhc1Zpc2libGUpIHtcbiAgICAgICAgXy5lbWl0KCdzbGlkZS0nICsgKGlzVmlzaWJsZSA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKSwge1xuICAgICAgICAgIHNsaWRlOiBpbmRleFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKF8uZG90cykge1xuICAgICAgW10uZm9yRWFjaC5jYWxsKF8uZG90cy5jaGlsZHJlbiwgZnVuY3Rpb24gKGRvdCwgaW5kZXgpIHtcbiAgICAgICAgZG90LmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIF8ucGFnZSA9PT0gaW5kZXgpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChldmVudCAmJiBfLm9wdC5zY3JvbGxMb2NrKSB7XG4gICAgICBjbGVhclRpbWVvdXQoXy5zY3JvbGxMb2NrKVxuICAgICAgXy5zY3JvbGxMb2NrID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChfLnNjcm9sbExvY2spXG4gICAgICAgIC8vIGRvbnQgYXR0ZW1wdCB0byBzY3JvbGwgbGVzcyB0aGFuIGEgcGl4ZWwgZnJhY3Rpb24gLSBjYXVzZXMgbG9vcGluZ1xuICAgICAgICBpZiAoTWF0aC5hYnMoXy5lbGUuc2Nyb2xsTGVmdCAvIF8uaXRlbVdpZHRoIC0gXy5zbGlkZSkgPiAwLjAyKSB7XG4gICAgICAgICAgaWYgKCFfLm1vdXNlRG93bikge1xuICAgICAgICAgICAgXy5zY3JvbGxJdGVtKF8ucm91bmQoXy5lbGUuc2Nyb2xsTGVmdCAvIF8uaXRlbVdpZHRoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIF8ub3B0LnNjcm9sbExvY2tEZWxheSB8fCAyNTApXG4gICAgfVxuICB9XG5cbiAgZ2xpZGVyUHJvdG90eXBlLnNjcm9sbEl0ZW0gPSBmdW5jdGlvbiAoc2xpZGUsIGRvdCwgZSkge1xuICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIHZhciBfID0gdGhpc1xuXG4gICAgdmFyIG9yaWdpbmFsU2xpZGUgPSBzbGlkZVxuICAgICsrXy5hbmltYXRlX2lkXG5cbiAgICBpZiAoZG90ID09PSB0cnVlKSB7XG4gICAgICBzbGlkZSA9IHNsaWRlICogXy5jb250YWluZXJXaWR0aFxuICAgICAgc2xpZGUgPSBNYXRoLnJvdW5kKHNsaWRlIC8gXy5pdGVtV2lkdGgpICogXy5pdGVtV2lkdGhcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBzbGlkZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFyIGJhY2t3YXJkcyA9IHNsaWRlID09PSAncHJldidcblxuICAgICAgICAvLyB1c2UgcHJlY2lzZSBsb2NhdGlvbiBpZiBmcmFjdGlvbmFsIHNsaWRlcyBhcmUgb25cbiAgICAgICAgaWYgKF8ub3B0LnNsaWRlc1RvU2Nyb2xsICUgMSB8fCBfLm9wdC5zbGlkZXNUb1Nob3cgJSAxKSB7XG4gICAgICAgICAgc2xpZGUgPSBfLnJvdW5kKF8uZWxlLnNjcm9sbExlZnQgLyBfLml0ZW1XaWR0aClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzbGlkZSA9IF8uc2xpZGVcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYWNrd2FyZHMpIHNsaWRlIC09IF8ub3B0LnNsaWRlc1RvU2Nyb2xsXG4gICAgICAgIGVsc2Ugc2xpZGUgKz0gXy5vcHQuc2xpZGVzVG9TY3JvbGxcblxuICAgICAgICBpZiAoXy5vcHQucmV3aW5kKSB7XG4gICAgICAgICAgdmFyIHNjcm9sbExlZnQgPSBfLmVsZS5zY3JvbGxMZWZ0XG4gICAgICAgICAgc2xpZGUgPVxuICAgICAgICAgICAgYmFja3dhcmRzICYmICFzY3JvbGxMZWZ0XG4gICAgICAgICAgICAgID8gXy5zbGlkZXMubGVuZ3RoXG4gICAgICAgICAgICAgIDogIWJhY2t3YXJkcyAmJlxuICAgICAgICAgICAgICAgIHNjcm9sbExlZnQgKyBfLmNvbnRhaW5lcldpZHRoID49IE1hdGguZmxvb3IoXy50cmFja1dpZHRoKVxuICAgICAgICAgICAgICAgID8gMFxuICAgICAgICAgICAgICAgIDogc2xpZGVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzbGlkZSA9IE1hdGgubWF4KE1hdGgubWluKHNsaWRlLCBfLnNsaWRlcy5sZW5ndGgpLCAwKVxuXG4gICAgICBfLnNsaWRlID0gc2xpZGVcbiAgICAgIHNsaWRlID0gXy5pdGVtV2lkdGggKiBzbGlkZVxuICAgIH1cblxuICAgIF8uc2Nyb2xsVG8oXG4gICAgICBzbGlkZSxcbiAgICAgIF8ub3B0LmR1cmF0aW9uICogTWF0aC5hYnMoXy5lbGUuc2Nyb2xsTGVmdCAtIHNsaWRlKSxcbiAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXy51cGRhdGVDb250cm9scygpXG4gICAgICAgIF8uZW1pdCgnYW5pbWF0ZWQnLCB7XG4gICAgICAgICAgdmFsdWU6IG9yaWdpbmFsU2xpZGUsXG4gICAgICAgICAgdHlwZTpcbiAgICAgICAgICAgIHR5cGVvZiBvcmlnaW5hbFNsaWRlID09PSAnc3RyaW5nJyA/ICdhcnJvdycgOiBkb3QgPyAnZG90JyA6ICdzbGlkZSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICApXG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGdsaWRlclByb3RvdHlwZS5zZXR0aW5nc0JyZWFrcG9pbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF8gPSB0aGlzXG5cbiAgICB2YXIgcmVzcCA9IF8uX29wdC5yZXNwb25zaXZlXG5cbiAgICBpZiAocmVzcCkge1xuICAgICAgLy8gU29ydCB0aGUgYnJlYWtwb2ludHMgaW4gbW9iaWxlIGZpcnN0IG9yZGVyXG4gICAgICByZXNwLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGIuYnJlYWtwb2ludCAtIGEuYnJlYWtwb2ludFxuICAgICAgfSlcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNwLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzaXplID0gcmVzcFtpXVxuICAgICAgICBpZiAoX3dpbmRvdy5pbm5lcldpZHRoID49IHNpemUuYnJlYWtwb2ludCkge1xuICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnQgIT09IHNpemUuYnJlYWtwb2ludCkge1xuICAgICAgICAgICAgXy5vcHQgPSBPYmplY3QuYXNzaWduKHt9LCBfLl9vcHQsIHNpemUuc2V0dGluZ3MpXG4gICAgICAgICAgICBfLmJyZWFrcG9pbnQgPSBzaXplLmJyZWFrcG9pbnRcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIHNldCBiYWNrIHRvIGRlZmF1bHRzIGluIGNhc2UgdGhleSB3ZXJlIG92ZXJyaWRlblxuICAgIHZhciBicmVha3BvaW50Q2hhbmdlZCA9IF8uYnJlYWtwb2ludCAhPT0gMFxuICAgIF8ub3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgXy5fb3B0KVxuICAgIF8uYnJlYWtwb2ludCA9IDBcbiAgICByZXR1cm4gYnJlYWtwb2ludENoYW5nZWRcbiAgfVxuXG4gIGdsaWRlclByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uIChzY3JvbGxUYXJnZXQsIHNjcm9sbER1cmF0aW9uLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpc1xuXG4gICAgdmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblxuICAgIHZhciBhbmltYXRlSW5kZXggPSBfLmFuaW1hdGVfaWRcblxuICAgIHZhciBhbmltYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRcbiAgICAgIF8uZWxlLnNjcm9sbExlZnQgPVxuICAgICAgICBfLmVsZS5zY3JvbGxMZWZ0ICtcbiAgICAgICAgKHNjcm9sbFRhcmdldCAtIF8uZWxlLnNjcm9sbExlZnQpICpcbiAgICAgICAgICBfLm9wdC5lYXNpbmcoMCwgbm93LCAwLCAxLCBzY3JvbGxEdXJhdGlvbilcbiAgICAgIGlmIChub3cgPCBzY3JvbGxEdXJhdGlvbiAmJiBhbmltYXRlSW5kZXggPT09IF8uYW5pbWF0ZV9pZCkge1xuICAgICAgICBfd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgXy5lbGUuc2Nyb2xsTGVmdCA9IHNjcm9sbFRhcmdldFxuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKF8pXG4gICAgICB9XG4gICAgfVxuXG4gICAgX3dpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcbiAgfVxuXG4gIGdsaWRlclByb3RvdHlwZS5yZW1vdmVJdGVtID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgdmFyIF8gPSB0aGlzXG5cbiAgICBpZiAoXy5zbGlkZXMubGVuZ3RoKSB7XG4gICAgICBfLnRyYWNrLnJlbW92ZUNoaWxkKF8uc2xpZGVzW2luZGV4XSlcbiAgICAgIF8ucmVmcmVzaCh0cnVlKVxuICAgICAgXy5lbWl0KCdyZW1vdmUnKVxuICAgIH1cbiAgfVxuXG4gIGdsaWRlclByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24gKGVsZSkge1xuICAgIHZhciBfID0gdGhpc1xuXG4gICAgXy50cmFjay5hcHBlbmRDaGlsZChlbGUpXG4gICAgXy5yZWZyZXNoKHRydWUpXG4gICAgXy5lbWl0KCdhZGQnKVxuICB9XG5cbiAgZ2xpZGVyUHJvdG90eXBlLmhhbmRsZU1vdXNlID0gZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgXyA9IHRoaXNcbiAgICBpZiAoXy5tb3VzZURvd24pIHtcbiAgICAgIF8uaXNEcmFnID0gdHJ1ZVxuICAgICAgXy5lbGUuc2Nyb2xsTGVmdCArPVxuICAgICAgICAoXy5tb3VzZURvd24gLSBlLmNsaWVudFgpICogKF8ub3B0LmRyYWdWZWxvY2l0eSB8fCAzLjMpXG4gICAgICBfLm1vdXNlRG93biA9IGUuY2xpZW50WFxuICAgIH1cbiAgfVxuXG4gIC8vIHVzZWQgdG8gcm91bmQgdG8gdGhlIG5lYXJlc3QgMC5YWCBmcmFjdGlvblxuICBnbGlkZXJQcm90b3R5cGUucm91bmQgPSBmdW5jdGlvbiAoZG91YmxlKSB7XG4gICAgdmFyIF8gPSB0aGlzXG4gICAgdmFyIHN0ZXAgPSBfLm9wdC5zbGlkZXNUb1Njcm9sbCAlIDEgfHwgMVxuICAgIHZhciBpbnYgPSAxLjAgLyBzdGVwXG4gICAgcmV0dXJuIE1hdGgucm91bmQoZG91YmxlICogaW52KSAvIGludlxuICB9XG5cbiAgZ2xpZGVyUHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAocGFnaW5nKSB7XG4gICAgdmFyIF8gPSB0aGlzXG4gICAgXy5pbml0KHRydWUsIHBhZ2luZylcbiAgfVxuXG4gIGdsaWRlclByb3RvdHlwZS5zZXRPcHRpb24gPSBmdW5jdGlvbiAob3B0LCBnbG9iYWwpIHtcbiAgICB2YXIgXyA9IHRoaXNcblxuICAgIGlmIChfLmJyZWFrcG9pbnQgJiYgIWdsb2JhbCkge1xuICAgICAgXy5fb3B0LnJlc3BvbnNpdmUuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICBpZiAodi5icmVha3BvaW50ID09PSBfLmJyZWFrcG9pbnQpIHtcbiAgICAgICAgICB2LnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdi5zZXR0aW5ncywgb3B0KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBfLl9vcHQgPSBPYmplY3QuYXNzaWduKHt9LCBfLl9vcHQsIG9wdClcbiAgICB9XG5cbiAgICBfLmJyZWFrcG9pbnQgPSAwXG4gICAgXy5zZXR0aW5nc0JyZWFrcG9pbnQoKVxuICB9XG5cbiAgZ2xpZGVyUHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF8gPSB0aGlzXG5cbiAgICB2YXIgcmVwbGFjZSA9IF8uZWxlLmNsb25lTm9kZSh0cnVlKVxuXG4gICAgdmFyIGNsZWFyID0gZnVuY3Rpb24gKGVsZSkge1xuICAgICAgZWxlLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICAgIFtdLmZvckVhY2guY2FsbChlbGUuY2xhc3NMaXN0LCBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICAgIC9eZ2xpZGVyLy50ZXN0KGNsYXNzTmFtZSkgJiYgZWxlLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gcmVtb3ZlIHRyYWNrXG4gICAgcmVwbGFjZS5jaGlsZHJlblswXS5vdXRlckhUTUwgPSByZXBsYWNlLmNoaWxkcmVuWzBdLmlubmVySFRNTFxuICAgIGNsZWFyKHJlcGxhY2UpO1xuICAgIFtdLmZvckVhY2guY2FsbChyZXBsYWNlLmdldEVsZW1lbnRzQnlUYWdOYW1lKCcqJyksIGNsZWFyKVxuICAgIF8uZWxlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHJlcGxhY2UsIF8uZWxlKVxuICAgIF8uZXZlbnQoX3dpbmRvdywgJ3JlbW92ZScsIHtcbiAgICAgIHJlc2l6ZTogXy5yZXNpemVcbiAgICB9KVxuICAgIF8uZW1pdCgnZGVzdHJveScpXG4gIH1cblxuICBnbGlkZXJQcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmcpIHtcbiAgICB2YXIgXyA9IHRoaXNcblxuICAgIHZhciBlID0gbmV3IF93aW5kb3cuQ3VzdG9tRXZlbnQoJ2dsaWRlci0nICsgbmFtZSwge1xuICAgICAgYnViYmxlczogIV8ub3B0LmV2ZW50UHJvcGFnYXRlLFxuICAgICAgZGV0YWlsOiBhcmdcbiAgICB9KVxuICAgIF8uZWxlLmRpc3BhdGNoRXZlbnQoZSlcbiAgfVxuXG4gIGdsaWRlclByb3RvdHlwZS5ldmVudCA9IGZ1bmN0aW9uIChlbGUsIHR5cGUsIGFyZ3MpIHtcbiAgICB2YXIgZXZlbnRIYW5kbGVyID0gZWxlW3R5cGUgKyAnRXZlbnRMaXN0ZW5lciddLmJpbmQoZWxlKVxuICAgIE9iamVjdC5rZXlzKGFyZ3MpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgIGV2ZW50SGFuZGxlcihrLCBhcmdzW2tdKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gR2xpZGVyXG59KVxuIiwiaW1wb3J0IEdsaWRlciBmcm9tICdnbGlkZXItanMnO1xuLy8gY29kZSBmb3IgdGVzdGltb25pYWxzXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIHNldHVwVGVzdGltb25pYWxTbGlkZXIoKSB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2xpZGVyJykpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3XG4gICAgbmV3IEdsaWRlcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2xpZGVyJyksIHtcbiAgICAgIC8vIE1vYmlsZS1maXJzdCBkZWZhdWx0c1xuICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICBzY3JvbGxMb2NrOiB0cnVlLFxuICAgICAgZG90czogJyNyZXNwLWRvdHMnLFxuICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgYXJyb3dzOiB7XG4gICAgICAgIHByZXY6ICcuZ2xpZGVyLXByZXYnLFxuICAgICAgICBuZXh0OiAnLmdsaWRlci1uZXh0JyxcbiAgICAgIH0sXG4gICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAvLyBzY3JlZW5zIGdyZWF0ZXIgdGhhbiA+PSA3NzVweFxuICAgICAgICAgIGJyZWFrcG9pbnQ6IDAsXG4gICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgIC8vIFNldCB0byBgYXV0b2AgYW5kIHByb3ZpZGUgaXRlbSB3aWR0aCB0byBhZGp1c3QgdG8gdmlld3BvcnRcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgaXRlbVdpZHRoOiAzMDAsXG4gICAgICAgICAgICBkdXJhdGlvbjogMSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgLy8gc2NyZWVucyBncmVhdGVyIHRoYW4gPj0gMTAyNHB4XG4gICAgICAgICAgYnJlYWtwb2ludDogNTQwLFxuICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6ICdhdXRvJyxcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAnYXV0bycsXG4gICAgICAgICAgICBpdGVtV2lkdGg6IDMwMCxcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG59KTtcbiIsImltcG9ydCB7IHRvZ2dsZUNsYXNzLCByZW1vdmVDbGFzcyB9IGZyb20gJy4uL2hlbHBlcic7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gIGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudDtcbiAgaWYgKHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tbWVudScpKSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgLy8gY2xhc3M9XCJuYXZiYXItdG9nZ2xlclwiIGRhdGEtdHJpZ2dlcj1cIiNuYXZiYXJfbWFpblwiXG4gIGlmICh0YXJnZXQuY2xvc2VzdCgnLm5hdmJhci10b2dnbGVyW2RhdGEtdHJpZ2dlcl0nKSkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgY29uc3Qgb2ZmY2FudmFzSWQgPSB0YXJnZXRcbiAgICAgIC5jbG9zZXN0KCcubmF2YmFyLXRvZ2dsZXJbZGF0YS10cmlnZ2VyXScpXG4gICAgICAuZ2V0QXR0cmlidXRlKCdkYXRhLXRyaWdnZXInKTtcbiAgICBjb25zdCBvZmZjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9mZmNhbnZhc0lkKTtcbiAgICBpZiAob2ZmY2FudmFzKSB7XG4gICAgICB0b2dnbGVDbGFzcyhvZmZjYW52YXMsICdzaG93Jyk7XG4gICAgfVxuICAgIHRvZ2dsZUNsYXNzKGRvY3VtZW50LmJvZHksICdvZmZjYW52YXMtYWN0aXZlJyk7XG4gICAgY29uc3Qgc2NyZWVuT3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JlZW4tb3ZlcmxheScpO1xuICAgIGlmIChzY3JlZW5PdmVybGF5KSB7XG4gICAgICB0b2dnbGVDbGFzcyhzY3JlZW5PdmVybGF5LCAnc2hvdycpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0YXJnZXQuY2xvc2VzdCgnLmJ0bi1jbG9zZSwgLnNjcmVlbi1vdmVybGF5JykpIHtcbiAgICBjb25zdCBzY3JlZW5PdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjcmVlbi1vdmVybGF5Jyk7XG4gICAgaWYgKHNjcmVlbk92ZXJsYXkpIHtcbiAgICAgIHJlbW92ZUNsYXNzKHNjcmVlbk92ZXJsYXksICdzaG93Jyk7XG4gICAgfVxuICAgIGNvbnN0IG1vYmlsZU9mZmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtb2ZmY2FudmFzJyk7XG4gICAgaWYgKG1vYmlsZU9mZmNhbnZhcykge1xuICAgICAgcmVtb3ZlQ2xhc3MobW9iaWxlT2ZmY2FudmFzLCAnc2hvdycpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAnb2ZmY2FudmFzLWFjdGl2ZScpO1xuICB9XG59KTtcbiIsIiFmdW5jdGlvbih0LG4pe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPW4oKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKG4pOnQuTWFjeT1uKCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQsbil7dmFyIGU9dm9pZCAwO3JldHVybiBmdW5jdGlvbigpe2UmJmNsZWFyVGltZW91dChlKSxlPXNldFRpbWVvdXQodCxuKX19ZnVuY3Rpb24gbih0LG4pe2Zvcih2YXIgZT10Lmxlbmd0aCxyPWUsbz1bXTtlLS07KW8ucHVzaChuKHRbci1lLTFdKSk7cmV0dXJuIG99ZnVuY3Rpb24gZSh0LG4pe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdJiZhcmd1bWVudHNbMl07aWYod2luZG93LlByb21pc2UpcmV0dXJuIEEodCxuLGUpO3QucmVjYWxjdWxhdGUoITAsITApfWZ1bmN0aW9uIHIodCl7Zm9yKHZhciBuPXQub3B0aW9ucyxlPXQucmVzcG9uc2l2ZU9wdGlvbnMscj10LmtleXMsbz10LmRvY1dpZHRoLGk9dm9pZCAwLHM9MDtzPHIubGVuZ3RoO3MrKyl7dmFyIGE9cGFyc2VJbnQocltzXSwxMCk7bz49YSYmKGk9bi5icmVha0F0W2FdLE8oaSxlKSl9cmV0dXJuIGV9ZnVuY3Rpb24gbyh0KXtmb3IodmFyIG49dC5vcHRpb25zLGU9dC5yZXNwb25zaXZlT3B0aW9ucyxyPXQua2V5cyxvPXQuZG9jV2lkdGgsaT12b2lkIDAscz1yLmxlbmd0aC0xO3M+PTA7cy0tKXt2YXIgYT1wYXJzZUludChyW3NdLDEwKTtvPD1hJiYoaT1uLmJyZWFrQXRbYV0sTyhpLGUpKX1yZXR1cm4gZX1mdW5jdGlvbiBpKHQpe3ZhciBuPXQudXNlQ29udGFpbmVyRm9yQnJlYWtwb2ludHM/dC5jb250YWluZXIuY2xpZW50V2lkdGg6d2luZG93LmlubmVyV2lkdGgsZT17Y29sdW1uczp0LmNvbHVtbnN9O2IodC5tYXJnaW4pP2UubWFyZ2luPXt4OnQubWFyZ2luLngseTp0Lm1hcmdpbi55fTplLm1hcmdpbj17eDp0Lm1hcmdpbix5OnQubWFyZ2lufTt2YXIgaT1PYmplY3Qua2V5cyh0LmJyZWFrQXQpO3JldHVybiB0Lm1vYmlsZUZpcnN0P3Ioe29wdGlvbnM6dCxyZXNwb25zaXZlT3B0aW9uczplLGtleXM6aSxkb2NXaWR0aDpufSk6byh7b3B0aW9uczp0LHJlc3BvbnNpdmVPcHRpb25zOmUsa2V5czppLGRvY1dpZHRoOm59KX1mdW5jdGlvbiBzKHQpe3JldHVybiBpKHQpLmNvbHVtbnN9ZnVuY3Rpb24gYSh0KXtyZXR1cm4gaSh0KS5tYXJnaW59ZnVuY3Rpb24gYyh0KXt2YXIgbj0hKGFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdKXx8YXJndW1lbnRzWzFdLGU9cyh0KSxyPWEodCkueCxvPTEwMC9lO2lmKCFuKXJldHVybiBvO2lmKDE9PT1lKXJldHVyblwiMTAwJVwiO3ZhciBpPVwicHhcIjtpZihcInN0cmluZ1wiPT10eXBlb2Ygcil7dmFyIGM9cGFyc2VGbG9hdChyKTtpPXIucmVwbGFjZShjLFwiXCIpLHI9Y31yZXR1cm4gcj0oZS0xKSpyL2UsXCIlXCI9PT1pP28tcitcIiVcIjpcImNhbGMoXCIrbytcIiUgLSBcIityK2krXCIpXCJ9ZnVuY3Rpb24gdSh0LG4pe3ZhciBlPXModC5vcHRpb25zKSxyPTAsbz12b2lkIDAsaT12b2lkIDA7aWYoMT09PSsrbilyZXR1cm4gMDtpPWEodC5vcHRpb25zKS54O3ZhciB1PVwicHhcIjtpZihcInN0cmluZ1wiPT10eXBlb2YgaSl7dmFyIGw9cGFyc2VGbG9hdChpLDEwKTt1PWkucmVwbGFjZShsLFwiXCIpLGk9bH1yZXR1cm4gbz0oaS0oZS0xKSppL2UpKihuLTEpLHIrPWModC5vcHRpb25zLCExKSoobi0xKSxcIiVcIj09PXU/citvK1wiJVwiOlwiY2FsYyhcIityK1wiJSArIFwiK28rdStcIilcIn1mdW5jdGlvbiBsKHQpe3ZhciBuPTAsZT10LmNvbnRhaW5lcixyPXQucm93czt2KHIsZnVuY3Rpb24odCl7bj10Pm4/dDpufSksZS5zdHlsZS5oZWlnaHQ9bitcInB4XCJ9ZnVuY3Rpb24gcCh0LG4pe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdJiZhcmd1bWVudHNbMl0scj0hKGFyZ3VtZW50cy5sZW5ndGg+MyYmdm9pZCAwIT09YXJndW1lbnRzWzNdKXx8YXJndW1lbnRzWzNdLG89cyh0Lm9wdGlvbnMpLGk9YSh0Lm9wdGlvbnMpLnk7TSh0LG8sZSksdihuLGZ1bmN0aW9uKG4pe3ZhciBlPTAsbz1wYXJzZUludChuLm9mZnNldEhlaWdodCwxMCk7aXNOYU4obyl8fCh0LnJvd3MuZm9yRWFjaChmdW5jdGlvbihuLHIpe248dC5yb3dzW2VdJiYoZT1yKX0pLG4uc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiLG4uc3R5bGUudG9wPXQucm93c1tlXStcInB4XCIsbi5zdHlsZS5sZWZ0PVwiXCIrdC5jb2xzW2VdLHQucm93c1tlXSs9aXNOYU4obyk/MDpvK2ksciYmKG4uZGF0YXNldC5tYWN5Q29tcGxldGU9MSkpfSksciYmKHQudG1wUm93cz1udWxsKSxsKHQpfWZ1bmN0aW9uIGYodCxuKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSYmYXJndW1lbnRzWzJdLHI9IShhcmd1bWVudHMubGVuZ3RoPjMmJnZvaWQgMCE9PWFyZ3VtZW50c1szXSl8fGFyZ3VtZW50c1szXSxvPXModC5vcHRpb25zKSxpPWEodC5vcHRpb25zKS55O00odCxvLGUpLHYobixmdW5jdGlvbihuKXt0Lmxhc3Rjb2w9PT1vJiYodC5sYXN0Y29sPTApO3ZhciBlPUMobixcImhlaWdodFwiKTtlPXBhcnNlSW50KG4ub2Zmc2V0SGVpZ2h0LDEwKSxpc05hTihlKXx8KG4uc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiLG4uc3R5bGUudG9wPXQucm93c1t0Lmxhc3Rjb2xdK1wicHhcIixuLnN0eWxlLmxlZnQ9XCJcIit0LmNvbHNbdC5sYXN0Y29sXSx0LnJvd3NbdC5sYXN0Y29sXSs9aXNOYU4oZSk/MDplK2ksdC5sYXN0Y29sKz0xLHImJihuLmRhdGFzZXQubWFjeUNvbXBsZXRlPTEpKX0pLHImJih0LnRtcFJvd3M9bnVsbCksbCh0KX12YXIgaD1mdW5jdGlvbiB0KG4sZSl7aWYoISh0aGlzIGluc3RhbmNlb2YgdCkpcmV0dXJuIG5ldyB0KG4sZSk7aWYobiYmbi5ub2RlTmFtZSlyZXR1cm4gbjtpZihuPW4ucmVwbGFjZSgvXlxccyovLFwiXCIpLnJlcGxhY2UoL1xccyokLyxcIlwiKSxlKXJldHVybiB0aGlzLmJ5Q3NzKG4sZSk7Zm9yKHZhciByIGluIHRoaXMuc2VsZWN0b3JzKWlmKGU9ci5zcGxpdChcIi9cIiksbmV3IFJlZ0V4cChlWzFdLGVbMl0pLnRlc3QobikpcmV0dXJuIHRoaXMuc2VsZWN0b3JzW3JdKG4pO3JldHVybiB0aGlzLmJ5Q3NzKG4pfTtoLnByb3RvdHlwZS5ieUNzcz1mdW5jdGlvbih0LG4pe3JldHVybihufHxkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbCh0KX0saC5wcm90b3R5cGUuc2VsZWN0b3JzPXt9LGgucHJvdG90eXBlLnNlbGVjdG9yc1svXlxcLltcXHdcXC1dKyQvXT1mdW5jdGlvbih0KXtyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSh0LnN1YnN0cmluZygxKSl9LGgucHJvdG90eXBlLnNlbGVjdG9yc1svXlxcdyskL109ZnVuY3Rpb24odCl7cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHQpfSxoLnByb3RvdHlwZS5zZWxlY3RvcnNbL15cXCNbXFx3XFwtXSskL109ZnVuY3Rpb24odCl7cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHQuc3Vic3RyaW5nKDEpKX07dmFyIHY9ZnVuY3Rpb24odCxuKXtmb3IodmFyIGU9dC5sZW5ndGgscj1lO2UtLTspbih0W3ItZS0xXSl9LG09ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXSYmYXJndW1lbnRzWzBdO3RoaXMucnVubmluZz0hMSx0aGlzLmV2ZW50cz1bXSx0aGlzLmFkZCh0KX07bS5wcm90b3R5cGUucnVuPWZ1bmN0aW9uKCl7aWYoIXRoaXMucnVubmluZyYmdGhpcy5ldmVudHMubGVuZ3RoPjApe3ZhciB0PXRoaXMuZXZlbnRzLnNoaWZ0KCk7dGhpcy5ydW5uaW5nPSEwLHQoKSx0aGlzLnJ1bm5pbmc9ITEsdGhpcy5ydW4oKX19LG0ucHJvdG90eXBlLmFkZD1mdW5jdGlvbigpe3ZhciB0PXRoaXMsbj1hcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXSYmYXJndW1lbnRzWzBdO3JldHVybiEhbiYmKEFycmF5LmlzQXJyYXkobik/dihuLGZ1bmN0aW9uKG4pe3JldHVybiB0LmFkZChuKX0pOih0aGlzLmV2ZW50cy5wdXNoKG4pLHZvaWQgdGhpcy5ydW4oKSkpfSxtLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuZXZlbnRzPVtdfTt2YXIgZD1mdW5jdGlvbih0KXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06e307cmV0dXJuIHRoaXMuaW5zdGFuY2U9dCx0aGlzLmRhdGE9bix0aGlzfSx5PWZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXTt0aGlzLmV2ZW50cz17fSx0aGlzLmluc3RhbmNlPXR9O3kucHJvdG90eXBlLm9uPWZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXSxuPWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdJiZhcmd1bWVudHNbMV07cmV0dXJuISghdHx8IW4pJiYoQXJyYXkuaXNBcnJheSh0aGlzLmV2ZW50c1t0XSl8fCh0aGlzLmV2ZW50c1t0XT1bXSksdGhpcy5ldmVudHNbdF0ucHVzaChuKSl9LHkucHJvdG90eXBlLmVtaXQ9ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXSYmYXJndW1lbnRzWzBdLG49YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOnt9O2lmKCF0fHwhQXJyYXkuaXNBcnJheSh0aGlzLmV2ZW50c1t0XSkpcmV0dXJuITE7dmFyIGU9bmV3IGQodGhpcy5pbnN0YW5jZSxuKTt2KHRoaXMuZXZlbnRzW3RdLGZ1bmN0aW9uKHQpe3JldHVybiB0KGUpfSl9O3ZhciBnPWZ1bmN0aW9uKHQpe3JldHVybiEoXCJuYXR1cmFsSGVpZ2h0XCJpbiB0JiZ0Lm5hdHVyYWxIZWlnaHQrdC5uYXR1cmFsV2lkdGg9PT0wKXx8dC53aWR0aCt0LmhlaWdodCE9PTB9LEU9ZnVuY3Rpb24odCxuKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSYmYXJndW1lbnRzWzJdO3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbih0LGUpe2lmKG4uY29tcGxldGUpcmV0dXJuIGcobik/dChuKTplKG4pO24uYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIixmdW5jdGlvbigpe3JldHVybiBnKG4pP3Qobik6ZShuKX0pLG4uYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsZnVuY3Rpb24oKXtyZXR1cm4gZShuKX0pfSkudGhlbihmdW5jdGlvbihuKXtlJiZ0LmVtaXQodC5jb25zdGFudHMuRVZFTlRfSU1BR0VfTE9BRCx7aW1nOm59KX0pLmNhdGNoKGZ1bmN0aW9uKG4pe3JldHVybiB0LmVtaXQodC5jb25zdGFudHMuRVZFTlRfSU1BR0VfRVJST1Ise2ltZzpufSl9KX0sdz1mdW5jdGlvbih0LGUpe3ZhciByPWFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdJiZhcmd1bWVudHNbMl07cmV0dXJuIG4oZSxmdW5jdGlvbihuKXtyZXR1cm4gRSh0LG4scil9KX0sQT1mdW5jdGlvbih0LG4pe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdJiZhcmd1bWVudHNbMl07cmV0dXJuIFByb21pc2UuYWxsKHcodCxuLGUpKS50aGVuKGZ1bmN0aW9uKCl7dC5lbWl0KHQuY29uc3RhbnRzLkVWRU5UX0lNQUdFX0NPTVBMRVRFKX0pfSxJPWZ1bmN0aW9uKG4pe3JldHVybiB0KGZ1bmN0aW9uKCl7bi5lbWl0KG4uY29uc3RhbnRzLkVWRU5UX1JFU0laRSksbi5xdWV1ZS5hZGQoZnVuY3Rpb24oKXtyZXR1cm4gbi5yZWNhbGN1bGF0ZSghMCwhMCl9KX0sMTAwKX0sTj1mdW5jdGlvbih0KXtpZih0LmNvbnRhaW5lcj1oKHQub3B0aW9ucy5jb250YWluZXIpLHQuY29udGFpbmVyIGluc3RhbmNlb2YgaHx8IXQuY29udGFpbmVyKXJldHVybiEhdC5vcHRpb25zLmRlYnVnJiZjb25zb2xlLmVycm9yKFwiRXJyb3I6IENvbnRhaW5lciBub3QgZm91bmRcIik7dC5jb250YWluZXIubGVuZ3RoJiYodC5jb250YWluZXI9dC5jb250YWluZXJbMF0pLHQub3B0aW9ucy5jb250YWluZXI9dC5jb250YWluZXIsdC5jb250YWluZXIuc3R5bGUucG9zaXRpb249XCJyZWxhdGl2ZVwifSxUPWZ1bmN0aW9uKHQpe3QucXVldWU9bmV3IG0sdC5ldmVudHM9bmV3IHkodCksdC5yb3dzPVtdLHQucmVzaXplcj1JKHQpfSxMPWZ1bmN0aW9uKHQpe3ZhciBuPWgoXCJpbWdcIix0LmNvbnRhaW5lcik7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0LnJlc2l6ZXIpLHQub24odC5jb25zdGFudHMuRVZFTlRfSU1BR0VfTE9BRCxmdW5jdGlvbigpe3JldHVybiB0LnJlY2FsY3VsYXRlKCExLCExKX0pLHQub24odC5jb25zdGFudHMuRVZFTlRfSU1BR0VfQ09NUExFVEUsZnVuY3Rpb24oKXtyZXR1cm4gdC5yZWNhbGN1bGF0ZSghMCwhMCl9KSx0Lm9wdGlvbnMudXNlT3duSW1hZ2VMb2FkZXJ8fGUodCxuLCF0Lm9wdGlvbnMud2FpdEZvckltYWdlcyksdC5lbWl0KHQuY29uc3RhbnRzLkVWRU5UX0lOSVRJQUxJWkVEKX0sXz1mdW5jdGlvbih0KXtOKHQpLFQodCksTCh0KX0sYj1mdW5jdGlvbih0KXtyZXR1cm4gdD09PU9iamVjdCh0KSYmXCJbb2JqZWN0IEFycmF5XVwiIT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpfSxPPWZ1bmN0aW9uKHQsbil7Yih0KXx8KG4uY29sdW1ucz10KSxiKHQpJiZ0LmNvbHVtbnMmJihuLmNvbHVtbnM9dC5jb2x1bW5zKSxiKHQpJiZ0Lm1hcmdpbiYmIWIodC5tYXJnaW4pJiYobi5tYXJnaW49e3g6dC5tYXJnaW4seTp0Lm1hcmdpbn0pLGIodCkmJnQubWFyZ2luJiZiKHQubWFyZ2luKSYmdC5tYXJnaW4ueCYmKG4ubWFyZ2luLng9dC5tYXJnaW4ueCksYih0KSYmdC5tYXJnaW4mJmIodC5tYXJnaW4pJiZ0Lm1hcmdpbi55JiYobi5tYXJnaW4ueT10Lm1hcmdpbi55KX0sQz1mdW5jdGlvbih0LG4pe3JldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0LG51bGwpLmdldFByb3BlcnR5VmFsdWUobil9LE09ZnVuY3Rpb24odCxuKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSYmYXJndW1lbnRzWzJdO2lmKHQubGFzdGNvbHx8KHQubGFzdGNvbD0wKSx0LnJvd3MubGVuZ3RoPDEmJihlPSEwKSxlKXt0LnJvd3M9W10sdC5jb2xzPVtdLHQubGFzdGNvbD0wO2Zvcih2YXIgcj1uLTE7cj49MDtyLS0pdC5yb3dzW3JdPTAsdC5jb2xzW3JdPXUodCxyKX1lbHNlIGlmKHQudG1wUm93cyl7dC5yb3dzPVtdO2Zvcih2YXIgcj1uLTE7cj49MDtyLS0pdC5yb3dzW3JdPXQudG1wUm93c1tyXX1lbHNle3QudG1wUm93cz1bXTtmb3IodmFyIHI9bi0xO3I+PTA7ci0tKXQudG1wUm93c1tyXT10LnJvd3Nbcl19fSxWPWZ1bmN0aW9uKHQpe3ZhciBuPWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdJiZhcmd1bWVudHNbMV0sZT0hKGFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdKXx8YXJndW1lbnRzWzJdLHI9bj90LmNvbnRhaW5lci5jaGlsZHJlbjpoKCc6c2NvcGUgPiAqOm5vdChbZGF0YS1tYWN5LWNvbXBsZXRlPVwiMVwiXSknLHQuY29udGFpbmVyKTtyPUFycmF5LmZyb20ocikuZmlsdGVyKGZ1bmN0aW9uKHQpe3JldHVybiBudWxsIT09dC5vZmZzZXRQYXJlbnR9KTt2YXIgbz1jKHQub3B0aW9ucyk7cmV0dXJuIHYocixmdW5jdGlvbih0KXtuJiYodC5kYXRhc2V0Lm1hY3lDb21wbGV0ZT0wKSx0LnN0eWxlLndpZHRoPW99KSx0Lm9wdGlvbnMudHJ1ZU9yZGVyPyhmKHQscixuLGUpLHQuZW1pdCh0LmNvbnN0YW50cy5FVkVOVF9SRUNBTENVTEFURUQpKToocCh0LHIsbixlKSx0LmVtaXQodC5jb25zdGFudHMuRVZFTlRfUkVDQUxDVUxBVEVEKSl9LFI9ZnVuY3Rpb24oKXtyZXR1cm4hIXdpbmRvdy5Qcm9taXNlfSx4PU9iamVjdC5hc3NpZ258fGZ1bmN0aW9uKHQpe2Zvcih2YXIgbj0xO248YXJndW1lbnRzLmxlbmd0aDtuKyspe3ZhciBlPWFyZ3VtZW50c1tuXTtmb3IodmFyIHIgaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxyKSYmKHRbcl09ZVtyXSl9cmV0dXJuIHR9O0FycmF5LmZyb218fChBcnJheS5mcm9tPWZ1bmN0aW9uKHQpe2Zvcih2YXIgbj0wLGU9W107bjx0Lmxlbmd0aDspZS5wdXNoKHRbbisrXSk7cmV0dXJuIGV9KTt2YXIgaz17Y29sdW1uczo0LG1hcmdpbjoyLHRydWVPcmRlcjohMSx3YWl0Rm9ySW1hZ2VzOiExLHVzZUltYWdlTG9hZGVyOiEwLGJyZWFrQXQ6e30sdXNlT3duSW1hZ2VMb2FkZXI6ITEsb25Jbml0OiExLGNhbmNlbExlZ2FjeTohMSx1c2VDb250YWluZXJGb3JCcmVha3BvaW50czohMX07IWZ1bmN0aW9uKCl7dHJ5e2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGUgKlwiKX1jYXRjaCh0KXshZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQpe3JldHVybiBmdW5jdGlvbihlKXtpZihlJiZuLnRlc3QoZSkpe3ZhciByPXRoaXMuZ2V0QXR0cmlidXRlKFwiaWRcIik7cnx8KHRoaXMuaWQ9XCJxXCIrTWF0aC5mbG9vcig5ZTYqTWF0aC5yYW5kb20oKSkrMWU2KSxhcmd1bWVudHNbMF09ZS5yZXBsYWNlKG4sXCIjXCIrdGhpcy5pZCk7dmFyIG89dC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIG51bGw9PT1yP3RoaXMucmVtb3ZlQXR0cmlidXRlKFwiaWRcIik6cnx8KHRoaXMuaWQ9ciksb31yZXR1cm4gdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fXZhciBuPS86c2NvcGVcXGIvZ2ksZT10KEVsZW1lbnQucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3IpO0VsZW1lbnQucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3I9ZnVuY3Rpb24odCl7cmV0dXJuIGUuYXBwbHkodGhpcyxhcmd1bWVudHMpfTt2YXIgcj10KEVsZW1lbnQucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGwpO0VsZW1lbnQucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGw9ZnVuY3Rpb24odCl7cmV0dXJuIHIuYXBwbHkodGhpcyxhcmd1bWVudHMpfX0oKX19KCk7dmFyIHE9ZnVuY3Rpb24gdCgpe3ZhciBuPWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdP2FyZ3VtZW50c1swXTprO2lmKCEodGhpcyBpbnN0YW5jZW9mIHQpKXJldHVybiBuZXcgdChuKTt0aGlzLm9wdGlvbnM9e30seCh0aGlzLm9wdGlvbnMsayxuKSx0aGlzLm9wdGlvbnMuY2FuY2VsTGVnYWN5JiYhUigpfHxfKHRoaXMpfTtyZXR1cm4gcS5pbml0PWZ1bmN0aW9uKHQpe3JldHVybiBjb25zb2xlLndhcm4oXCJEZXByZWNpYXRlZDogTWFjeS5pbml0IHdpbGwgYmUgcmVtb3ZlZCBpbiB2My4wLjAgb3B0IHRvIHVzZSBNYWN5IGRpcmVjdGx5IGxpa2Ugc28gTWFjeSh7IC8qb3B0aW9ucyBoZXJlKi8gfSkgXCIpLG5ldyBxKHQpfSxxLnByb3RvdHlwZS5yZWNhbGN1bGF0ZU9uSW1hZ2VMb2FkPWZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXTtyZXR1cm4gZSh0aGlzLGgoXCJpbWdcIix0aGlzLmNvbnRhaW5lciksIXQpfSxxLnByb3RvdHlwZS5ydW5PbkltYWdlTG9hZD1mdW5jdGlvbih0KXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXSYmYXJndW1lbnRzWzFdLHI9aChcImltZ1wiLHRoaXMuY29udGFpbmVyKTtyZXR1cm4gdGhpcy5vbih0aGlzLmNvbnN0YW50cy5FVkVOVF9JTUFHRV9DT01QTEVURSx0KSxuJiZ0aGlzLm9uKHRoaXMuY29uc3RhbnRzLkVWRU5UX0lNQUdFX0xPQUQsdCksZSh0aGlzLHIsbil9LHEucHJvdG90eXBlLnJlY2FsY3VsYXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuPWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdJiZhcmd1bWVudHNbMF0sZT0hKGFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdKXx8YXJndW1lbnRzWzFdO3JldHVybiBlJiZ0aGlzLnF1ZXVlLmNsZWFyKCksdGhpcy5xdWV1ZS5hZGQoZnVuY3Rpb24oKXtyZXR1cm4gVih0LG4sZSl9KX0scS5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKCl7d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzLnJlc2l6ZXIpLHYodGhpcy5jb250YWluZXIuY2hpbGRyZW4sZnVuY3Rpb24odCl7dC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW1hY3ktY29tcGxldGVcIiksdC5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKX0pLHRoaXMuY29udGFpbmVyLnJlbW92ZUF0dHJpYnV0ZShcInN0eWxlXCIpfSxxLnByb3RvdHlwZS5yZUluaXQ9ZnVuY3Rpb24oKXt0aGlzLnJlY2FsY3VsYXRlKCEwLCEwKSx0aGlzLmVtaXQodGhpcy5jb25zdGFudHMuRVZFTlRfSU5JVElBTElaRUQpLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcy5yZXNpemVyKSx0aGlzLmNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbj1cInJlbGF0aXZlXCJ9LHEucHJvdG90eXBlLm9uPWZ1bmN0aW9uKHQsbil7dGhpcy5ldmVudHMub24odCxuKX0scS5wcm90b3R5cGUuZW1pdD1mdW5jdGlvbih0LG4pe3RoaXMuZXZlbnRzLmVtaXQodCxuKX0scS5jb25zdGFudHM9e0VWRU5UX0lOSVRJQUxJWkVEOlwibWFjeS5pbml0aWFsaXplZFwiLEVWRU5UX1JFQ0FMQ1VMQVRFRDpcIm1hY3kucmVjYWxjdWxhdGVkXCIsRVZFTlRfSU1BR0VfTE9BRDpcIm1hY3kuaW1hZ2UubG9hZFwiLEVWRU5UX0lNQUdFX0VSUk9SOlwibWFjeS5pbWFnZS5lcnJvclwiLEVWRU5UX0lNQUdFX0NPTVBMRVRFOlwibWFjeS5pbWFnZXMuY29tcGxldGVcIixFVkVOVF9SRVNJWkU6XCJtYWN5LnJlc2l6ZVwifSxxLnByb3RvdHlwZS5jb25zdGFudHM9cS5jb25zdGFudHMscX0pO1xuIiwiaW1wb3J0IE1hY3kgZnJvbSAnbWFjeSc7XG5cbmlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5kZXgtc2VjdGlvbi0tbWFzb25yeSAuaW1hZ2VzLXdyYXBwZXInKSkge1xuICBNYWN5KHtcbiAgICBjb250YWluZXI6ICcuaW5kZXgtc2VjdGlvbi0tbWFzb25yeSAuaW1hZ2VzLXdyYXBwZXInLFxuICAgIGNvbHVtbnM6IDMsXG4gICAgYnJlYWtBdDoge1xuICAgICAgNTIwOiAyLFxuICAgICAgNDAwOiAxLFxuICAgIH0sXG4gIH0pO1xufVxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuY29uc3QgZGlyZWN0aXZlcyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIEJyYW5kcyBhIGZ1bmN0aW9uIGFzIGEgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24gc28gdGhhdCBsaXQtaHRtbCB3aWxsIGNhbGxcbiAqIHRoZSBmdW5jdGlvbiBkdXJpbmcgdGVtcGxhdGUgcmVuZGVyaW5nLCByYXRoZXIgdGhhbiBwYXNzaW5nIGFzIGEgdmFsdWUuXG4gKlxuICogQSBfZGlyZWN0aXZlXyBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBQYXJ0IGFzIGFuIGFyZ3VtZW50LiBJdCBoYXMgdGhlXG4gKiBzaWduYXR1cmU6IGAocGFydDogUGFydCkgPT4gdm9pZGAuXG4gKlxuICogQSBkaXJlY3RpdmUgX2ZhY3RvcnlfIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhcmd1bWVudHMgZm9yIGRhdGEgYW5kXG4gKiBjb25maWd1cmF0aW9uIGFuZCByZXR1cm5zIGEgZGlyZWN0aXZlLiBVc2VycyBvZiBkaXJlY3RpdmUgdXN1YWxseSByZWZlciB0b1xuICogdGhlIGRpcmVjdGl2ZSBmYWN0b3J5IGFzIHRoZSBkaXJlY3RpdmUuIEZvciBleGFtcGxlLCBcIlRoZSByZXBlYXQgZGlyZWN0aXZlXCIuXG4gKlxuICogVXN1YWxseSBhIHRlbXBsYXRlIGF1dGhvciB3aWxsIGludm9rZSBhIGRpcmVjdGl2ZSBmYWN0b3J5IGluIHRoZWlyIHRlbXBsYXRlXG4gKiB3aXRoIHJlbGV2YW50IGFyZ3VtZW50cywgd2hpY2ggd2lsbCB0aGVuIHJldHVybiBhIGRpcmVjdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBIZXJlJ3MgYW4gZXhhbXBsZSBvZiB1c2luZyB0aGUgYHJlcGVhdCgpYCBkaXJlY3RpdmUgZmFjdG9yeSB0aGF0IHRha2VzIGFuXG4gKiBhcnJheSBhbmQgYSBmdW5jdGlvbiB0byByZW5kZXIgYW4gaXRlbTpcbiAqXG4gKiBgYGBqc1xuICogaHRtbGA8dWw+PCR7cmVwZWF0KGl0ZW1zLCAoaXRlbSkgPT4gaHRtbGA8bGk+JHtpdGVtfTwvbGk+YCl9PC91bD5gXG4gKiBgYGBcbiAqXG4gKiBXaGVuIGByZXBlYXRgIGlzIGludm9rZWQsIGl0IHJldHVybnMgYSBkaXJlY3RpdmUgZnVuY3Rpb24gdGhhdCBjbG9zZXMgb3ZlclxuICogYGl0ZW1zYCBhbmQgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uLiBXaGVuIHRoZSBvdXRlciB0ZW1wbGF0ZSBpcyByZW5kZXJlZCwgdGhlXG4gKiByZXR1cm4gZGlyZWN0aXZlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBQYXJ0IGZvciB0aGUgZXhwcmVzc2lvbi5cbiAqIGByZXBlYXRgIHRoZW4gcGVyZm9ybXMgaXQncyBjdXN0b20gbG9naWMgdG8gcmVuZGVyIG11bHRpcGxlIGl0ZW1zLlxuICpcbiAqIEBwYXJhbSBmIFRoZSBkaXJlY3RpdmUgZmFjdG9yeSBmdW5jdGlvbi4gTXVzdCBiZSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhXG4gKiBmdW5jdGlvbiBvZiB0aGUgc2lnbmF0dXJlIGAocGFydDogUGFydCkgPT4gdm9pZGAuIFRoZSByZXR1cm5lZCBmdW5jdGlvbiB3aWxsXG4gKiBiZSBjYWxsZWQgd2l0aCB0aGUgcGFydCBvYmplY3QuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBpbXBvcnQge2RpcmVjdGl2ZSwgaHRtbH0gZnJvbSAnbGl0LWh0bWwnO1xuICpcbiAqIGNvbnN0IGltbXV0YWJsZSA9IGRpcmVjdGl2ZSgodikgPT4gKHBhcnQpID0+IHtcbiAqICAgaWYgKHBhcnQudmFsdWUgIT09IHYpIHtcbiAqICAgICBwYXJ0LnNldFZhbHVlKHYpXG4gKiAgIH1cbiAqIH0pO1xuICovXG5leHBvcnQgY29uc3QgZGlyZWN0aXZlID0gKGYpID0+ICgoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IGQgPSBmKC4uLmFyZ3MpO1xuICAgIGRpcmVjdGl2ZXMuc2V0KGQsIHRydWUpO1xuICAgIHJldHVybiBkO1xufSk7XG5leHBvcnQgY29uc3QgaXNEaXJlY3RpdmUgPSAobykgPT4ge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ2Z1bmN0aW9uJyAmJiBkaXJlY3RpdmVzLmhhcyhvKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJlY3RpdmUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBUcnVlIGlmIHRoZSBjdXN0b20gZWxlbWVudHMgcG9seWZpbGwgaXMgaW4gdXNlLlxuICovXG5leHBvcnQgY29uc3QgaXNDRVBvbHlmaWxsID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMgIT0gbnVsbCAmJlxuICAgIHdpbmRvdy5jdXN0b21FbGVtZW50cy5wb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrICE9PVxuICAgICAgICB1bmRlZmluZWQ7XG4vKipcbiAqIFJlcGFyZW50cyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLFxuICogaW50byBhbm90aGVyIGNvbnRhaW5lciAoY291bGQgYmUgdGhlIHNhbWUgY29udGFpbmVyKSwgYmVmb3JlIGBiZWZvcmVgLiBJZlxuICogYGJlZm9yZWAgaXMgbnVsbCwgaXQgYXBwZW5kcyB0aGUgbm9kZXMgdG8gdGhlIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlcGFyZW50Tm9kZXMgPSAoY29udGFpbmVyLCBzdGFydCwgZW5kID0gbnVsbCwgYmVmb3JlID0gbnVsbCkgPT4ge1xuICAgIHdoaWxlIChzdGFydCAhPT0gZW5kKSB7XG4gICAgICAgIGNvbnN0IG4gPSBzdGFydC5uZXh0U2libGluZztcbiAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShzdGFydCwgYmVmb3JlKTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbn07XG4vKipcbiAqIFJlbW92ZXMgbm9kZXMsIHN0YXJ0aW5nIGZyb20gYHN0YXJ0YCAoaW5jbHVzaXZlKSB0byBgZW5kYCAoZXhjbHVzaXZlKSwgZnJvbVxuICogYGNvbnRhaW5lcmAuXG4gKi9cbmV4cG9ydCBjb25zdCByZW1vdmVOb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoc3RhcnQpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvbS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSB7fTtcbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBOb2RlUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB3aXRoIGVtYmVkZGVkIHVuaXF1ZSBrZXkgdG8gYXZvaWQgY29sbGlzaW9uIHdpdGhcbiAqIHBvc3NpYmxlIHRleHQgaW4gdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY29uc3QgbWFya2VyID0gYHt7bGl0LSR7U3RyaW5nKE1hdGgucmFuZG9tKCkpLnNsaWNlKDIpfX19YDtcbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgdXNlZCB0ZXh0LXBvc2l0aW9ucywgbXVsdGktYmluZGluZyBhdHRyaWJ1dGVzLCBhbmRcbiAqIGF0dHJpYnV0ZXMgd2l0aCBtYXJrdXAtbGlrZSB0ZXh0IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vZGVNYXJrZXIgPSBgPCEtLSR7bWFya2VyfS0tPmA7XG5leHBvcnQgY29uc3QgbWFya2VyUmVnZXggPSBuZXcgUmVnRXhwKGAke21hcmtlcn18JHtub2RlTWFya2VyfWApO1xuLyoqXG4gKiBTdWZmaXggYXBwZW5kZWQgdG8gYWxsIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcy5cbiAqL1xuZXhwb3J0IGNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcbi8qKlxuICogQW4gdXBkYXRhYmxlIFRlbXBsYXRlIHRoYXQgdHJhY2tzIHRoZSBsb2NhdGlvbiBvZiBkeW5hbWljIHBhcnRzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgZWxlbWVudCkge1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbXTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZWxlbWVudC5jb250ZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgaW5kZXggYXNzb2NpYXRlZCB3aXRoIGEgcGFydC4gV2UgdHJ5IHRvIGRlbGV0ZVxuICAgICAgICAvLyB1bm5lY2Vzc2FyeSBub2RlcywgYnV0IHdlIG5ldmVyIHdhbnQgdG8gYXNzb2NpYXRlIHR3byBkaWZmZXJlbnQgcGFydHNcbiAgICAgICAgLy8gdG8gdGhlIHNhbWUgaW5kZXguIFRoZXkgbXVzdCBoYXZlIGEgY29uc3RhbnQgbm9kZSBiZXR3ZWVuLlxuICAgICAgICBsZXQgbGFzdFBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgY29uc3QgeyBzdHJpbmdzLCB2YWx1ZXM6IHsgbGVuZ3RoIH0gfSA9IHJlc3VsdDtcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgYSB0ZW1wbGF0ZSBpbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAvKiBOb2RlLkVMRU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGxlbmd0aCB9ID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9OYW1lZE5vZGVNYXAsXG4gICAgICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIHJldHVybmVkIGluIGRvY3VtZW50IG9yZGVyLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBwYXJ0aWN1bGFyLCBFZGdlL0lFIGNhbiByZXR1cm4gdGhlbSBvdXQgb2Ygb3JkZXIsIHNvIHdlIGNhbm5vdFxuICAgICAgICAgICAgICAgICAgICAvLyBhc3N1bWUgYSBjb3JyZXNwb25kZW5jZSBiZXR3ZWVuIHBhcnQgaW5kZXggYW5kIGF0dHJpYnV0ZSBpbmRleC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoKGF0dHJpYnV0ZXNbaV0ubmFtZSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQtLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBzZWN0aW9uIGxlYWRpbmcgdXAgdG8gdGhlIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHByZXNzaW9uIGluIHRoaXMgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdGb3JQYXJ0ID0gc3RyaW5nc1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMoc3RyaW5nRm9yUGFydClbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxsIGJvdW5kIGF0dHJpYnV0ZXMgaGF2ZSBoYWQgYSBzdWZmaXggYWRkZWQgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbXBsYXRlUmVzdWx0I2dldEhUTUwgdG8gb3B0IG91dCBvZiBzcGVjaWFsIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxpbmcuIFRvIGxvb2sgdXAgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB3ZSBhbHNvIG5lZWQgdG8gYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3VmZml4LlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTG9va3VwTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKSArIGJvdW5kQXR0cmlidXRlU3VmZml4O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGljcyA9IGF0dHJpYnV0ZVZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdhdHRyaWJ1dGUnLCBpbmRleCwgbmFtZSwgc3RyaW5nczogc3RhdGljcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBzdGF0aWNzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBub2RlLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihtYXJrZXIpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdzID0gZGF0YS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbnNlcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcyA9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocyA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBjcmVhdGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCAmJiBlbmRzV2l0aChtYXRjaFsyXSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArIG1hdGNoWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzJdLnNsaWNlKDAsIC1ib3VuZEF0dHJpYnV0ZVN1ZmZpeC5sZW5ndGgpICsgbWF0Y2hbM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpbnNlcnQsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogKytpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIHRleHQsIHdlIG11c3QgaW5zZXJ0IGEgY29tbWVudCB0byBtYXJrIG91ciBwbGFjZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHRydXN0IGl0IHdpbGwgc3RpY2sgYXJvdW5kIGFmdGVyIGNsb25pbmcuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzW2xhc3RJbmRleF0gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9IHN0cmluZ3NbbGFzdEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgcGFydCBmb3IgZWFjaCBtYXRjaCBmb3VuZFxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gbGFzdEluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogTm9kZS5DT01NRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kYXRhID09PSBtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFya2VyIG5vZGUgdG8gYmUgdGhlIHN0YXJ0Tm9kZSBvZiB0aGUgUGFydCBpZiBhbnkgb2ZcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBhcmUgdHJ1ZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gICogV2UgZG9uJ3QgaGF2ZSBhIHByZXZpb3VzU2libGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyAgKiBUaGUgcHJldmlvdXNTaWJsaW5nIGlzIGFscmVhZHkgdGhlIHN0YXJ0IG9mIGEgcHJldmlvdXMgcGFydFxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IG51bGwgfHwgaW5kZXggPT09IGxhc3RQYXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0UGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBuZXh0U2libGluZywga2VlcCB0aGlzIG5vZGUgc28gd2UgaGF2ZSBhbiBlbmQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiByZW1vdmUgaXQgdG8gc2F2ZSBmdXR1cmUgY29zdHMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKGkgPSBub2RlLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBjb25zaWRlciB3aGV0aGVyIGl0J3MgZXZlbiB3b3J0aCBpdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBiaW5kaW5ncyBpbiBjb21tZW50cyB3b3JrXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiAtMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSB0ZXh0IGJpbmRpbmcgbm9kZXMgYWZ0ZXIgdGhlIHdhbGsgdG8gbm90IGRpc3R1cmIgdGhlIFRyZWVXYWxrZXJcbiAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbnN0IGVuZHNXaXRoID0gKHN0ciwgc3VmZml4KSA9PiB7XG4gICAgY29uc3QgaW5kZXggPSBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aDtcbiAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBzdHIuc2xpY2UoaW5kZXgpID09PSBzdWZmaXg7XG59O1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVQYXJ0QWN0aXZlID0gKHBhcnQpID0+IHBhcnQuaW5kZXggIT09IC0xO1xuLy8gQWxsb3dzIGBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKWAgdG8gYmUgcmVuYW1lZCBmb3IgYVxuLy8gc21hbGwgbWFudWFsIHNpemUtc2F2aW5ncy5cbmV4cG9ydCBjb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbi8qKlxuICogVGhpcyByZWdleCBleHRyYWN0cyB0aGUgYXR0cmlidXRlIG5hbWUgcHJlY2VkaW5nIGFuIGF0dHJpYnV0ZS1wb3NpdGlvblxuICogZXhwcmVzc2lvbi4gSXQgZG9lcyB0aGlzIGJ5IG1hdGNoaW5nIHRoZSBzeW50YXggYWxsb3dlZCBmb3IgYXR0cmlidXRlc1xuICogYWdhaW5zdCB0aGUgc3RyaW5nIGxpdGVyYWwgZGlyZWN0bHkgcHJlY2VkaW5nIHRoZSBleHByZXNzaW9uLCBhc3N1bWluZyB0aGF0XG4gKiB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhbiBhdHRyaWJ1dGUtdmFsdWUgcG9zaXRpb24uXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNlbGVtZW50cy1hdHRyaWJ1dGVzXG4gKlxuICogXCIgXFx4MDlcXHgwYVxceDBjXFx4MGRcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2luZnJhc3RydWN0dXJlLmh0bWwjc3BhY2UtY2hhcmFjdGVyc1xuICpcbiAqIFwiXFwwLVxceDFGXFx4N0YtXFx4OUZcIiBhcmUgVW5pY29kZSBjb250cm9sIGNoYXJhY3RlcnMsIHdoaWNoIGluY2x1ZGVzIGV2ZXJ5XG4gKiBzcGFjZSBjaGFyYWN0ZXIgZXhjZXB0IFwiIFwiLlxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIGNvbnRyb2wgY2hhcmFjdGVyLCBzcGFjZSBjaGFyYWN0ZXIsICgnKSxcbiAqICAgIChcIiksIFwiPlwiLCBcIj1cIiwgb3IgXCIvXCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmV4cG9ydCBjb25zdCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4ID0gXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxuLyhbIFxceDA5XFx4MGFcXHgwY1xceDBkXSkoW15cXDAtXFx4MUZcXHg3Ri1cXHg5RiBcIic+PS9dKykoWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qPVsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKig/OlteIFxceDA5XFx4MGFcXHgwY1xceDBkXCInYDw+PV0qfFwiW15cIl0qfCdbXiddKikpJC87XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBpc0NFUG9seWZpbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBpc1RlbXBsYXRlUGFydEFjdGl2ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBBbiBpbnN0YW5jZSBvZiBhIGBUZW1wbGF0ZWAgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSBhbmQgdXBkYXRlZFxuICogd2l0aCBuZXcgdmFsdWVzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVJbnN0YW5jZSB7XG4gICAgY29uc3RydWN0b3IodGVtcGxhdGUsIHByb2Nlc3Nvciwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLl9fcGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICB0aGlzLnByb2Nlc3NvciA9IHByb2Nlc3NvcjtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgdXBkYXRlKHZhbHVlcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LnNldFZhbHVlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuX19wYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBhcnQuY29tbWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2Nsb25lKCkge1xuICAgICAgICAvLyBUaGVyZSBhcmUgYSBudW1iZXIgb2Ygc3RlcHMgaW4gdGhlIGxpZmVjeWNsZSBvZiBhIHRlbXBsYXRlIGluc3RhbmNlJ3NcbiAgICAgICAgLy8gRE9NIGZyYWdtZW50OlxuICAgICAgICAvLyAgMS4gQ2xvbmUgLSBjcmVhdGUgdGhlIGluc3RhbmNlIGZyYWdtZW50XG4gICAgICAgIC8vICAyLiBBZG9wdCAtIGFkb3B0IGludG8gdGhlIG1haW4gZG9jdW1lbnRcbiAgICAgICAgLy8gIDMuIFByb2Nlc3MgLSBmaW5kIHBhcnQgbWFya2VycyBhbmQgY3JlYXRlIHBhcnRzXG4gICAgICAgIC8vICA0LiBVcGdyYWRlIC0gdXBncmFkZSBjdXN0b20gZWxlbWVudHNcbiAgICAgICAgLy8gIDUuIFVwZGF0ZSAtIHNldCBub2RlLCBhdHRyaWJ1dGUsIHByb3BlcnR5LCBldGMuLCB2YWx1ZXNcbiAgICAgICAgLy8gIDYuIENvbm5lY3QgLSBjb25uZWN0IHRvIHRoZSBkb2N1bWVudC4gT3B0aW9uYWwgYW5kIG91dHNpZGUgb2YgdGhpc1xuICAgICAgICAvLyAgICAgbWV0aG9kLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSBoYXZlIGEgZmV3IGNvbnN0cmFpbnRzIG9uIHRoZSBvcmRlcmluZyBvZiB0aGVzZSBzdGVwczpcbiAgICAgICAgLy8gICogV2UgbmVlZCB0byB1cGdyYWRlIGJlZm9yZSB1cGRhdGluZywgc28gdGhhdCBwcm9wZXJ0eSB2YWx1ZXMgd2lsbCBwYXNzXG4gICAgICAgIC8vICAgIHRocm91Z2ggYW55IHByb3BlcnR5IHNldHRlcnMuXG4gICAgICAgIC8vICAqIFdlIHdvdWxkIGxpa2UgdG8gcHJvY2VzcyBiZWZvcmUgdXBncmFkaW5nIHNvIHRoYXQgd2UncmUgc3VyZSB0aGF0IHRoZVxuICAgICAgICAvLyAgICBjbG9uZWQgZnJhZ21lbnQgaXMgaW5lcnQgYW5kIG5vdCBkaXN0dXJiZWQgYnkgc2VsZi1tb2RpZnlpbmcgRE9NLlxuICAgICAgICAvLyAgKiBXZSB3YW50IGN1c3RvbSBlbGVtZW50cyB0byB1cGdyYWRlIGV2ZW4gaW4gZGlzY29ubmVjdGVkIGZyYWdtZW50cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gR2l2ZW4gdGhlc2UgY29uc3RyYWludHMsIHdpdGggZnVsbCBjdXN0b20gZWxlbWVudHMgc3VwcG9ydCB3ZSB3b3VsZFxuICAgICAgICAvLyBwcmVmZXIgdGhlIG9yZGVyOiBDbG9uZSwgUHJvY2VzcywgQWRvcHQsIFVwZ3JhZGUsIFVwZGF0ZSwgQ29ubmVjdFxuICAgICAgICAvL1xuICAgICAgICAvLyBCdXQgU2FmYXJpIGRvZXMgbm90IGltcGxlbWVudCBDdXN0b21FbGVtZW50UmVnaXN0cnkjdXBncmFkZSwgc28gd2VcbiAgICAgICAgLy8gY2FuIG5vdCBpbXBsZW1lbnQgdGhhdCBvcmRlciBhbmQgc3RpbGwgaGF2ZSB1cGdyYWRlLWJlZm9yZS11cGRhdGUgYW5kXG4gICAgICAgIC8vIHVwZ3JhZGUgZGlzY29ubmVjdGVkIGZyYWdtZW50cy4gU28gd2UgaW5zdGVhZCBzYWNyaWZpY2UgdGhlXG4gICAgICAgIC8vIHByb2Nlc3MtYmVmb3JlLXVwZ3JhZGUgY29uc3RyYWludCwgc2luY2UgaW4gQ3VzdG9tIEVsZW1lbnRzIHYxIGVsZW1lbnRzXG4gICAgICAgIC8vIG11c3Qgbm90IG1vZGlmeSB0aGVpciBsaWdodCBET00gaW4gdGhlIGNvbnN0cnVjdG9yLiBXZSBzdGlsbCBoYXZlIGlzc3Vlc1xuICAgICAgICAvLyB3aGVuIGNvLWV4aXN0aW5nIHdpdGggQ0V2MCBlbGVtZW50cyBsaWtlIFBvbHltZXIgMSwgYW5kIHdpdGggcG9seWZpbGxzXG4gICAgICAgIC8vIHRoYXQgZG9uJ3Qgc3RyaWN0bHkgYWRoZXJlIHRvIHRoZSBuby1tb2RpZmljYXRpb24gcnVsZSBiZWNhdXNlIHNoYWRvd1xuICAgICAgICAvLyBET00sIHdoaWNoIG1heSBiZSBjcmVhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciwgaXMgZW11bGF0ZWQgYnkgYmVpbmcgcGxhY2VkXG4gICAgICAgIC8vIGluIHRoZSBsaWdodCBET00uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSByZXN1bHRpbmcgb3JkZXIgaXMgb24gbmF0aXZlIGlzOiBDbG9uZSwgQWRvcHQsIFVwZ3JhZGUsIFByb2Nlc3MsXG4gICAgICAgIC8vIFVwZGF0ZSwgQ29ubmVjdC4gZG9jdW1lbnQuaW1wb3J0Tm9kZSgpIHBlcmZvcm1zIENsb25lLCBBZG9wdCwgYW5kIFVwZ3JhZGVcbiAgICAgICAgLy8gaW4gb25lIHN0ZXAuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSBDdXN0b20gRWxlbWVudHMgdjEgcG9seWZpbGwgc3VwcG9ydHMgdXBncmFkZSgpLCBzbyB0aGUgb3JkZXIgd2hlblxuICAgICAgICAvLyBwb2x5ZmlsbGVkIGlzIHRoZSBtb3JlIGlkZWFsOiBDbG9uZSwgUHJvY2VzcywgQWRvcHQsIFVwZ3JhZGUsIFVwZGF0ZSxcbiAgICAgICAgLy8gQ29ubmVjdC5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBpc0NFUG9seWZpbGwgP1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpIDpcbiAgICAgICAgICAgIGRvY3VtZW50LmltcG9ydE5vZGUodGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMudGVtcGxhdGUucGFydHM7XG4gICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmUgbnVsbFxuICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGZyYWdtZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgICAgICBsZXQgcGFydDtcbiAgICAgICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCB0aGUgbm9kZXMgYW5kIHBhcnRzIG9mIGEgdGVtcGxhdGVcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFydCA9IHBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICBpZiAoIWlzVGVtcGxhdGVQYXJ0QWN0aXZlKHBhcnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2dyZXNzIHRoZSB0cmVlIHdhbGtlciB1bnRpbCB3ZSBmaW5kIG91ciBuZXh0IHBhcnQncyBub2RlLlxuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IG11bHRpcGxlIHBhcnRzIG1heSBzaGFyZSB0aGUgc2FtZSBub2RlIChhdHRyaWJ1dGUgcGFydHNcbiAgICAgICAgICAgIC8vIG9uIGEgc2luZ2xlIGVsZW1lbnQpLCBzbyB0aGlzIGxvb3AgbWF5IG5vdCBydW4gYXQgYWxsLlxuICAgICAgICAgICAgd2hpbGUgKG5vZGVJbmRleCA8IHBhcnQuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgobm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2Ugc3RpbGwgaGF2ZSBwYXJ0cyAodGhlIG91dGVyIGZvci1sb29wKSwgd2Uga25vdzpcbiAgICAgICAgICAgICAgICAgICAgLy8gLSBUaGVyZSBpcyBhIHRlbXBsYXRlIGluIHRoZSBzdGFja1xuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXZSd2ZSBhcnJpdmVkIGF0IG91ciBwYXJ0J3Mgbm9kZS5cbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICdub2RlJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnQgPSB0aGlzLnByb2Nlc3Nvci5oYW5kbGVUZXh0RXhwcmVzc2lvbih0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHBhcnQuaW5zZXJ0QWZ0ZXJOb2RlKG5vZGUucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKC4uLnRoaXMucHJvY2Vzc29yLmhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKG5vZGUsIHBhcnQubmFtZSwgcGFydC5zdHJpbmdzLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NFUG9seWZpbGwpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkb3B0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICBjdXN0b21FbGVtZW50cy51cGdyYWRlKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtaW5zdGFuY2UuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IHJlcGFyZW50Tm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBib3VuZEF0dHJpYnV0ZVN1ZmZpeCwgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCwgbWFya2VyLCBub2RlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIE91ciBUcnVzdGVkVHlwZVBvbGljeSBmb3IgSFRNTCB3aGljaCBpcyBkZWNsYXJlZCB1c2luZyB0aGUgaHRtbCB0ZW1wbGF0ZVxuICogdGFnIGZ1bmN0aW9uLlxuICpcbiAqIFRoYXQgSFRNTCBpcyBhIGRldmVsb3Blci1hdXRob3JlZCBjb25zdGFudCwgYW5kIGlzIHBhcnNlZCB3aXRoIGlubmVySFRNTFxuICogYmVmb3JlIGFueSB1bnRydXN0ZWQgZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIG1peGVkIGluLiBUaGVyZWZvciBpdCBpc1xuICogY29uc2lkZXJlZCBzYWZlIGJ5IGNvbnN0cnVjdGlvbi5cbiAqL1xuY29uc3QgcG9saWN5ID0gd2luZG93LnRydXN0ZWRUeXBlcyAmJlxuICAgIHRydXN0ZWRUeXBlcy5jcmVhdGVQb2xpY3koJ2xpdC1odG1sJywgeyBjcmVhdGVIVE1MOiAocykgPT4gcyB9KTtcbmNvbnN0IGNvbW1lbnRNYXJrZXIgPSBgICR7bWFya2VyfSBgO1xuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgYGh0bWxgLCB3aGljaCBob2xkcyBhIFRlbXBsYXRlIGFuZCB0aGUgdmFsdWVzIGZyb21cbiAqIGludGVycG9sYXRlZCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdHJpbmdzLCB2YWx1ZXMsIHR5cGUsIHByb2Nlc3Nvcikge1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgSFRNTCB1c2VkIHRvIGNyZWF0ZSBhIGA8dGVtcGxhdGU+YCBlbGVtZW50LlxuICAgICAqL1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIGNvbnN0IGwgPSB0aGlzLnN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgbGV0IGlzQ29tbWVudEJpbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnN0cmluZ3NbaV07XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBiaW5kaW5nIHdlIHdhbnQgdG8gZGV0ZXJtaW5lIHRoZSBraW5kIG9mIG1hcmtlciB0byBpbnNlcnRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIHRlbXBsYXRlIHNvdXJjZSBiZWZvcmUgaXQncyBwYXJzZWQgYnkgdGhlIGJyb3dzZXIncyBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFRoZSBtYXJrZXIgdHlwZSBpcyBiYXNlZCBvbiB3aGV0aGVyIHRoZSBleHByZXNzaW9uIGlzIGluIGFuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGUsIHRleHQsIG9yIGNvbW1lbnQgcG9zaXRpb24uXG4gICAgICAgICAgICAvLyAgICogRm9yIG5vZGUtcG9zaXRpb24gYmluZGluZ3Mgd2UgaW5zZXJ0IGEgY29tbWVudCB3aXRoIHRoZSBtYXJrZXJcbiAgICAgICAgICAgIC8vICAgICBzZW50aW5lbCBhcyBpdHMgdGV4dCBjb250ZW50LCBsaWtlIDwhLS17e2xpdC1ndWlkfX0tLT4uXG4gICAgICAgICAgICAvLyAgICogRm9yIGF0dHJpYnV0ZSBiaW5kaW5ncyB3ZSBpbnNlcnQganVzdCB0aGUgbWFya2VyIHNlbnRpbmVsIGZvciB0aGVcbiAgICAgICAgICAgIC8vICAgICBmaXJzdCBiaW5kaW5nLCBzbyB0aGF0IHdlIHN1cHBvcnQgdW5xdW90ZWQgYXR0cmlidXRlIGJpbmRpbmdzLlxuICAgICAgICAgICAgLy8gICAgIFN1YnNlcXVlbnQgYmluZGluZ3MgY2FuIHVzZSBhIGNvbW1lbnQgbWFya2VyIGJlY2F1c2UgbXVsdGktYmluZGluZ1xuICAgICAgICAgICAgLy8gICAgIGF0dHJpYnV0ZXMgbXVzdCBiZSBxdW90ZWQuXG4gICAgICAgICAgICAvLyAgICogRm9yIGNvbW1lbnQgYmluZGluZ3Mgd2UgaW5zZXJ0IGp1c3QgdGhlIG1hcmtlciBzZW50aW5lbCBzbyB3ZSBkb24ndFxuICAgICAgICAgICAgLy8gICAgIGNsb3NlIHRoZSBjb21tZW50LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBzY2FucyB0aGUgdGVtcGxhdGUgc291cmNlLCBidXQgaXMgKm5vdCogYW4gSFRNTFxuICAgICAgICAgICAgLy8gcGFyc2VyLiBXZSBkb24ndCBuZWVkIHRvIHRyYWNrIHRoZSB0cmVlIHN0cnVjdHVyZSBvZiB0aGUgSFRNTCwgb25seVxuICAgICAgICAgICAgLy8gd2hldGhlciBhIGJpbmRpbmcgaXMgaW5zaWRlIGEgY29tbWVudCwgYW5kIGlmIG5vdCwgaWYgaXQgYXBwZWFycyB0byBiZVxuICAgICAgICAgICAgLy8gdGhlIGZpcnN0IGJpbmRpbmcgaW4gYW4gYXR0cmlidXRlLlxuICAgICAgICAgICAgY29uc3QgY29tbWVudE9wZW4gPSBzLmxhc3RJbmRleE9mKCc8IS0tJyk7XG4gICAgICAgICAgICAvLyBXZSdyZSBpbiBjb21tZW50IHBvc2l0aW9uIGlmIHdlIGhhdmUgYSBjb21tZW50IG9wZW4gd2l0aCBubyBmb2xsb3dpbmdcbiAgICAgICAgICAgIC8vIGNvbW1lbnQgY2xvc2UuIEJlY2F1c2UgPC0tIGNhbiBhcHBlYXIgaW4gYW4gYXR0cmlidXRlIHZhbHVlIHRoZXJlIGNhblxuICAgICAgICAgICAgLy8gYmUgZmFsc2UgcG9zaXRpdmVzLlxuICAgICAgICAgICAgaXNDb21tZW50QmluZGluZyA9IChjb21tZW50T3BlbiA+IC0xIHx8IGlzQ29tbWVudEJpbmRpbmcpICYmXG4gICAgICAgICAgICAgICAgcy5pbmRleE9mKCctLT4nLCBjb21tZW50T3BlbiArIDEpID09PSAtMTtcbiAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGFuIGF0dHJpYnV0ZS1saWtlIHNlcXVlbmNlIHByZWNlZGluZyB0aGVcbiAgICAgICAgICAgIC8vIGV4cHJlc3Npb24uIFRoaXMgY2FuIG1hdGNoIFwibmFtZT12YWx1ZVwiIGxpa2Ugc3RydWN0dXJlcyBpbiB0ZXh0LFxuICAgICAgICAgICAgLy8gY29tbWVudHMsIGFuZCBhdHRyaWJ1dGUgdmFsdWVzLCBzbyB0aGVyZSBjYW4gYmUgZmFsc2UtcG9zaXRpdmVzLlxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlTWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBvbmx5IGluIHRoaXMgYnJhbmNoIGlmIHdlIGRvbid0IGhhdmUgYSBhdHRyaWJ1dGUtbGlrZVxuICAgICAgICAgICAgICAgIC8vIHByZWNlZGluZyBzZXF1ZW5jZS4gRm9yIGNvbW1lbnRzLCB0aGlzIGd1YXJkcyBhZ2FpbnN0IHVudXN1YWxcbiAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGUgdmFsdWVzIGxpa2UgPGRpdiBmb289XCI8IS0tJHsnYmFyJ31cIj4uIENhc2VzIGxpa2VcbiAgICAgICAgICAgICAgICAvLyA8IS0tIGZvbz0keydiYXInfS0tPiBhcmUgaGFuZGxlZCBjb3JyZWN0bHkgaW4gdGhlIGF0dHJpYnV0ZSBicmFuY2hcbiAgICAgICAgICAgICAgICAvLyBiZWxvdy5cbiAgICAgICAgICAgICAgICBodG1sICs9IHMgKyAoaXNDb21tZW50QmluZGluZyA/IGNvbW1lbnRNYXJrZXIgOiBub2RlTWFya2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBhdHRyaWJ1dGVzIHdlIHVzZSBqdXN0IGEgbWFya2VyIHNlbnRpbmVsLCBhbmQgYWxzbyBhcHBlbmQgYVxuICAgICAgICAgICAgICAgIC8vICRsaXQkIHN1ZmZpeCB0byB0aGUgbmFtZSB0byBvcHQtb3V0IG9mIGF0dHJpYnV0ZS1zcGVjaWZpYyBwYXJzaW5nXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBJRSBhbmQgRWRnZSBkbyBmb3Igc3R5bGUgYW5kIGNlcnRhaW4gU1ZHIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzLnN1YnN0cigwLCBhdHRyaWJ1dGVNYXRjaC5pbmRleCkgKyBhdHRyaWJ1dGVNYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU1hdGNoWzJdICsgYm91bmRBdHRyaWJ1dGVTdWZmaXggKyBhdHRyaWJ1dGVNYXRjaFszXSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBodG1sICs9IHRoaXMuc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmdldEhUTUwoKTtcbiAgICAgICAgaWYgKHBvbGljeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIHNlY3VyZSBiZWNhdXNlIGB0aGlzLnN0cmluZ3NgIGlzIGEgVGVtcGxhdGVTdHJpbmdzQXJyYXkuXG4gICAgICAgICAgICAvLyBUT0RPOiB2YWxpZGF0ZSB0aGlzIHdoZW5cbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLWFycmF5LWlzLXRlbXBsYXRlLW9iamVjdCBpc1xuICAgICAgICAgICAgLy8gaW1wbGVtZW50ZWQuXG4gICAgICAgICAgICB2YWx1ZSA9IHBvbGljeS5jcmVhdGVIVE1MKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8qKlxuICogQSBUZW1wbGF0ZVJlc3VsdCBmb3IgU1ZHIGZyYWdtZW50cy5cbiAqXG4gKiBUaGlzIGNsYXNzIHdyYXBzIEhUTUwgaW4gYW4gYDxzdmc+YCB0YWcgaW4gb3JkZXIgdG8gcGFyc2UgaXRzIGNvbnRlbnRzIGluIHRoZVxuICogU1ZHIG5hbWVzcGFjZSwgdGhlbiBtb2RpZmllcyB0aGUgdGVtcGxhdGUgdG8gcmVtb3ZlIHRoZSBgPHN2Zz5gIHRhZyBzbyB0aGF0XG4gKiBjbG9uZXMgb25seSBjb250YWluZXIgdGhlIG9yaWdpbmFsIGZyYWdtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU1ZHVGVtcGxhdGVSZXN1bHQgZXh0ZW5kcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgcmV0dXJuIGA8c3ZnPiR7c3VwZXIuZ2V0SFRNTCgpfTwvc3ZnPmA7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBzdXBlci5nZXRUZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBjb250ZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoc3ZnRWxlbWVudCk7XG4gICAgICAgIHJlcGFyZW50Tm9kZXMoY29udGVudCwgc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLXJlc3VsdC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBpc0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgbm9DaGFuZ2UsIG5vdGhpbmcgfSBmcm9tICcuL3BhcnQuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vdGVtcGxhdGUtaW5zdGFuY2UuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiAodmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgISh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykpO1xufTtcbmV4cG9ydCBjb25zdCBpc0l0ZXJhYmxlID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpIHx8XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICEhKHZhbHVlICYmIHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0pO1xufTtcbi8qKlxuICogV3JpdGVzIGF0dHJpYnV0ZSB2YWx1ZXMgdG8gdGhlIERPTSBmb3IgYSBncm91cCBvZiBBdHRyaWJ1dGVQYXJ0cyBib3VuZCB0byBhXG4gKiBzaW5nbGUgYXR0cmlidXRlLiBUaGUgdmFsdWUgaXMgb25seSBzZXQgb25jZSBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0c1xuICogZm9yIGFuIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRzW2ldID0gdGhpcy5fY3JlYXRlUGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaW5nbGUgcGFydC4gT3ZlcnJpZGUgdGhpcyB0byBjcmVhdGUgYSBkaWZmZXJudCB0eXBlIG9mIHBhcnQuXG4gICAgICovXG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXR0cmlidXRlUGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuICAgICAgICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMucGFydHM7XG4gICAgICAgIC8vIElmIHdlJ3JlIGFzc2lnbmluZyBhbiBhdHRyaWJ1dGUgdmlhIHN5bnRheCBsaWtlOlxuICAgICAgICAvLyAgICBhdHRyPVwiJHtmb299XCIgIG9yICBhdHRyPSR7Zm9vfVxuICAgICAgICAvLyBidXQgbm90XG4gICAgICAgIC8vICAgIGF0dHI9XCIke2Zvb30gJHtiYXJ9XCIgb3IgYXR0cj1cIiR7Zm9vfSBiYXpcIlxuICAgICAgICAvLyB0aGVuIHdlIGRvbid0IHdhbnQgdG8gY29lcmNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgaW50byBvbmUgbG9uZ1xuICAgICAgICAvLyBzdHJpbmcuIEluc3RlYWQgd2Ugd2FudCB0byBqdXN0IHJldHVybiB0aGUgdmFsdWUgaXRzZWxmIGRpcmVjdGx5LFxuICAgICAgICAvLyBzbyB0aGF0IHNhbml0aXplRE9NVmFsdWUgY2FuIGdldCB0aGUgYWN0dWFsIHZhbHVlIHJhdGhlciB0aGFuXG4gICAgICAgIC8vIFN0cmluZyh2YWx1ZSlcbiAgICAgICAgLy8gVGhlIGV4Y2VwdGlvbiBpcyBpZiB2IGlzIGFuIGFycmF5LCBpbiB3aGljaCBjYXNlIHdlIGRvIHdhbnQgdG8gc21hc2hcbiAgICAgICAgLy8gaXQgdG9nZXRoZXIgaW50byBhIHN0cmluZyB3aXRob3V0IGNhbGxpbmcgU3RyaW5nKCkgb24gdGhlIGFycmF5LlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGlzIGFsc28gYWxsb3dzIHRydXN0ZWQgdmFsdWVzICh3aGVuIHVzaW5nIFRydXN0ZWRUeXBlcykgYmVpbmdcbiAgICAgICAgLy8gYXNzaWduZWQgdG8gRE9NIHNpbmtzIHdpdGhvdXQgYmVpbmcgc3RyaW5naWZpZWQgaW4gdGhlIHByb2Nlc3MuXG4gICAgICAgIGlmIChsID09PSAxICYmIHN0cmluZ3NbMF0gPT09ICcnICYmIHN0cmluZ3NbMV0gPT09ICcnKSB7XG4gICAgICAgICAgICBjb25zdCB2ID0gcGFydHNbMF0udmFsdWU7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdzeW1ib2wnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycgfHwgIWlzSXRlcmFibGUodikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgdGV4dCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGV4dCArPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBwYXJ0LnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChpc1ByaW1pdGl2ZSh2KSB8fCAhaXNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYgOiBTdHJpbmcodik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHQgb2Ygdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdCA9PT0gJ3N0cmluZycgPyB0IDogU3RyaW5nKHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRleHQgKz0gc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5uYW1lLCB0aGlzLl9nZXRWYWx1ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQSBQYXJ0IHRoYXQgY29udHJvbHMgYWxsIG9yIHBhcnQgb2YgYW4gYXR0cmlidXRlIHZhbHVlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoY29tbWl0dGVyKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuY29tbWl0dGVyID0gY29tbWl0dGVyO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT09IG5vQ2hhbmdlICYmICghaXNQcmltaXRpdmUodmFsdWUpIHx8IHZhbHVlICE9PSB0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGEgbm90IGEgZGlyZWN0aXZlLCBkaXJ0eSB0aGUgY29tbWl0dGVyIHNvIHRoYXQgaXQnbGxcbiAgICAgICAgICAgIC8vIGNhbGwgc2V0QXR0cmlidXRlLiBJZiB0aGUgdmFsdWUgaXMgYSBkaXJlY3RpdmUsIGl0J2xsIGRpcnR5IHRoZVxuICAgICAgICAgICAgLy8gY29tbWl0dGVyIGlmIGl0IGNhbGxzIHNldFZhbHVlKCkuXG4gICAgICAgICAgICBpZiAoIWlzRGlyZWN0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tbWl0dGVyLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbW1pdHRlci5jb21taXQoKTtcbiAgICB9XG59XG4vKipcbiAqIEEgUGFydCB0aGF0IGNvbnRyb2xzIGEgbG9jYXRpb24gd2l0aGluIGEgTm9kZSB0cmVlLiBMaWtlIGEgUmFuZ2UsIE5vZGVQYXJ0XG4gKiBoYXMgc3RhcnQgYW5kIGVuZCBsb2NhdGlvbnMgYW5kIGNhbiBzZXQgYW5kIHVwZGF0ZSB0aGUgTm9kZXMgYmV0d2VlbiB0aG9zZVxuICogbG9jYXRpb25zLlxuICpcbiAqIE5vZGVQYXJ0cyBzdXBwb3J0IHNldmVyYWwgdmFsdWUgdHlwZXM6IHByaW1pdGl2ZXMsIE5vZGVzLCBUZW1wbGF0ZVJlc3VsdHMsXG4gKiBhcyB3ZWxsIGFzIGFycmF5cyBhbmQgaXRlcmFibGVzIG9mIHRob3NlIHR5cGVzLlxuICovXG5leHBvcnQgY2xhc3MgTm9kZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGFwcGVuZEludG8oY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYWZ0ZXIgdGhlIGByZWZgIG5vZGUgKGJldHdlZW4gYHJlZmAgYW5kIGByZWZgJ3MgbmV4dFxuICAgICAqIHNpYmxpbmcpLiBCb3RoIGByZWZgIGFuZCBpdHMgbmV4dCBzaWJsaW5nIG11c3QgYmUgc3RhdGljLCB1bmNoYW5naW5nIG5vZGVzXG4gICAgICogc3VjaCBhcyB0aG9zZSB0aGF0IGFwcGVhciBpbiBhIGxpdGVyYWwgc2VjdGlvbiBvZiBhIHRlbXBsYXRlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXJOb2RlKHJlZikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IHJlZjtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoaXMgcGFydCBpbnRvIGEgcGFyZW50IHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvUGFydChwYXJ0KSB7XG4gICAgICAgIHBhcnQuX19pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHBhcnQuX19pbnNlcnQodGhpcy5lbmROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBhZnRlciB0aGUgYHJlZmAgcGFydC5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyUGFydChyZWYpIHtcbiAgICAgICAgcmVmLl9faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSByZWYuZW5kTm9kZTtcbiAgICAgICAgcmVmLmVuZE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0Tm9kZS5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm90aGluZztcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19pbnNlcnQobm9kZSkge1xuICAgICAgICB0aGlzLmVuZE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgdGhpcy5lbmROb2RlKTtcbiAgICB9XG4gICAgX19jb21taXROb2RlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fX2luc2VydCh2YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZXh0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZS5uZXh0U2libGluZztcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbiAgICAgICAgLy8gSWYgYHZhbHVlYCBpc24ndCBhbHJlYWR5IGEgc3RyaW5nLCB3ZSBleHBsaWNpdGx5IGNvbnZlcnQgaXQgaGVyZSBpbiBjYXNlXG4gICAgICAgIC8vIGl0IGNhbid0IGJlIGltcGxpY2l0bHkgY29udmVydGVkIC0gaS5lLiBpdCdzIGEgc3ltYm9sLlxuICAgICAgICBjb25zdCB2YWx1ZUFzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuZW5kTm9kZS5wcmV2aW91c1NpYmxpbmcgJiZcbiAgICAgICAgICAgIG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIG9ubHkgaGF2ZSBhIHNpbmdsZSB0ZXh0IG5vZGUgYmV0d2VlbiB0aGUgbWFya2Vycywgd2UgY2FuIGp1c3RcbiAgICAgICAgICAgIC8vIHNldCBpdHMgdmFsdWUsIHJhdGhlciB0aGFuIHJlcGxhY2luZyBpdC5cbiAgICAgICAgICAgIC8vIFRPRE8oanVzdGluZmFnbmFuaSk6IENhbiB3ZSBqdXN0IGNoZWNrIGlmIHRoaXMudmFsdWUgaXMgcHJpbWl0aXZlP1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gdmFsdWVBc1N0cmluZztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZhbHVlQXNTdHJpbmcpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIF9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGVGYWN0b3J5KHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZUluc3RhbmNlICYmXG4gICAgICAgICAgICB0aGlzLnZhbHVlLnRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBwcm9wYWdhdGUgdGhlIHRlbXBsYXRlIHByb2Nlc3NvciBmcm9tIHRoZSBUZW1wbGF0ZVJlc3VsdFxuICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSB1c2UgaXRzIHN5bnRheCBleHRlbnNpb24sIGV0Yy4gVGhlIHRlbXBsYXRlIGZhY3RvcnkgY29tZXNcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIHJlbmRlciBmdW5jdGlvbiBvcHRpb25zIHNvIHRoYXQgaXQgY2FuIGNvbnRyb2wgdGVtcGxhdGVcbiAgICAgICAgICAgIC8vIGNhY2hpbmcgYW5kIHByZXByb2Nlc3NpbmcuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlLCB2YWx1ZS5wcm9jZXNzb3IsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSgpO1xuICAgICAgICAgICAgaW5zdGFuY2UudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19jb21taXRJdGVyYWJsZSh2YWx1ZSkge1xuICAgICAgICAvLyBGb3IgYW4gSXRlcmFibGUsIHdlIGNyZWF0ZSBhIG5ldyBJbnN0YW5jZVBhcnQgcGVyIGl0ZW0sIHRoZW4gc2V0IGl0c1xuICAgICAgICAvLyB2YWx1ZSB0byB0aGUgaXRlbS4gVGhpcyBpcyBhIGxpdHRsZSBiaXQgb2Ygb3ZlcmhlYWQgZm9yIGV2ZXJ5IGl0ZW0gaW5cbiAgICAgICAgLy8gYW4gSXRlcmFibGUsIGJ1dCBpdCBsZXRzIHVzIHJlY3Vyc2UgZWFzaWx5IGFuZCBlZmZpY2llbnRseSB1cGRhdGUgQXJyYXlzXG4gICAgICAgIC8vIG9mIFRlbXBsYXRlUmVzdWx0cyB0aGF0IHdpbGwgYmUgY29tbW9ubHkgcmV0dXJuZWQgZnJvbSBleHByZXNzaW9ucyBsaWtlOlxuICAgICAgICAvLyBhcnJheS5tYXAoKGkpID0+IGh0bWxgJHtpfWApLCBieSByZXVzaW5nIGV4aXN0aW5nIFRlbXBsYXRlSW5zdGFuY2VzLlxuICAgICAgICAvLyBJZiBfdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gdGhlIHByZXZpb3VzIHJlbmRlciB3YXMgb2YgYW5cbiAgICAgICAgLy8gaXRlcmFibGUgYW5kIF92YWx1ZSB3aWxsIGNvbnRhaW4gdGhlIE5vZGVQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyByZW5kZXIuIElmIF92YWx1ZSBpcyBub3QgYW4gYXJyYXksIGNsZWFyIHRoaXMgcGFydCBhbmQgbWFrZSBhIG5ld1xuICAgICAgICAvLyBhcnJheSBmb3IgTm9kZVBhcnRzLlxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMZXRzIHVzIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgaXRlbXMgd2Ugc3RhbXBlZCBzbyB3ZSBjYW4gY2xlYXIgbGVmdG92ZXJcbiAgICAgICAgLy8gaXRlbXMgZnJvbSBhIHByZXZpb3VzIHJlbmRlclxuICAgICAgICBjb25zdCBpdGVtUGFydHMgPSB0aGlzLnZhbHVlO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IGl0ZW1QYXJ0O1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byByZXVzZSBhbiBleGlzdGluZyBwYXJ0XG4gICAgICAgICAgICBpdGVtUGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgLy8gSWYgbm8gZXhpc3RpbmcgcGFydCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgICAgaWYgKGl0ZW1QYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpdGVtUGFydCA9IG5ldyBOb2RlUGFydCh0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0cy5wdXNoKGl0ZW1QYXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAocGFydEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1QYXJ0LmFwcGVuZEludG9QYXJ0KHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuaW5zZXJ0QWZ0ZXJQYXJ0KGl0ZW1QYXJ0c1twYXJ0SW5kZXggLSAxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbVBhcnQuc2V0VmFsdWUoaXRlbSk7XG4gICAgICAgICAgICBpdGVtUGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBUcnVuY2F0ZSB0aGUgcGFydHMgYXJyYXkgc28gX3ZhbHVlIHJlZmxlY3RzIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICAgICAgICBpdGVtUGFydHMubGVuZ3RoID0gcGFydEluZGV4O1xuICAgICAgICAgICAgdGhpcy5jbGVhcihpdGVtUGFydCAmJiBpdGVtUGFydC5lbmROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhcihzdGFydE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSkge1xuICAgICAgICByZW1vdmVOb2Rlcyh0aGlzLnN0YXJ0Tm9kZS5wYXJlbnROb2RlLCBzdGFydE5vZGUubmV4dFNpYmxpbmcsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxufVxuLyoqXG4gKiBJbXBsZW1lbnRzIGEgYm9vbGVhbiBhdHRyaWJ1dGUsIHJvdWdobHkgYXMgZGVmaW5lZCBpbiB0aGUgSFRNTFxuICogc3BlY2lmaWNhdGlvbi5cbiAqXG4gKiBJZiB0aGUgdmFsdWUgaXMgdHJ1dGh5LCB0aGVuIHRoZSBhdHRyaWJ1dGUgaXMgcHJlc2VudCB3aXRoIGEgdmFsdWUgb2ZcbiAqICcnLiBJZiB0aGUgdmFsdWUgaXMgZmFsc2V5LCB0aGUgYXR0cmlidXRlIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb29sZWFuQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoc3RyaW5ncy5sZW5ndGggIT09IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm9vbGVhbiBhdHRyaWJ1dGVzIGNhbiBvbmx5IGNvbnRhaW4gYSBzaW5nbGUgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX19wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSAhIXRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgfVxufVxuLyoqXG4gKiBTZXRzIGF0dHJpYnV0ZSB2YWx1ZXMgZm9yIFByb3BlcnR5UGFydHMsIHNvIHRoYXQgdGhlIHZhbHVlIGlzIG9ubHkgc2V0IG9uY2VcbiAqIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzIGZvciBhIHByb3BlcnR5LlxuICpcbiAqIElmIGFuIGV4cHJlc3Npb24gY29udHJvbHMgdGhlIHdob2xlIHByb3BlcnR5IHZhbHVlLCB0aGVuIHRoZSB2YWx1ZSBpcyBzaW1wbHlcbiAqIGFzc2lnbmVkIHRvIHRoZSBwcm9wZXJ0eSB1bmRlciBjb250cm9sLiBJZiB0aGVyZSBhcmUgc3RyaW5nIGxpdGVyYWxzIG9yXG4gKiBtdWx0aXBsZSBleHByZXNzaW9ucywgdGhlbiB0aGUgc3RyaW5ncyBhcmUgZXhwcmVzc2lvbnMgYXJlIGludGVycG9sYXRlZCBpbnRvXG4gKiBhIHN0cmluZyBmaXJzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3BlcnR5Q29tbWl0dGVyIGV4dGVuZHMgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICB0aGlzLnNpbmdsZSA9XG4gICAgICAgICAgICAoc3RyaW5ncy5sZW5ndGggPT09IDIgJiYgc3RyaW5nc1swXSA9PT0gJycgJiYgc3RyaW5nc1sxXSA9PT0gJycpO1xuICAgIH1cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVBhcnQodGhpcyk7XG4gICAgfVxuICAgIF9nZXRWYWx1ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2luZ2xlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJ0c1swXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFZhbHVlKCk7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRbdGhpcy5uYW1lXSA9IHRoaXMuX2dldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUHJvcGVydHlQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG59XG4vLyBEZXRlY3QgZXZlbnQgbGlzdGVuZXIgb3B0aW9ucyBzdXBwb3J0LiBJZiB0aGUgYGNhcHR1cmVgIHByb3BlcnR5IGlzIHJlYWRcbi8vIGZyb20gdGhlIG9wdGlvbnMgb2JqZWN0LCB0aGVuIG9wdGlvbnMgYXJlIHN1cHBvcnRlZC4gSWYgbm90LCB0aGVuIHRoZSB0aGlyZFxuLy8gYXJndW1lbnQgdG8gYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIgaXMgaW50ZXJwcmV0ZWQgYXMgdGhlIGJvb2xlYW4gY2FwdHVyZVxuLy8gdmFsdWUgc28gd2Ugc2hvdWxkIG9ubHkgcGFzcyB0aGUgYGNhcHR1cmVgIHByb3BlcnR5LlxubGV0IGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA9IGZhbHNlO1xuLy8gV3JhcCBpbnRvIGFuIElJRkUgYmVjYXVzZSBNUyBFZGdlIDw9IHY0MSBkb2VzIG5vdCBzdXBwb3J0IGhhdmluZyB0cnkvY2F0Y2hcbi8vIGJsb2NrcyByaWdodCBpbnRvIHRoZSBib2R5IG9mIGEgbW9kdWxlXG4oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBnZXQgY2FwdHVyZSgpIHtcbiAgICAgICAgICAgICAgICBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbiAgICB9XG4gICAgY2F0Y2ggKF9lKSB7XG4gICAgICAgIC8vIGV2ZW50IG9wdGlvbnMgbm90IHN1cHBvcnRlZFxuICAgIH1cbn0pKCk7XG5leHBvcnQgY2xhc3MgRXZlbnRQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBldmVudE5hbWUsIGV2ZW50Q29udGV4dCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5ldmVudENvbnRleHQgPSBldmVudENvbnRleHQ7XG4gICAgICAgIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50ID0gKGUpID0+IHRoaXMuaGFuZGxlRXZlbnQoZSk7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX19wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3TGlzdGVuZXIgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBjb25zdCBvbGRMaXN0ZW5lciA9IHRoaXMudmFsdWU7XG4gICAgICAgIGNvbnN0IHNob3VsZFJlbW92ZUxpc3RlbmVyID0gbmV3TGlzdGVuZXIgPT0gbnVsbCB8fFxuICAgICAgICAgICAgb2xkTGlzdGVuZXIgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIChuZXdMaXN0ZW5lci5jYXB0dXJlICE9PSBvbGRMaXN0ZW5lci5jYXB0dXJlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLm9uY2UgIT09IG9sZExpc3RlbmVyLm9uY2UgfHxcbiAgICAgICAgICAgICAgICAgICAgbmV3TGlzdGVuZXIucGFzc2l2ZSAhPT0gb2xkTGlzdGVuZXIucGFzc2l2ZSk7XG4gICAgICAgIGNvbnN0IHNob3VsZEFkZExpc3RlbmVyID0gbmV3TGlzdGVuZXIgIT0gbnVsbCAmJiAob2xkTGlzdGVuZXIgPT0gbnVsbCB8fCBzaG91bGRSZW1vdmVMaXN0ZW5lcik7XG4gICAgICAgIGlmIChzaG91bGRSZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudE5hbWUsIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNob3VsZEFkZExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9fb3B0aW9ucyA9IGdldE9wdGlvbnMobmV3TGlzdGVuZXIpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5ldmVudE5hbWUsIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IG5ld0xpc3RlbmVyO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgfVxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS5jYWxsKHRoaXMuZXZlbnRDb250ZXh0IHx8IHRoaXMuZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS5oYW5kbGVFdmVudChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBXZSBjb3B5IG9wdGlvbnMgYmVjYXVzZSBvZiB0aGUgaW5jb25zaXN0ZW50IGJlaGF2aW9yIG9mIGJyb3dzZXJzIHdoZW4gcmVhZGluZ1xuLy8gdGhlIHRoaXJkIGFyZ3VtZW50IG9mIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyLiBJRTExIGRvZXNuJ3Qgc3VwcG9ydCBvcHRpb25zXG4vLyBhdCBhbGwuIENocm9tZSA0MSBvbmx5IHJlYWRzIGBjYXB0dXJlYCBpZiB0aGUgYXJndW1lbnQgaXMgYW4gb2JqZWN0LlxuY29uc3QgZ2V0T3B0aW9ucyA9IChvKSA9PiBvICYmXG4gICAgKGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA/XG4gICAgICAgIHsgY2FwdHVyZTogby5jYXB0dXJlLCBwYXNzaXZlOiBvLnBhc3NpdmUsIG9uY2U6IG8ub25jZSB9IDpcbiAgICAgICAgby5jYXB0dXJlKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnRzLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IEF0dHJpYnV0ZUNvbW1pdHRlciwgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsIEV2ZW50UGFydCwgTm9kZVBhcnQsIFByb3BlcnR5Q29tbWl0dGVyIH0gZnJvbSAnLi9wYXJ0cy5qcyc7XG4vKipcbiAqIENyZWF0ZXMgUGFydHMgd2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhcnRzIGZvciBhbiBhdHRyaWJ1dGUtcG9zaXRpb24gYmluZGluZywgZ2l2ZW4gdGhlIGV2ZW50LCBhdHRyaWJ1dGVcbiAgICAgKiBuYW1lLCBhbmQgc3RyaW5nIGxpdGVyYWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYmluZGluZ1xuICAgICAqIEBwYXJhbSBuYW1lICBUaGUgYXR0cmlidXRlIG5hbWVcbiAgICAgKiBAcGFyYW0gc3RyaW5ncyBUaGUgc3RyaW5nIGxpdGVyYWxzLiBUaGVyZSBhcmUgYWx3YXlzIGF0IGxlYXN0IHR3byBzdHJpbmdzLFxuICAgICAqICAgZXZlbnQgZm9yIGZ1bGx5LWNvbnRyb2xsZWQgYmluZGluZ3Mgd2l0aCBhIHNpbmdsZSBleHByZXNzaW9uLlxuICAgICAqL1xuICAgIGhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gbmFtZVswXTtcbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBjb25zdCBjb21taXR0ZXIgPSBuZXcgUHJvcGVydHlDb21taXR0ZXIoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyk7XG4gICAgICAgICAgICByZXR1cm4gY29tbWl0dGVyLnBhcnRzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICdAJykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgRXZlbnRQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIG9wdGlvbnMuZXZlbnRDb250ZXh0KV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJz8nKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBCb29sZWFuQXR0cmlidXRlUGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBzdHJpbmdzKV07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tbWl0dGVyID0gbmV3IEF0dHJpYnV0ZUNvbW1pdHRlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKTtcbiAgICAgICAgcmV0dXJuIGNvbW1pdHRlci5wYXJ0cztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhcnRzIGZvciBhIHRleHQtcG9zaXRpb24gYmluZGluZy5cbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVGYWN0b3J5XG4gICAgICovXG4gICAgaGFuZGxlVGV4dEV4cHJlc3Npb24ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGVQYXJ0KG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgPSBuZXcgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBtYXJrZXIsIFRlbXBsYXRlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIFRoZSBkZWZhdWx0IFRlbXBsYXRlRmFjdG9yeSB3aGljaCBjYWNoZXMgVGVtcGxhdGVzIGtleWVkIG9uXG4gKiByZXN1bHQudHlwZSBhbmQgcmVzdWx0LnN0cmluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUZhY3RvcnkocmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlQ2FjaGUgPSB0ZW1wbGF0ZUNhY2hlcy5nZXQocmVzdWx0LnR5cGUpO1xuICAgIGlmICh0ZW1wbGF0ZUNhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGVtcGxhdGVDYWNoZSA9IHtcbiAgICAgICAgICAgIHN0cmluZ3NBcnJheTogbmV3IFdlYWtNYXAoKSxcbiAgICAgICAgICAgIGtleVN0cmluZzogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgICAgIHRlbXBsYXRlQ2FjaGVzLnNldChyZXN1bHQudHlwZSwgdGVtcGxhdGVDYWNoZSk7XG4gICAgfVxuICAgIGxldCB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUuc3RyaW5nc0FycmF5LmdldChyZXN1bHQuc3RyaW5ncyk7XG4gICAgaWYgKHRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgVGVtcGxhdGVTdHJpbmdzQXJyYXkgaXMgbmV3LCBnZW5lcmF0ZSBhIGtleSBmcm9tIHRoZSBzdHJpbmdzXG4gICAgLy8gVGhpcyBrZXkgaXMgc2hhcmVkIGJldHdlZW4gYWxsIHRlbXBsYXRlcyB3aXRoIGlkZW50aWNhbCBjb250ZW50XG4gICAgY29uc3Qga2V5ID0gcmVzdWx0LnN0cmluZ3Muam9pbihtYXJrZXIpO1xuICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgaGF2ZSBhIFRlbXBsYXRlIGZvciB0aGlzIGtleVxuICAgIHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuZ2V0KGtleSk7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBub3Qgc2VlbiB0aGlzIGtleSBiZWZvcmUsIGNyZWF0ZSBhIG5ldyBUZW1wbGF0ZVxuICAgICAgICB0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZShyZXN1bHQsIHJlc3VsdC5nZXRUZW1wbGF0ZUVsZW1lbnQoKSk7XG4gICAgICAgIC8vIENhY2hlIHRoZSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICAgICAgdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuc2V0KGtleSwgdGVtcGxhdGUpO1xuICAgIH1cbiAgICAvLyBDYWNoZSBhbGwgZnV0dXJlIHF1ZXJpZXMgZm9yIHRoaXMgVGVtcGxhdGVTdHJpbmdzQXJyYXlcbiAgICB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5zZXQocmVzdWx0LnN0cmluZ3MsIHRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG59XG5leHBvcnQgY29uc3QgdGVtcGxhdGVDYWNoZXMgPSBuZXcgTWFwKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1mYWN0b3J5LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgTm9kZVBhcnQgfSBmcm9tICcuL3BhcnRzLmpzJztcbmltcG9ydCB7IHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vdGVtcGxhdGUtZmFjdG9yeS5qcyc7XG5leHBvcnQgY29uc3QgcGFydHMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBSZW5kZXJzIGEgdGVtcGxhdGUgcmVzdWx0IG9yIG90aGVyIHZhbHVlIHRvIGEgY29udGFpbmVyLlxuICpcbiAqIFRvIHVwZGF0ZSBhIGNvbnRhaW5lciB3aXRoIG5ldyB2YWx1ZXMsIHJlZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGxpdGVyYWwgYW5kXG4gKiBjYWxsIGByZW5kZXJgIHdpdGggdGhlIG5ldyByZXN1bHQuXG4gKlxuICogQHBhcmFtIHJlc3VsdCBBbnkgdmFsdWUgcmVuZGVyYWJsZSBieSBOb2RlUGFydCAtIHR5cGljYWxseSBhIFRlbXBsYXRlUmVzdWx0XG4gKiAgICAgY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnIGxpa2UgYGh0bWxgIG9yIGBzdmdgLlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBwYXJlbnQgdG8gcmVuZGVyIHRvLiBUaGUgZW50aXJlIGNvbnRlbnRzIGFyZSBlaXRoZXJcbiAqICAgICByZXBsYWNlZCwgb3IgZWZmaWNpZW50bHkgdXBkYXRlZCBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXMgcHJldmlvdXNcbiAqICAgICByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFJlbmRlck9wdGlvbnMgZm9yIHRoZSBlbnRpcmUgcmVuZGVyIHRyZWUgcmVuZGVyZWQgdG8gdGhpc1xuICogICAgIGNvbnRhaW5lci4gUmVuZGVyIG9wdGlvbnMgbXVzdCAqbm90KiBjaGFuZ2UgYmV0d2VlbiByZW5kZXJzIHRvIHRoZSBzYW1lXG4gKiAgICAgY29udGFpbmVyLCBhcyB0aG9zZSBjaGFuZ2VzIHdpbGwgbm90IGVmZmVjdCBwcmV2aW91c2x5IHJlbmRlcmVkIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChyZXN1bHQsIGNvbnRhaW5lciwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBwYXJ0ID0gcGFydHMuZ2V0KGNvbnRhaW5lcik7XG4gICAgaWYgKHBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZW1vdmVOb2Rlcyhjb250YWluZXIsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgcGFydHMuc2V0KGNvbnRhaW5lciwgcGFydCA9IG5ldyBOb2RlUGFydChPYmplY3QuYXNzaWduKHsgdGVtcGxhdGVGYWN0b3J5IH0sIG9wdGlvbnMpKSk7XG4gICAgICAgIHBhcnQuYXBwZW5kSW50byhjb250YWluZXIpO1xuICAgIH1cbiAgICBwYXJ0LnNldFZhbHVlKHJlc3VsdCk7XG4gICAgcGFydC5jb21taXQoKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXIuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKlxuICogTWFpbiBsaXQtaHRtbCBtb2R1bGUuXG4gKlxuICogTWFpbiBleHBvcnRzOlxuICpcbiAqIC0gIFtbaHRtbF1dXG4gKiAtICBbW3N2Z11dXG4gKiAtICBbW3JlbmRlcl1dXG4gKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKi9cbi8qKlxuICogRG8gbm90IHJlbW92ZSB0aGlzIGNvbW1lbnQ7IGl0IGtlZXBzIHR5cGVkb2MgZnJvbSBtaXNwbGFjaW5nIHRoZSBtb2R1bGVcbiAqIGRvY3MuXG4gKi9cbmltcG9ydCB7IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmltcG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmV4cG9ydCB7IGRpcmVjdGl2ZSwgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2xpYi9kaXJlY3RpdmUuanMnO1xuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogcmVtb3ZlIGxpbmUgd2hlbiB3ZSBnZXQgTm9kZVBhcnQgbW92aW5nIG1ldGhvZHNcbmV4cG9ydCB7IHJlbW92ZU5vZGVzLCByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9saWIvZG9tLmpzJztcbmV4cG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9saWIvcGFydC5qcyc7XG5leHBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEF0dHJpYnV0ZVBhcnQsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIGlzSXRlcmFibGUsIGlzUHJpbWl0aXZlLCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIsIFByb3BlcnR5UGFydCB9IGZyb20gJy4vbGliL3BhcnRzLmpzJztcbmV4cG9ydCB7IHBhcnRzLCByZW5kZXIgfSBmcm9tICcuL2xpYi9yZW5kZXIuanMnO1xuZXhwb3J0IHsgdGVtcGxhdGVDYWNoZXMsIHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmV4cG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBjcmVhdGVNYXJrZXIsIGlzVGVtcGxhdGVQYXJ0QWN0aXZlLCBUZW1wbGF0ZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLmpzJztcbi8vIElNUE9SVEFOVDogZG8gbm90IGNoYW5nZSB0aGUgcHJvcGVydHkgbmFtZSBvciB0aGUgYXNzaWdubWVudCBleHByZXNzaW9uLlxuLy8gVGhpcyBsaW5lIHdpbGwgYmUgdXNlZCBpbiByZWdleGVzIHRvIHNlYXJjaCBmb3IgbGl0LWh0bWwgdXNhZ2UuXG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBpbmplY3QgdmVyc2lvbiBudW1iZXIgYXQgYnVpbGQgdGltZVxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gfHwgKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gPSBbXSkpLnB1c2goJzEuMy4wJyk7XG59XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdodG1sJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gU1ZHIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBTVkdUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdzdmcnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGl0LWh0bWwuanMubWFwIiwibGV0IGN1cnJlbnQ7XG5sZXQgY3VycmVudElkID0gMDtcbmZ1bmN0aW9uIHNldEN1cnJlbnQoc3RhdGUpIHtcbiAgICBjdXJyZW50ID0gc3RhdGU7XG59XG5mdW5jdGlvbiBjbGVhcigpIHtcbiAgICBjdXJyZW50ID0gbnVsbDtcbiAgICBjdXJyZW50SWQgPSAwO1xufVxuZnVuY3Rpb24gbm90aWZ5KCkge1xuICAgIHJldHVybiBjdXJyZW50SWQrKztcbn1cbmV4cG9ydCB7IGNsZWFyLCBjdXJyZW50LCBzZXRDdXJyZW50LCBub3RpZnkgfTtcbiIsImNvbnN0IHBoYXNlU3ltYm9sID0gU3ltYm9sKCdoYXVudGVkLnBoYXNlJyk7XG5jb25zdCBob29rU3ltYm9sID0gU3ltYm9sKCdoYXVudGVkLmhvb2snKTtcbmNvbnN0IHVwZGF0ZVN5bWJvbCA9IFN5bWJvbCgnaGF1bnRlZC51cGRhdGUnKTtcbmNvbnN0IGNvbW1pdFN5bWJvbCA9IFN5bWJvbCgnaGF1bnRlZC5jb21taXQnKTtcbmNvbnN0IGVmZmVjdHNTeW1ib2wgPSBTeW1ib2woJ2hhdW50ZWQuZWZmZWN0cycpO1xuY29uc3QgbGF5b3V0RWZmZWN0c1N5bWJvbCA9IFN5bWJvbCgnaGF1bnRlZC5sYXlvdXRFZmZlY3RzJyk7XG5jb25zdCBjb250ZXh0RXZlbnQgPSAnaGF1bnRlZC5jb250ZXh0JztcbmV4cG9ydCB7IHBoYXNlU3ltYm9sLCBob29rU3ltYm9sLCB1cGRhdGVTeW1ib2wsIGNvbW1pdFN5bWJvbCwgZWZmZWN0c1N5bWJvbCwgbGF5b3V0RWZmZWN0c1N5bWJvbCwgY29udGV4dEV2ZW50LCB9O1xuIiwiaW1wb3J0IHsgc2V0Q3VycmVudCwgY2xlYXIgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBob29rU3ltYm9sLCBlZmZlY3RzU3ltYm9sLCBsYXlvdXRFZmZlY3RzU3ltYm9sIH0gZnJvbSAnLi9zeW1ib2xzJztcbmNsYXNzIFN0YXRlIHtcbiAgICBjb25zdHJ1Y3Rvcih1cGRhdGUsIGhvc3QpIHtcbiAgICAgICAgdGhpcy51cGRhdGUgPSB1cGRhdGU7XG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3Q7XG4gICAgICAgIHRoaXNbaG9va1N5bWJvbF0gPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXNbZWZmZWN0c1N5bWJvbF0gPSBbXTtcbiAgICAgICAgdGhpc1tsYXlvdXRFZmZlY3RzU3ltYm9sXSA9IFtdO1xuICAgIH1cbiAgICBydW4oY2IpIHtcbiAgICAgICAgc2V0Q3VycmVudCh0aGlzKTtcbiAgICAgICAgbGV0IHJlcyA9IGNiKCk7XG4gICAgICAgIGNsZWFyKCk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIF9ydW5FZmZlY3RzKHBoYXNlKSB7XG4gICAgICAgIGxldCBlZmZlY3RzID0gdGhpc1twaGFzZV07XG4gICAgICAgIHNldEN1cnJlbnQodGhpcyk7XG4gICAgICAgIGZvciAobGV0IGVmZmVjdCBvZiBlZmZlY3RzKSB7XG4gICAgICAgICAgICBlZmZlY3QuY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjbGVhcigpO1xuICAgIH1cbiAgICBydW5FZmZlY3RzKCkge1xuICAgICAgICB0aGlzLl9ydW5FZmZlY3RzKGVmZmVjdHNTeW1ib2wpO1xuICAgIH1cbiAgICBydW5MYXlvdXRFZmZlY3RzKCkge1xuICAgICAgICB0aGlzLl9ydW5FZmZlY3RzKGxheW91dEVmZmVjdHNTeW1ib2wpO1xuICAgIH1cbiAgICB0ZWFyZG93bigpIHtcbiAgICAgICAgbGV0IGhvb2tzID0gdGhpc1tob29rU3ltYm9sXTtcbiAgICAgICAgaG9va3MuZm9yRWFjaChob29rID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaG9vay50ZWFyZG93biA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGhvb2sudGVhcmRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IHsgU3RhdGUgfTtcbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQgeyBjb21taXRTeW1ib2wsIHBoYXNlU3ltYm9sLCB1cGRhdGVTeW1ib2wsIGVmZmVjdHNTeW1ib2wsIGxheW91dEVmZmVjdHNTeW1ib2wgfSBmcm9tICcuL3N5bWJvbHMnO1xuY29uc3QgZGVmZXIgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpO1xuZnVuY3Rpb24gcnVubmVyKCkge1xuICAgIGxldCB0YXNrcyA9IFtdO1xuICAgIGxldCBpZDtcbiAgICBmdW5jdGlvbiBydW5UYXNrcygpIHtcbiAgICAgICAgaWQgPSBudWxsO1xuICAgICAgICBsZXQgdCA9IHRhc2tzO1xuICAgICAgICB0YXNrcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdFtpXSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICB0YXNrcy5wdXNoKHRhc2spO1xuICAgICAgICBpZiAoaWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgaWQgPSBkZWZlcihydW5UYXNrcyk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuY29uc3QgcmVhZCA9IHJ1bm5lcigpO1xuY29uc3Qgd3JpdGUgPSBydW5uZXIoKTtcbmNsYXNzIEJhc2VTY2hlZHVsZXIge1xuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyLCBob3N0KSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdDtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IG5ldyBTdGF0ZSh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCBob3N0KTtcbiAgICAgICAgdGhpc1twaGFzZVN5bWJvbF0gPSBudWxsO1xuICAgICAgICB0aGlzLl91cGRhdGVRdWV1ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5fdXBkYXRlUXVldWVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByZWFkKCgpID0+IHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB0aGlzLmhhbmRsZVBoYXNlKHVwZGF0ZVN5bWJvbCk7XG4gICAgICAgICAgICB3cml0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVQaGFzZShjb21taXRTeW1ib2wsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgd3JpdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVBoYXNlKGVmZmVjdHNTeW1ib2wpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVRdWV1ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVF1ZXVlZCA9IHRydWU7XG4gICAgfVxuICAgIGhhbmRsZVBoYXNlKHBoYXNlLCBhcmcpIHtcbiAgICAgICAgdGhpc1twaGFzZVN5bWJvbF0gPSBwaGFzZTtcbiAgICAgICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICAgICAgY2FzZSBjb21taXRTeW1ib2w6XG4gICAgICAgICAgICAgICAgdGhpcy5jb21taXQoYXJnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bkVmZmVjdHMobGF5b3V0RWZmZWN0c1N5bWJvbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSB1cGRhdGVTeW1ib2w6IHJldHVybiB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgY2FzZSBlZmZlY3RzU3ltYm9sOiByZXR1cm4gdGhpcy5ydW5FZmZlY3RzKGVmZmVjdHNTeW1ib2wpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbcGhhc2VTeW1ib2xdID0gbnVsbDtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5ydW4oKCkgPT4gdGhpcy5yZW5kZXJlci5jYWxsKHRoaXMuaG9zdCwgdGhpcy5ob3N0KSk7XG4gICAgfVxuICAgIHJ1bkVmZmVjdHMocGhhc2UpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5fcnVuRWZmZWN0cyhwaGFzZSk7XG4gICAgfVxuICAgIHRlYXJkb3duKCkge1xuICAgICAgICB0aGlzLnN0YXRlLnRlYXJkb3duKCk7XG4gICAgfVxufVxuZXhwb3J0IHsgQmFzZVNjaGVkdWxlciB9O1xuIiwiaW1wb3J0IHsgQmFzZVNjaGVkdWxlciB9IGZyb20gJy4vc2NoZWR1bGVyJztcbmNvbnN0IHRvQ2FtZWxDYXNlID0gKHZhbCA9ICcnKSA9PiB2YWwucmVwbGFjZSgvLSsoW2Etel0pPy9nLCAoXywgY2hhcikgPT4gY2hhciA/IGNoYXIudG9VcHBlckNhc2UoKSA6ICcnKTtcbmZ1bmN0aW9uIG1ha2VDb21wb25lbnQocmVuZGVyKSB7XG4gICAgY2xhc3MgU2NoZWR1bGVyIGV4dGVuZHMgQmFzZVNjaGVkdWxlciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyLCBmcmFnLCBob3N0KSB7XG4gICAgICAgICAgICBzdXBlcihyZW5kZXJlciwgaG9zdCB8fCBmcmFnKTtcbiAgICAgICAgICAgIHRoaXMuZnJhZyA9IGZyYWc7XG4gICAgICAgIH1cbiAgICAgICAgY29tbWl0KHJlc3VsdCkge1xuICAgICAgICAgICAgcmVuZGVyKHJlc3VsdCwgdGhpcy5mcmFnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBjb21wb25lbnQocmVuZGVyZXIsIGJhc2VFbGVtZW50T3JPcHRpb25zLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IEJhc2VFbGVtZW50ID0gKG9wdGlvbnMgfHwgYmFzZUVsZW1lbnRPck9wdGlvbnMgfHwge30pLmJhc2VFbGVtZW50IHx8IEhUTUxFbGVtZW50O1xuICAgICAgICBjb25zdCB7IG9ic2VydmVkQXR0cmlidXRlcyA9IFtdLCB1c2VTaGFkb3dET00gPSB0cnVlLCBzaGFkb3dSb290SW5pdCA9IHt9IH0gPSBvcHRpb25zIHx8IGJhc2VFbGVtZW50T3JPcHRpb25zIHx8IHt9O1xuICAgICAgICBjbGFzcyBFbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnQge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgICAgICBpZiAodXNlU2hhZG93RE9NID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHJlbmRlcmVyLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nLCAuLi5zaGFkb3dSb290SW5pdCB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcihyZW5kZXJlciwgdGhpcy5zaGFkb3dSb290LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVuZGVyZXIub2JzZXJ2ZWRBdHRyaWJ1dGVzIHx8IG9ic2VydmVkQXR0cmlidXRlcyB8fCBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci51cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci50ZWFyZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgdmFsID0gbmV3VmFsdWUgPT09ICcnID8gdHJ1ZSA6IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgIFJlZmxlY3Quc2V0KHRoaXMsIHRvQ2FtZWxDYXNlKG5hbWUpLCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgZnVuY3Rpb24gcmVmbGVjdGl2ZVByb3AoaW5pdGlhbFZhbHVlKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBpbml0aWFsVmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3RvID0gbmV3IFByb3h5KEJhc2VFbGVtZW50LnByb3RvdHlwZSwge1xuICAgICAgICAgICAgZ2V0UHJvdG90eXBlT2YodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgICAgICAgIGxldCBkZXNjO1xuICAgICAgICAgICAgICAgIGlmIChrZXkgaW4gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MgJiYgZGVzYy5zZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2Muc2V0LmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3ltYm9sJyB8fCBrZXlbMF0gPT09ICdfJykge1xuICAgICAgICAgICAgICAgICAgICBkZXNjID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2MgPSByZWZsZWN0aXZlUHJvcCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZWNlaXZlciwga2V5LCBkZXNjKTtcbiAgICAgICAgICAgICAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5zZXQuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihFbGVtZW50LnByb3RvdHlwZSwgcHJvdG8pO1xuICAgICAgICByZXR1cm4gRWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbn1cbmV4cG9ydCB7IG1ha2VDb21wb25lbnQgfTtcbiIsImltcG9ydCB7IGN1cnJlbnQsIG5vdGlmeSB9IGZyb20gJy4vaW50ZXJmYWNlJztcbmltcG9ydCB7IGhvb2tTeW1ib2wgfSBmcm9tICcuL3N5bWJvbHMnO1xuY2xhc3MgSG9vayB7XG4gICAgY29uc3RydWN0b3IoaWQsIHN0YXRlKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVzZShIb29rLCAuLi5hcmdzKSB7XG4gICAgbGV0IGlkID0gbm90aWZ5KCk7XG4gICAgbGV0IGhvb2tzID0gY3VycmVudFtob29rU3ltYm9sXTtcbiAgICBsZXQgaG9vayA9IGhvb2tzLmdldChpZCk7XG4gICAgaWYgKCFob29rKSB7XG4gICAgICAgIGhvb2sgPSBuZXcgSG9vayhpZCwgY3VycmVudCwgLi4uYXJncyk7XG4gICAgICAgIGhvb2tzLnNldChpZCwgaG9vayk7XG4gICAgfVxuICAgIHJldHVybiBob29rLnVwZGF0ZSguLi5hcmdzKTtcbn1cbmZ1bmN0aW9uIGhvb2soSG9vaykge1xuICAgIHJldHVybiB1c2UuYmluZChudWxsLCBIb29rKTtcbn1cbmV4cG9ydCB7IGhvb2ssIEhvb2sgfTtcbiIsImltcG9ydCB7IEhvb2ssIGhvb2sgfSBmcm9tICcuL2hvb2snO1xuZnVuY3Rpb24gY3JlYXRlRWZmZWN0KHNldEVmZmVjdHMpIHtcbiAgICByZXR1cm4gaG9vayhjbGFzcyBleHRlbmRzIEhvb2sge1xuICAgICAgICBjb25zdHJ1Y3RvcihpZCwgc3RhdGUsIGlnbm9yZWQxLCBpZ25vcmVkMikge1xuICAgICAgICAgICAgc3VwZXIoaWQsIHN0YXRlKTtcbiAgICAgICAgICAgIHNldEVmZmVjdHMoc3RhdGUsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZShjYWxsYmFjaywgdmFsdWVzKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgICAgICB0aGlzLmxhc3RWYWx1ZXMgPSB0aGlzLnZhbHVlcztcbiAgICAgICAgICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIGNhbGwoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmFsdWVzIHx8IHRoaXMuaGFzQ2hhbmdlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBydW4oKSB7XG4gICAgICAgICAgICB0aGlzLnRlYXJkb3duKCk7XG4gICAgICAgICAgICB0aGlzLl90ZWFyZG93biA9IHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICB0ZWFyZG93bigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5fdGVhcmRvd24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90ZWFyZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGhhc0NoYW5nZWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMubGFzdFZhbHVlcyB8fCB0aGlzLnZhbHVlcy5zb21lKCh2YWx1ZSwgaSkgPT4gdGhpcy5sYXN0VmFsdWVzW2ldICE9PSB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydCB7IGNyZWF0ZUVmZmVjdCB9O1xuIiwiaW1wb3J0IHsgZWZmZWN0c1N5bWJvbCB9IGZyb20gJy4vc3ltYm9scyc7XG5pbXBvcnQgeyBjcmVhdGVFZmZlY3QgfSBmcm9tICcuL2NyZWF0ZS1lZmZlY3QnO1xuZnVuY3Rpb24gc2V0RWZmZWN0cyhzdGF0ZSwgY2IpIHtcbiAgICBzdGF0ZVtlZmZlY3RzU3ltYm9sXS5wdXNoKGNiKTtcbn1cbmNvbnN0IHVzZUVmZmVjdCA9IGNyZWF0ZUVmZmVjdChzZXRFZmZlY3RzKTtcbmV4cG9ydCB7IHNldEVmZmVjdHMsIHVzZUVmZmVjdCB9O1xuIiwiaW1wb3J0IHsgaG9vaywgSG9vayB9IGZyb20gJy4vaG9vayc7XG5pbXBvcnQgeyBjb250ZXh0RXZlbnQgfSBmcm9tICcuL3N5bWJvbHMnO1xuaW1wb3J0IHsgc2V0RWZmZWN0cyB9IGZyb20gJy4vdXNlLWVmZmVjdCc7XG5jb25zdCB1c2VDb250ZXh0ID0gaG9vayhjbGFzcyBleHRlbmRzIEhvb2sge1xuICAgIGNvbnN0cnVjdG9yKGlkLCBzdGF0ZSwgXykge1xuICAgICAgICBzdXBlcihpZCwgc3RhdGUpO1xuICAgICAgICB0aGlzLl91cGRhdGVyID0gdGhpcy5fdXBkYXRlci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9yYW5FZmZlY3QgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdW5zdWJzY3JpYmUgPSBudWxsO1xuICAgICAgICBzZXRFZmZlY3RzKHN0YXRlLCB0aGlzKTtcbiAgICB9XG4gICAgdXBkYXRlKENvbnRleHQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmlydHVhbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYW5cXCd0IGJlIHVzZWQgd2l0aCB2aXJ0dWFsIGNvbXBvbmVudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5Db250ZXh0ICE9PSBDb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmUoQ29udGV4dCk7XG4gICAgICAgICAgICB0aGlzLkNvbnRleHQgPSBDb250ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgICBjYWxsKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3JhbkVmZmVjdCkge1xuICAgICAgICAgICAgdGhpcy5fcmFuRWZmZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICB0aGlzLl91bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgdGhpcy5fc3Vic2NyaWJlKHRoaXMuQ29udGV4dCk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF91cGRhdGVyKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zdGF0ZS51cGRhdGUoKTtcbiAgICB9XG4gICAgX3N1YnNjcmliZShDb250ZXh0KSB7XG4gICAgICAgIGNvbnN0IGRldGFpbCA9IHsgQ29udGV4dCwgY2FsbGJhY2s6IHRoaXMuX3VwZGF0ZXIgfTtcbiAgICAgICAgdGhpcy5zdGF0ZS5ob3N0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGNvbnRleHRFdmVudCwge1xuICAgICAgICAgICAgZGV0YWlsLFxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgfSkpO1xuICAgICAgICBjb25zdCB7IHVuc3Vic2NyaWJlLCB2YWx1ZSB9ID0gZGV0YWlsO1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5zdWJzY3JpYmUgPyB2YWx1ZSA6IENvbnRleHQuZGVmYXVsdFZhbHVlO1xuICAgICAgICB0aGlzLl91bnN1YnNjcmliZSA9IHVuc3Vic2NyaWJlO1xuICAgIH1cbiAgICB0ZWFyZG93bigpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Vuc3Vic2NyaWJlKSB7XG4gICAgICAgICAgICB0aGlzLl91bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5leHBvcnQgeyB1c2VDb250ZXh0IH07XG4iLCJpbXBvcnQgeyBjb250ZXh0RXZlbnQgfSBmcm9tICcuL3N5bWJvbHMnO1xuaW1wb3J0IHsgdXNlQ29udGV4dCB9IGZyb20gJy4vdXNlLWNvbnRleHQnO1xuZnVuY3Rpb24gbWFrZUNvbnRleHQoY29tcG9uZW50KSB7XG4gICAgcmV0dXJuIChkZWZhdWx0VmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgQ29udGV4dCA9IHtcbiAgICAgICAgICAgIFByb3ZpZGVyOiBjbGFzcyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihjb250ZXh0RXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGNvbnRleHRFdmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZGV0YWlsIH0gPSBldmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRldGFpbC5Db250ZXh0ID09PSBDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWwudmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsLnVuc3Vic2NyaWJlID0gdGhpcy51bnN1YnNjcmliZS5iaW5kKHRoaXMsIGRldGFpbC5jYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbmVycy5hZGQoZGV0YWlsLmNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLmxpc3RlbmVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBDb25zdW1lcjogY29tcG9uZW50KGZ1bmN0aW9uICh7IHJlbmRlciB9KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbmRlcihjb250ZXh0KTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gQ29udGV4dDtcbiAgICB9O1xufVxuZXhwb3J0IHsgbWFrZUNvbnRleHQgfTtcbiIsImltcG9ydCB7IGhvb2ssIEhvb2sgfSBmcm9tICcuL2hvb2snO1xuY29uc3QgdXNlTWVtbyA9IGhvb2soY2xhc3MgZXh0ZW5kcyBIb29rIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgc3RhdGUsIGZuLCB2YWx1ZXMpIHtcbiAgICAgICAgc3VwZXIoaWQsIHN0YXRlKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IGZuKCk7XG4gICAgICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgIH1cbiAgICB1cGRhdGUoZm4sIHZhbHVlcykge1xuICAgICAgICBpZiAodGhpcy5oYXNDaGFuZ2VkKHZhbHVlcykpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGZuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICAgIGhhc0NoYW5nZWQodmFsdWVzID0gW10pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcy5zb21lKCh2YWx1ZSwgaSkgPT4gdGhpcy52YWx1ZXNbaV0gIT09IHZhbHVlKTtcbiAgICB9XG59KTtcbmV4cG9ydCB7IHVzZU1lbW8gfTtcbiIsImltcG9ydCB7IHVzZU1lbW8gfSBmcm9tICcuL3VzZS1tZW1vJztcbmNvbnN0IHVzZUNhbGxiYWNrID0gKGZuLCBpbnB1dHMpID0+IHVzZU1lbW8oKCkgPT4gZm4sIGlucHV0cyk7XG5leHBvcnQgeyB1c2VDYWxsYmFjayB9O1xuIiwiaW1wb3J0IHsgbGF5b3V0RWZmZWN0c1N5bWJvbCB9IGZyb20gJy4vc3ltYm9scyc7XG5pbXBvcnQgeyBjcmVhdGVFZmZlY3QgfSBmcm9tICcuL2NyZWF0ZS1lZmZlY3QnO1xuZnVuY3Rpb24gc2V0TGF5b3V0RWZmZWN0cyhzdGF0ZSwgY2IpIHtcbiAgICBzdGF0ZVtsYXlvdXRFZmZlY3RzU3ltYm9sXS5wdXNoKGNiKTtcbn1cbmNvbnN0IHVzZUxheW91dEVmZmVjdCA9IGNyZWF0ZUVmZmVjdChzZXRMYXlvdXRFZmZlY3RzKTtcbmV4cG9ydCB7IHVzZUxheW91dEVmZmVjdCB9O1xuIiwiaW1wb3J0IHsgaG9vaywgSG9vayB9IGZyb20gJy4vaG9vayc7XG5jb25zdCB1c2VTdGF0ZSA9IGhvb2soY2xhc3MgZXh0ZW5kcyBIb29rIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgc3RhdGUsIGluaXRpYWxWYWx1ZSkge1xuICAgICAgICBzdXBlcihpZCwgc3RhdGUpO1xuICAgICAgICB0aGlzLnVwZGF0ZXIgPSB0aGlzLnVwZGF0ZXIuYmluZCh0aGlzKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpbml0aWFsVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZSA9IGluaXRpYWxWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFrZUFyZ3MoaW5pdGlhbFZhbHVlKTtcbiAgICB9XG4gICAgdXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcmdzO1xuICAgIH1cbiAgICB1cGRhdGVyKHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZXJGbiA9IHZhbHVlO1xuICAgICAgICAgICAgY29uc3QgW3ByZXZpb3VzVmFsdWVdID0gdGhpcy5hcmdzO1xuICAgICAgICAgICAgdmFsdWUgPSB1cGRhdGVyRm4ocHJldmlvdXNWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYWtlQXJncyh2YWx1ZSk7XG4gICAgICAgIHRoaXMuc3RhdGUudXBkYXRlKCk7XG4gICAgfVxuICAgIG1ha2VBcmdzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYXJncyA9IE9iamVjdC5mcmVlemUoW3ZhbHVlLCB0aGlzLnVwZGF0ZXJdKTtcbiAgICB9XG59KTtcbmV4cG9ydCB7IHVzZVN0YXRlIH07XG4iLCJpbXBvcnQgeyBob29rLCBIb29rIH0gZnJvbSAnLi9ob29rJztcbmNvbnN0IHVzZVJlZHVjZXIgPSBob29rKGNsYXNzIGV4dGVuZHMgSG9vayB7XG4gICAgY29uc3RydWN0b3IoaWQsIHN0YXRlLCBfLCBpbml0aWFsU3RhdGUsIGluaXQpIHtcbiAgICAgICAgc3VwZXIoaWQsIHN0YXRlKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaCA9IHRoaXMuZGlzcGF0Y2guYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSBpbml0ICE9PSB1bmRlZmluZWQgPyBpbml0KGluaXRpYWxTdGF0ZSkgOiBpbml0aWFsU3RhdGU7XG4gICAgfVxuICAgIHVwZGF0ZShyZWR1Y2VyKSB7XG4gICAgICAgIHRoaXMucmVkdWNlciA9IHJlZHVjZXI7XG4gICAgICAgIHJldHVybiBbdGhpcy5jdXJyZW50U3RhdGUsIHRoaXMuZGlzcGF0Y2hdO1xuICAgIH1cbiAgICBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSB0aGlzLnJlZHVjZXIodGhpcy5jdXJyZW50U3RhdGUsIGFjdGlvbik7XG4gICAgICAgIHRoaXMuc3RhdGUudXBkYXRlKCk7XG4gICAgfVxufSk7XG5leHBvcnQgeyB1c2VSZWR1Y2VyIH07XG4iLCJpbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAnLi91c2UtbWVtbyc7XG5jb25zdCB1c2VSZWYgPSAoaW5pdGlhbFZhbHVlKSA9PiB1c2VNZW1vKCgpID0+ICh7XG4gICAgY3VycmVudDogaW5pdGlhbFZhbHVlXG59KSwgW10pO1xuZXhwb3J0IHsgdXNlUmVmIH07XG4iLCJpbXBvcnQgeyBtYWtlQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgbWFrZUNvbnRleHQgfSBmcm9tICcuL2NyZWF0ZS1jb250ZXh0JztcbmZ1bmN0aW9uIGhhdW50ZWQoeyByZW5kZXIgfSkge1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IG1ha2VDb21wb25lbnQocmVuZGVyKTtcbiAgICBjb25zdCBjcmVhdGVDb250ZXh0ID0gbWFrZUNvbnRleHQoY29tcG9uZW50KTtcbiAgICByZXR1cm4geyBjb21wb25lbnQsIGNyZWF0ZUNvbnRleHQgfTtcbn1cbmV4cG9ydCB7IGhhdW50ZWQgYXMgZGVmYXVsdCB9O1xuZXhwb3J0IHsgdXNlQ2FsbGJhY2sgfSBmcm9tICcuL3VzZS1jYWxsYmFjayc7XG5leHBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICcuL3VzZS1lZmZlY3QnO1xuZXhwb3J0IHsgdXNlTGF5b3V0RWZmZWN0IH0gZnJvbSAnLi91c2UtbGF5b3V0LWVmZmVjdCc7XG5leHBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJy4vdXNlLXN0YXRlJztcbmV4cG9ydCB7IHVzZVJlZHVjZXIgfSBmcm9tICcuL3VzZS1yZWR1Y2VyJztcbmV4cG9ydCB7IHVzZU1lbW8gfSBmcm9tICcuL3VzZS1tZW1vJztcbmV4cG9ydCB7IHVzZUNvbnRleHQgfSBmcm9tICcuL3VzZS1jb250ZXh0JztcbmV4cG9ydCB7IHVzZVJlZiB9IGZyb20gJy4vdXNlLXJlZic7XG5leHBvcnQgeyBob29rLCBIb29rIH0gZnJvbSAnLi9ob29rJztcbmV4cG9ydCB7IEJhc2VTY2hlZHVsZXIgfSBmcm9tICcuL3NjaGVkdWxlcic7XG5leHBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnO1xuIiwiaW1wb3J0IHsgaHRtbCwgcmVuZGVyIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IGhhdW50ZWQgZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7IG1ha2VWaXJ0dWFsIH0gZnJvbSAnLi92aXJ0dWFsJztcbmNvbnN0IHsgY29tcG9uZW50LCBjcmVhdGVDb250ZXh0IH0gPSBoYXVudGVkKHsgcmVuZGVyIH0pO1xuY29uc3QgdmlydHVhbCA9IG1ha2VWaXJ0dWFsKCk7XG5leHBvcnQgeyBjb21wb25lbnQsIGNyZWF0ZUNvbnRleHQsIHZpcnR1YWwsIGh0bWwsIHJlbmRlciB9O1xuIiwiaW1wb3J0IHsgdXNlUmVmLCB1c2VDYWxsYmFjaywgdXNlRWZmZWN0LCB1c2VNZW1vIH0gZnJvbSAnaGF1bnRlZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWJvdW5jZWRDYWxsYmFjayhcbiAgZnVuYyxcbiAgcmF3V2FpdCxcbiAgb3B0aW9ucyA9IHsgbGVhZGluZzogZmFsc2UsIHRyYWlsaW5nOiB0cnVlIH1cbikge1xuICBjb25zdCBsYXN0Q2FsbFRpbWUgPSB1c2VSZWYodW5kZWZpbmVkKTtcbiAgY29uc3QgbGFzdEludm9rZVRpbWUgPSB1c2VSZWYoMCk7XG4gIGNvbnN0IHRpbWVySWQgPSB1c2VSZWYodW5kZWZpbmVkKTtcbiAgY29uc3QgbGFzdEFyZ3MgPSB1c2VSZWYoW10pO1xuICBjb25zdCBsYXN0VGhpcyA9IHVzZVJlZihudWxsKTtcbiAgY29uc3QgcmVzdWx0ID0gdXNlUmVmKG51bGwpO1xuICBjb25zdCBmdW5jUmVmID0gdXNlUmVmKGZ1bmMpO1xuICBjb25zdCBtb3VudGVkID0gdXNlUmVmKHRydWUpO1xuICBmdW5jUmVmLmN1cnJlbnQgPSBmdW5jO1xuXG4gIC8vIEJ5cGFzcyBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBieSBleHBsaWNpdGx5IHNldHRpbmcgYHdhaXQ9MGAuXG4gIGNvbnN0IHVzZVJBRiA9XG4gICAgIXJhd1dhaXQgJiZcbiAgICByYXdXYWl0ICE9PSAwICYmXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2Ygd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gJ2Z1bmN0aW9uJztcblxuICBpZiAodHlwZW9mIGZ1bmMgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgY29uc3Qgd2FpdCA9IE51bWJlcihyYXdXYWl0KSB8fCAwO1xuICBjb25zdCBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gIGNvbnN0IHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJ1ZTtcbiAgY29uc3QgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gIGNvbnN0IG1heFdhaXQgPSBtYXhpbmdcbiAgICA/IE1hdGgubWF4KE51bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpXG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgaW52b2tlRnVuYyA9IHVzZUNhbGxiYWNrKCh0aW1lKSA9PiB7XG4gICAgY29uc3QgYXJncyA9IGxhc3RBcmdzLmN1cnJlbnQ7XG4gICAgY29uc3QgdGhpc0FyZyA9IGxhc3RUaGlzLmN1cnJlbnQ7XG5cbiAgICBsYXN0VGhpcy5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGxhc3RBcmdzLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUuY3VycmVudCA9IHRpbWU7XG4gICAgcmVzdWx0LmN1cnJlbnQgPSBmdW5jUmVmLmN1cnJlbnQuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdC5jdXJyZW50O1xuICB9LCBbXSk7XG5cbiAgY29uc3Qgc3RhcnRUaW1lciA9IHVzZUNhbGxiYWNrKFxuICAgIChwZW5kaW5nRnVuYywgdGltZW91dCkgPT4ge1xuICAgICAgaWYgKHVzZVJBRikge1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGltZXJJZC5jdXJyZW50KTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGVuZGluZ0Z1bmMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQocGVuZGluZ0Z1bmMsIHRpbWVvdXQpO1xuICAgIH0sXG4gICAgW3VzZVJBRl1cbiAgKTtcblxuICBjb25zdCBjYW5jZWxUaW1lciA9IHVzZUNhbGxiYWNrKFxuICAgIChpZCkgPT4ge1xuICAgICAgaWYgKHVzZVJBRikge1xuICAgICAgICByZXR1cm4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKTtcbiAgICAgIH1cbiAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFt1c2VSQUZdXG4gICk7XG5cbiAgY29uc3QgcmVtYWluaW5nV2FpdCA9IHVzZUNhbGxiYWNrKFxuICAgICh0aW1lKSA9PiB7XG4gICAgICBjb25zdCB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUuY3VycmVudDtcbiAgICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUuY3VycmVudDtcbiAgICAgIGNvbnN0IHRpbWVXYWl0aW5nID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgICByZXR1cm4gbWF4aW5nXG4gICAgICAgID8gTWF0aC5taW4odGltZVdhaXRpbmcsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKVxuICAgICAgICA6IHRpbWVXYWl0aW5nO1xuICAgIH0sXG4gICAgW21heFdhaXQsIG1heGluZywgd2FpdF1cbiAgKTtcblxuICBjb25zdCBzaG91bGRJbnZva2UgPSB1c2VDYWxsYmFjayhcbiAgICAodGltZSkgPT4ge1xuICAgICAgaWYgKCFtb3VudGVkLmN1cnJlbnQpIHJldHVybiBmYWxzZTtcblxuICAgICAgY29uc3QgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLmN1cnJlbnQ7XG4gICAgICBjb25zdCB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLmN1cnJlbnQ7XG5cbiAgICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgbGFzdENhbGxUaW1lLmN1cnJlbnQgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICB0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0IHx8XG4gICAgICAgIHRpbWVTaW5jZUxhc3RDYWxsIDwgMCB8fFxuICAgICAgICAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdClcbiAgICAgICk7XG4gICAgfSxcbiAgICBbbWF4V2FpdCwgbWF4aW5nLCB3YWl0XVxuICApO1xuXG4gIGNvbnN0IHRyYWlsaW5nRWRnZSA9IHVzZUNhbGxiYWNrKFxuICAgICh0aW1lKSA9PiB7XG4gICAgICB0aW1lcklkLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzLmN1cnJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgICB9XG4gICAgICBsYXN0VGhpcy5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgbGFzdEFyZ3MuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiByZXN1bHQuY3VycmVudDtcbiAgICB9LFxuICAgIFtpbnZva2VGdW5jLCB0cmFpbGluZ11cbiAgKTtcblxuICBjb25zdCB0aW1lckV4cGlyZWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgdGltZSA9IERhdGUubm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZC5jdXJyZW50ID0gc3RhcnRUaW1lcih0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9LCBbcmVtYWluaW5nV2FpdCwgc2hvdWxkSW52b2tlLCBzdGFydFRpbWVyLCB0cmFpbGluZ0VkZ2VdKTtcblxuICBjb25zdCBsZWFkaW5nRWRnZSA9IHVzZUNhbGxiYWNrKFxuICAgICh0aW1lKSA9PiB7XG4gICAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgICAgbGFzdEludm9rZVRpbWUuY3VycmVudCA9IHRpbWU7XG4gICAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgICAgdGltZXJJZC5jdXJyZW50ID0gc3RhcnRUaW1lcih0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQuY3VycmVudDtcbiAgICB9LFxuICAgIFtpbnZva2VGdW5jLCBzdGFydFRpbWVyLCBsZWFkaW5nLCB0aW1lckV4cGlyZWQsIHdhaXRdXG4gICk7XG5cbiAgY29uc3QgY2FuY2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmICh0aW1lcklkLmN1cnJlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2FuY2VsVGltZXIodGltZXJJZC5jdXJyZW50KTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUuY3VycmVudCA9IDA7XG4gICAgdGltZXJJZC5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGxhc3RUaGlzLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgbGFzdENhbGxUaW1lLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEFyZ3MuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfSwgW2NhbmNlbFRpbWVyXSk7XG5cbiAgY29uc3QgZmx1c2ggPSB1c2VDYWxsYmFjayhcbiAgICAoKSA9PlxuICAgICAgdGltZXJJZC5jdXJyZW50ID09PSB1bmRlZmluZWQgPyByZXN1bHQuY3VycmVudCA6IHRyYWlsaW5nRWRnZShEYXRlLm5vdygpKSxcbiAgICBbdHJhaWxpbmdFZGdlXVxuICApO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbW91bnRlZC5jdXJyZW50ID0gdHJ1ZTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbW91bnRlZC5jdXJyZW50ID0gZmFsc2U7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGRlYm91bmNlZCA9IHVzZUNhbGxiYWNrKFxuICAgICguLi5hcmdzKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIGNvbnN0IGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICAgIGxhc3RBcmdzLmN1cnJlbnQgPSBhcmdzO1xuICAgICAgbGFzdFRoaXMuY3VycmVudCA9IHRoaXM7XG4gICAgICBsYXN0Q2FsbFRpbWUuY3VycmVudCA9IHRpbWU7XG5cbiAgICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICAgIGlmICh0aW1lcklkLmN1cnJlbnQgPT09IHVuZGVmaW5lZCAmJiBtb3VudGVkLmN1cnJlbnQpIHtcbiAgICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lLmN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICAgIHRpbWVySWQuY3VycmVudCA9IHN0YXJ0VGltZXIodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUuY3VycmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aW1lcklkLmN1cnJlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aW1lcklkLmN1cnJlbnQgPSBzdGFydFRpbWVyKHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0LmN1cnJlbnQ7XG4gICAgfSxcbiAgICBbXG4gICAgICBpbnZva2VGdW5jLFxuICAgICAgbGVhZGluZ0VkZ2UsXG4gICAgICBtYXhpbmcsXG4gICAgICBzaG91bGRJbnZva2UsXG4gICAgICBzdGFydFRpbWVyLFxuICAgICAgdGltZXJFeHBpcmVkLFxuICAgICAgd2FpdCxcbiAgICBdXG4gICk7XG5cbiAgY29uc3QgcGVuZGluZyA9IHVzZUNhbGxiYWNrKCgpID0+IHRpbWVySWQuY3VycmVudCAhPT0gdW5kZWZpbmVkLCBbXSk7XG5cbiAgY29uc3QgZGVib3VuY2VkU3RhdGUgPSB1c2VNZW1vKFxuICAgICgpID0+ICh7XG4gICAgICBjYWxsYmFjazogZGVib3VuY2VkLFxuICAgICAgY2FuY2VsLFxuICAgICAgZmx1c2gsXG4gICAgICBwZW5kaW5nLFxuICAgIH0pLFxuICAgIFtkZWJvdW5jZWQsIGNhbmNlbCwgZmx1c2gsIHBlbmRpbmddXG4gICk7XG5cbiAgcmV0dXJuIGRlYm91bmNlZFN0YXRlO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IHVzZURlYm91bmNlZENhbGxiYWNrIH07XG4iLCJpbXBvcnQgeyBodG1sLCBjb21wb25lbnQsIHVzZVN0YXRlIH0gZnJvbSAnaGF1bnRlZCc7XG5pbXBvcnQgeyB1c2VEZWJvdW5jZWRDYWxsYmFjayB9IGZyb20gJy4vY3VzdG9tLWhvb2tzJztcbmltcG9ydCB7IGdldFByZWRpY3RpdmVTZWFyY2hSZXN1bHRzIH0gZnJvbSAnLi4vYWpheGFwaXMnO1xuXG5mdW5jdGlvbiBwcmVkaWN0aXZlU2VhcmNoKCkge1xuICBjb25zdCBbcSwgc2V0UV0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtyZXN1bHRzLCBzZXRSZXN1bHRzXSA9IHVzZVN0YXRlKHt9KTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IGRlYm91bmNlZCA9IHVzZURlYm91bmNlZENhbGxiYWNrKCgpID0+IHtcbiAgICBnZXRQcmVkaWN0aXZlU2VhcmNoUmVzdWx0cyhxKS50aGVuKGZ1bmN0aW9uIHNldFZhbHVlKHJlc3BvbnNlKSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlKSB7XG4gICAgICAgIHNldFJlc3VsdHMoe30pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0UmVzdWx0cyhyZXNwb25zZS5yZXNvdXJjZXMucmVzdWx0cyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sIDUwMCk7XG5cbiAgY29uc3QgaGFuZGxlS2V5dXAgPSAoZXZlbnQpID0+IHtcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgIHNldFEoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICBkZWJvdW5jZWQuY2FsbGJhY2soZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfTtcblxuICByZXR1cm4gaHRtbGBcbiAgICA8aDE+JHtgJHtsb2FkaW5nID8gJ2xvYWRpbmcuLi4nIDogJ2xvYWRlZCd9YH08L2gxPlxuICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIEBrZXl1cD0ke2hhbmRsZUtleXVwfSB2YWx1ZT0ke3F9IC8+XG4gICAgPGRpdj4ke0pTT04uc3RyaW5naWZ5KHJlc3VsdHMpfTwvZGl2PlxuICBgO1xufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXG4gICdwcmVkaWN0aXZlLXNlYXJjaCcsXG4gIGNvbXBvbmVudChwcmVkaWN0aXZlU2VhcmNoLCB7IHVzZVNoYWRvd0RPTTogZmFsc2UgfSlcbik7XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1uZXN0ZWQtdGVybmFyeSAqL1xuaW1wb3J0IHsgaHRtbCwgY29tcG9uZW50LCB1c2VTdGF0ZSB9IGZyb20gJ2hhdW50ZWQnO1xuaW1wb3J0IHsgYWRkSXRlbUZyb21Gb3JtLCBnZXRDYXJ0IH0gZnJvbSAnLi4vYWpheGFwaXMnO1xuaW1wb3J0IHsgZGlzcGF0Y2hDdXN0b21FdmVudCwgZm9ybWF0TW9uZXkgfSBmcm9tICcuLi9oZWxwZXInO1xuXG5mdW5jdGlvbiBhdGNEcm9wZG93bklucHV0cyh7XG4gIGRhdGFQcm9kdWN0LFxuICBkYXRhU2VsZWN0ZWRPckZpcnN0QXZhaWxhYmxlVmFyaWFudCxcbiAgZGF0YU9wdGlvbnNXaXRoVmFsdWVzLFxuICBzZWxlY3RvcldyYXBwZXJDdXN0b21DbGFzc2VzID0gJycsXG4gIHNlbGVjdG9yTGFiZWxDdXN0b21DbGFzc2VzID0gJycsXG4gIHNlbGVjdG9yQ3VzdG9tQ2xhc3NlcyA9ICcnLFxuICBxdWFudGl0eUlucHV0Q3VzdG9tQ2xhc3NlcyA9ICcnLFxuICBhdGNCdXR0b25DdXN0b21DbGFzc2VzID0gJycsXG59KSB7XG4gIGNvbnN0IHByb2R1Y3QgPSBKU09OLnBhcnNlKGRhdGFQcm9kdWN0KTtcbiAgY29uc3Qgb3B0aW9uc1dpdGhWYWx1ZXMgPSBKU09OLnBhcnNlKGRhdGFPcHRpb25zV2l0aFZhbHVlcyk7XG4gIGNvbnN0IFtjdXJyZW50VmFyaWFudCwgc2V0Q3VycmVudFZhcmlhbnRdID0gdXNlU3RhdGUoXG4gICAgcHJvZHVjdC52YXJpYW50cy5maW5kKFxuICAgICAgKHZhcmlhbnQpID0+XG4gICAgICAgIHZhcmlhbnQuaWQgPT09IHBhcnNlSW50KGRhdGFTZWxlY3RlZE9yRmlyc3RBdmFpbGFibGVWYXJpYW50LCAxMClcbiAgICApXG4gICk7XG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZSgnc3VzcGVuZGVkJyk7IC8vIHRoZXJlIHNob3VsZCBiZSBmb3VyIGtpbmRzIG9mIHN0YXR1cywgc3VzcGVuZGVkLCBsb2FkaW5nLCBzdWNjZXNzLCBlcnJvclxuICBjb25zdCBbZXJyb3JEZXNjcmlwdGlvbiwgc2V0RXJyb3JEZXNjcmlwdGlvbl0gPSB1c2VTdGF0ZSgnJyk7XG5cbiAgY29uc3QgaGFuZGxlT3B0aW9uQ2hhbmdlID0gKCkgPT4ge1xuICAgIGNvbnN0IGZvcm0gPSB0aGlzLmNsb3Nlc3QoJ2Zvcm0nKTtcbiAgICBjb25zdCBvcHRpb24xID1cbiAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcignc2VsZWN0W2RhdGEtb3B0aW9uPVwib3B0aW9uMVwiXScpICYmXG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtkYXRhLW9wdGlvbj1cIm9wdGlvbjFcIl0nKS52YWx1ZTtcbiAgICBjb25zdCBvcHRpb24yID1cbiAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcignc2VsZWN0W2RhdGEtb3B0aW9uPVwib3B0aW9uMlwiXScpICYmXG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtkYXRhLW9wdGlvbj1cIm9wdGlvbjJcIl0nKS52YWx1ZTtcbiAgICBjb25zdCBvcHRpb24zID1cbiAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcignc2VsZWN0W2RhdGEtb3B0aW9uPVwib3B0aW9uM1wiXScpICYmXG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtkYXRhLW9wdGlvbj1cIm9wdGlvbjNcIl0nKS52YWx1ZTtcbiAgICBjb25zdCBjVmFyaWFudCA9IHByb2R1Y3QudmFyaWFudHMuZmluZChcbiAgICAgICh2YXJpYW50KSA9PlxuICAgICAgICB2YXJpYW50Lm9wdGlvbjEgPT09IG9wdGlvbjEgJiZcbiAgICAgICAgdmFyaWFudC5vcHRpb24yID09PSBvcHRpb24yICYmXG4gICAgICAgIHZhcmlhbnQub3B0aW9uMyA9PT0gb3B0aW9uM1xuICAgICk7XG5cbiAgICBzZXRDdXJyZW50VmFyaWFudChjVmFyaWFudCk7XG5cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50KGZvcm0sICd2YXJpYW50Y2hhbmdlZCcsIHtcbiAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgIGRldGFpbDogeyBjdXJyZW50VmFyaWFudDogY1ZhcmlhbnQsIGZvcm1hdE1vbmV5IH0sXG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQVRDQnV0dG9uQ2xpY2sgPSAoZSkgPT4ge1xuICAgIGlmICh0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5pZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgZm9ybSA9IHRoaXMuY2xvc2VzdCgnZm9ybScpO1xuICAgICAgc2V0U3RhdHVzKCdsb2FkaW5nJyk7XG4gICAgICBhZGRJdGVtRnJvbUZvcm0oZm9ybSkudGhlbigoYWRkZWRJdGVtKSA9PiB7XG4gICAgICAgIGlmIChhZGRlZEl0ZW0uaWQpIHtcbiAgICAgICAgICBzZXRTdGF0dXMoJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICBnZXRDYXJ0KCkudGhlbigoY2FydCkgPT4ge1xuICAgICAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudChmb3JtLCAnY2FydHVwZGF0ZWQnLCB7XG4gICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgICBkZXRhaWw6IHsgY2FydCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzZXRTdGF0dXMoJ3N1c3BlbmRlZCcpO1xuICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFkZGVkSXRlbS5kZXNjcmlwdGlvbikge1xuICAgICAgICAgIHNldFN0YXR1cygnZXJyb3InKTtcbiAgICAgICAgICBzZXRFcnJvckRlc2NyaXB0aW9uKGFkZGVkSXRlbS5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzZXRFcnJvckRlc2NyaXB0aW9uKCcnKTtcbiAgICAgICAgICAgIHNldFN0YXR1cygnc3VzcGVuZGVkJyk7XG4gICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gaHRtbGA8aW5wdXRcbiAgICAgIG5hbWU9XCJpZFwiXG4gICAgICB2YWx1ZT1cIiR7Y3VycmVudFZhcmlhbnQgJiYgY3VycmVudFZhcmlhbnQuaWR9XCJcbiAgICAgIHR5cGU9XCJoaWRkZW5cIlxuICAgIC8+XG4gICAgJHtvcHRpb25zV2l0aFZhbHVlcy5tYXAoXG4gICAgICAob3B0aW9uKSA9PlxuICAgICAgICBodG1sYDxkaXZcbiAgICAgICAgICBjbGFzcz1cInNlbGVjdG9yLXdyYXBwZXIgZm9ybS1ncm91cCAke3NlbGVjdG9yV3JhcHBlckN1c3RvbUNsYXNzZXN9XCJcbiAgICAgICAgICA/aGlkZGVuPSR7b3B0aW9uLm5hbWUgPT09ICdUaXRsZScgJiZcbiAgICAgICAgICBvcHRpb24udmFsdWVzWzBdID09PSAnRGVmYXVsdCBUaXRsZSd9XG4gICAgICAgID5cbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCIke3NlbGVjdG9yTGFiZWxDdXN0b21DbGFzc2VzfVwiIGZvcj1cIiR7b3B0aW9uLm5hbWV9XCJcbiAgICAgICAgICAgID4ke29wdGlvbi5uYW1lfTo8L2xhYmVsXG4gICAgICAgICAgPlxuICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgIGlkPVwiJHtvcHRpb24ubmFtZX1cIlxuICAgICAgICAgICAgZGF0YS1vcHRpb249XCJvcHRpb24ke29wdGlvbi5wb3NpdGlvbn1cIlxuICAgICAgICAgICAgQGNoYW5nZT0ke2hhbmRsZU9wdGlvbkNoYW5nZX1cbiAgICAgICAgICAgIGNsYXNzPVwiZm9ybS1jb250cm9sICR7c2VsZWN0b3JDdXN0b21DbGFzc2VzfVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgJHtvcHRpb24udmFsdWVzLm1hcChcbiAgICAgICAgICAgICAgKHZhbHVlKSA9PlxuICAgICAgICAgICAgICAgIGh0bWxgPG9wdGlvblxuICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke3ZhbHVlfVwiXG4gICAgICAgICAgICAgICAgICA/c2VsZWN0ZWQ9JHtjdXJyZW50VmFyaWFudCAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFZhcmlhbnRbYG9wdGlvbiR7b3B0aW9uLnBvc2l0aW9ufWBdID09PSB2YWx1ZX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAke3ZhbHVlfVxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPmBcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PmBcbiAgICApfVxuICAgIDxpbnB1dFxuICAgICAgY2xhc3M9XCJmb3JtLWNvbnRyb2wgcXVhbnRpdHlfaW5wdXQgJHtxdWFudGl0eUlucHV0Q3VzdG9tQ2xhc3Nlc31cIlxuICAgICAgbmFtZT1cInF1YW50aXR5XCJcbiAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgdmFsdWU9XCIxXCJcbiAgICAgIHN0ZXA9XCIxXCJcbiAgICAvPlxuICAgIDxidXR0b25cbiAgICAgID9kaXNhYmxlZD0keyFjdXJyZW50VmFyaWFudCB8fCAhY3VycmVudFZhcmlhbnQuYXZhaWxhYmxlfVxuICAgICAgQGNsaWNrPSR7aGFuZGxlQVRDQnV0dG9uQ2xpY2t9XG4gICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgIG5hbWU9XCJhZGRcIlxuICAgICAgY2xhc3M9XCJmb3JtLWNvbnRyb2wgQWRkVG9DYXJ0IGJ0biAke2F0Y0J1dHRvbkN1c3RvbUNsYXNzZXN9XCJcbiAgICA+XG4gICAgICA8c3BhbiBjbGFzcz1cIkFkZFRvQ2FydFRleHRcIlxuICAgICAgICA+JHtjdXJyZW50VmFyaWFudCAmJiAhY3VycmVudFZhcmlhbnQuYXZhaWxhYmxlXG4gICAgICAgICAgPyBodG1sYE5vdCBBdmFpbGFibGVgXG4gICAgICAgICAgOiBzdGF0dXMgPT09ICdzdXNwZW5kZWQnXG4gICAgICAgICAgPyBodG1sYEFkZCBUbyBDYXJ0YFxuICAgICAgICAgIDogc3RhdHVzID09PSAnbG9hZGluZydcbiAgICAgICAgICA/IGh0bWxgPHNwYW4gY2xhc3M9XCJzcGlubmVyLWJvcmRlclwiPjwvc3Bhbj5gXG4gICAgICAgICAgOiBzdGF0dXMgPT09ICdzdWNjZXNzJ1xuICAgICAgICAgID8gaHRtbGBBZGRlZGBcbiAgICAgICAgICA6IGh0bWxgYH08L3NwYW5cbiAgICAgID5cbiAgICA8L2J1dHRvbj5cbiAgICA8ZGl2IGNsYXNzPVwiYm9sZF9vcHRpb25zXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImVycm9yLWRlc2NyaXB0aW9uXCIgP2hpZGRlbj0ke2Vycm9yRGVzY3JpcHRpb24gPT09ICcnfT5cbiAgICAgICR7ZXJyb3JEZXNjcmlwdGlvbn1cbiAgICA8L2Rpdj5gO1xufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXG4gICdhdGMtZHJvcGRvd24taW5wdXRzJyxcbiAgY29tcG9uZW50KGF0Y0Ryb3Bkb3duSW5wdXRzLCB7XG4gICAgdXNlU2hhZG93RE9NOiBmYWxzZSxcbiAgICBvYnNlcnZlZEF0dHJpYnV0ZXM6IFtcbiAgICAgICdkYXRhLXByb2R1Y3QnLFxuICAgICAgJ2RhdGEtc2VsZWN0ZWQtb3ItZmlyc3QtYXZhaWxhYmxlLXZhcmlhbnQnLFxuICAgICAgJ2RhdGEtb3B0aW9ucy13aXRoLXZhbHVlcycsXG4gICAgICAnc2VsZWN0b3Itd3JhcHBlci1jdXN0b20tY2xhc3NlcycsXG4gICAgICAnc2VsZWN0b3ItbGFiZWwtY3VzdG9tLWNsYXNzZXMnLFxuICAgICAgJ3NlbGVjdG9yLWN1c3RvbS1jbGFzc2VzJyxcbiAgICAgICdxdWFudGl0eS1pbnB1dC1jdXN0b20tY2xhc3NlcycsXG4gICAgICAnYXRjLWJ1dHRvbi1jdXN0b20tY2xhc3NlcycsXG4gICAgXSxcbiAgfSlcbik7XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5pbXBvcnQgeyBodG1sLCBjb21wb25lbnQsIHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdoYXVudGVkJztcbmltcG9ydCB7IGRpc3BhdGNoQ3VzdG9tRXZlbnQsIGVzY2FwZSwgdW5lc2NhcGUgfSBmcm9tICcuLi9oZWxwZXInO1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbldpdGhQcm9kdWN0c0RldGFpbHMgfSBmcm9tICcuLi9hamF4YXBpcyc7XG5cbmZ1bmN0aW9uIGNvbGxlY3Rpb25JdGVtKHtcbiAgY29sbGVjdGlvbkhhbmRsZSA9ICcnLFxuICBjb2xsZWN0aW9uVGl0bGUgPSAnJyxcbiAgZGF0YVRhZyA9ICcnLFxufSkge1xuICBjb25zdCBbY29sbGVjdGlvbiwgc2V0Q29sbGVjdGlvbl0gPSB1c2VTdGF0ZSh7fSk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGNvbGxlY3Rpb25IYW5kbGUgIT09ICcnKSB7XG4gICAgICBnZXRDb2xsZWN0aW9uV2l0aFByb2R1Y3RzRGV0YWlscyhcbiAgICAgICAgY29sbGVjdGlvbkhhbmRsZSxcbiAgICAgICAgZGF0YVRhZyxcbiAgICAgICAgKHVwZGF0ZWRDb2xsZWN0aW9uKSA9PiB7XG4gICAgICAgICAgc2V0Q29sbGVjdGlvbih1cGRhdGVkQ29sbGVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICkudGhlbigodXBkYXRlZENvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgc2V0Q29sbGVjdGlvbih1cGRhdGVkQ29sbGVjdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIFtjb2xsZWN0aW9uSGFuZGxlLCBkYXRhVGFnXSk7XG4gIGNvbnN0IGhhbmRsZUNsaWNrID0gKHByb2R1Y3QsIGUpID0+IHtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50KFxuICAgICAgZS50YXJnZXQuY2xvc2VzdCgnLnByb2R1Y3QtZ3JpZCcpLFxuICAgICAgJ3Byb2R1Y3RncmlkY2xpY2tlZCcsXG4gICAgICB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHsgb3JpZ2luYWxFdmVudDogZSwgcHJvZHVjdCwgZXNjYXBlLCB1bmVzY2FwZSB9LFxuICAgICAgfVxuICAgICk7XG4gIH07XG4gIHJldHVybiBodG1sYDxoNT4ke2NvbGxlY3Rpb25UaXRsZX08L2g1PlxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgICR7Y29sbGVjdGlvbi5wcm9kdWN0cyAmJlxuICAgICAgY29sbGVjdGlvbi5wcm9kdWN0cy5tYXAoXG4gICAgICAgIChwcm9kdWN0KSA9PiBodG1sYDxkaXZcbiAgICAgICAgICBjbGFzcz1cInByb2R1Y3QtZ3JpZCBjb2wtMTIgY29sLXNtLTEyIGNvbC1tZC02XCJcbiAgICAgICAgICBAY2xpY2s9JHsoZSkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlQ2xpY2socHJvZHVjdCwgZSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmbG9hdDogcmlnaHQ7d2lkdGg6IDMwJTtcIj5cbiAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJpbWctZmx1aWRcIiBzcmM9XCJodHRwczovL3BpY3N1bS5waG90b3MvMzAwLzMwMFwiIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImZsb2F0OiBsZWZ0O3dpZHRoOiA3MCU7XCI+XG4gICAgICAgICAgICA8aDY+JHtwcm9kdWN0LnRpdGxlfTwvaDY+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZW50LCBjb25zZWN0ZXR1ZXIgYWRpcGlzY2luZyBlbGl0LCBzZWRcbiAgICAgICAgICAgICAgZGlhbSBub251bW15IG5pYmggZXVpc21vZCBsaW5jaWR1bnQgdXQgbGFvcmVldCBkb2xvcmUgbWFnbmFcbiAgICAgICAgICAgICAgYWxpcXVhbSBlcmF0XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LWRhbmdlclwiPiQxMDAgLjAwIOKGkCA8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuPiQxMjAuMDA8L3NwYW4+XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIGhlaWdodD1cIjIwXCJcbiAgICAgICAgICAgICAgICBzcmM9XCJodHRwczovL3BpY3N1bS5waG90b3MvMjAvMjBcIlxuICAgICAgICAgICAgICAgIHdpZHRoPVwiMjBcIlxuICAgICAgICAgICAgICAvPjxpbWdcbiAgICAgICAgICAgICAgICBoZWlnaHQ9XCIyMFwiXG4gICAgICAgICAgICAgICAgc3JjPVwiaHR0cHM6Ly9waWNzdW0ucGhvdG9zLzIwLzIwXCJcbiAgICAgICAgICAgICAgICB3aWR0aD1cIjIwXCJcbiAgICAgICAgICAgICAgLz48aW1nXG4gICAgICAgICAgICAgICAgaGVpZ2h0PVwiMjBcIlxuICAgICAgICAgICAgICAgIHNyYz1cImh0dHBzOi8vcGljc3VtLnBob3Rvcy8yMC8yMFwiXG4gICAgICAgICAgICAgICAgd2lkdGg9XCIyMFwiXG4gICAgICAgICAgICAgIC8+PGltZ1xuICAgICAgICAgICAgICAgIGhlaWdodD1cIjIwXCJcbiAgICAgICAgICAgICAgICBzcmM9XCJodHRwczovL3BpY3N1bS5waG90b3MvMjAvMjBcIlxuICAgICAgICAgICAgICAgIHdpZHRoPVwiMjBcIlxuICAgICAgICAgICAgICAvPjxpbWcgaGVpZ2h0PVwiMjBcIiBzcmM9XCJodHRwczovL3BpY3N1bS5waG90b3MvMjAvMjBcIiB3aWR0aD1cIjIwXCIgLz5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+YFxuICAgICAgKX1cbiAgICA8L2Rpdj5gO1xufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXG4gICdjb2xsZWN0aW9uLWl0ZW0nLFxuICBjb21wb25lbnQoY29sbGVjdGlvbkl0ZW0sIHtcbiAgICB1c2VTaGFkb3dET006IGZhbHNlLFxuICAgIG9ic2VydmVkQXR0cmlidXRlczogWydjb2xsZWN0aW9uLWhhbmRsZScsICdjb2xsZWN0aW9uLXRpdGxlJywgJ2RhdGEtdGFnJ10sXG4gIH0pXG4pO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbm8tbmVzdGVkLXRlcm5hcnkgKi9cbmltcG9ydCB7IGh0bWwsIGNvbXBvbmVudCwgdXNlU3RhdGUsIHVzZUxheW91dEVmZmVjdCB9IGZyb20gJ2hhdW50ZWQnO1xuaW1wb3J0IHsgYWRkSXRlbUZyb21Gb3JtLCBnZXRDYXJ0IH0gZnJvbSAnLi4vYWpheGFwaXMnO1xuaW1wb3J0IHsgZGlzcGF0Y2hDdXN0b21FdmVudCwgZm9ybWF0TW9uZXkgfSBmcm9tICcuLi9oZWxwZXInO1xuXG5mdW5jdGlvbiBhdGNSYWRpb2J1dHRvbkZvcm0oe1xuICBkYXRhUHJvZHVjdCxcbiAgZGF0YVNlbGVjdGVkT3JGaXJzdEF2YWlsYWJsZVZhcmlhbnQsXG4gIGRhdGFPcHRpb25zV2l0aFZhbHVlcyxcbiAgc2VsZWN0b3JXcmFwcGVyQ3VzdG9tQ2xhc3NlcyA9ICcnLFxuICBzZWxlY3RvckxhYmVsQ3VzdG9tQ2xhc3NlcyA9ICcnLFxuICBzZWxlY3RvckN1c3RvbUNsYXNzZXMgPSAnJyxcbiAgcXVhbnRpdHlJbnB1dEN1c3RvbUNsYXNzZXMgPSAnJyxcbiAgYXRjQnV0dG9uQ3VzdG9tQ2xhc3NlcyA9ICcnLFxufSkge1xuICBjb25zdCBwcm9kdWN0ID0gSlNPTi5wYXJzZShkYXRhUHJvZHVjdCk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoVmFsdWVzID0gSlNPTi5wYXJzZShkYXRhT3B0aW9uc1dpdGhWYWx1ZXMpO1xuICBjb25zdCBbY3VycmVudFZhcmlhbnQsIHNldEN1cnJlbnRWYXJpYW50XSA9IHVzZVN0YXRlKFxuICAgIHByb2R1Y3QudmFyaWFudHMuZmluZChcbiAgICAgICh2YXJpYW50KSA9PlxuICAgICAgICB2YXJpYW50LmlkID09PSBwYXJzZUludChkYXRhU2VsZWN0ZWRPckZpcnN0QXZhaWxhYmxlVmFyaWFudCwgMTApXG4gICAgKVxuICApO1xuXG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZSgnc3VzcGVuZGVkJyk7IC8vIHRoZXJlIHNob3VsZCBiZSBmb3VyIGtpbmRzIG9mIHN0YXR1cywgc3VzcGVuZGVkLCBsb2FkaW5nLCBzdWNjZXNzLCBlcnJvclxuICBjb25zdCBbZXJyb3JEZXNjcmlwdGlvbiwgc2V0RXJyb3JEZXNjcmlwdGlvbl0gPSB1c2VTdGF0ZSgnJyk7XG5cbiAgY29uc3QgaGFuZGxlT3B0aW9uQ2hhbmdlID0gKCkgPT4ge1xuICAgIGNvbnN0IGZvcm0gPSB0aGlzLmNsb3Nlc3QoJ2Zvcm0nKTtcbiAgICBjb25zdCBvcHRpb24xID1cbiAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcignc2VsZWN0W2RhdGEtb3B0aW9uPVwib3B0aW9uMVwiXScpICYmXG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtkYXRhLW9wdGlvbj1cIm9wdGlvbjFcIl0nKS52YWx1ZTtcbiAgICBjb25zdCBvcHRpb24yID1cbiAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcignc2VsZWN0W2RhdGEtb3B0aW9uPVwib3B0aW9uMlwiXScpICYmXG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtkYXRhLW9wdGlvbj1cIm9wdGlvbjJcIl0nKS52YWx1ZTtcbiAgICBjb25zdCBvcHRpb24zID1cbiAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcignc2VsZWN0W2RhdGEtb3B0aW9uPVwib3B0aW9uM1wiXScpICYmXG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtkYXRhLW9wdGlvbj1cIm9wdGlvbjNcIl0nKS52YWx1ZTtcbiAgICBjb25zdCBjVmFyaWFudCA9IHByb2R1Y3QudmFyaWFudHMuZmluZChcbiAgICAgICh2YXJpYW50KSA9PlxuICAgICAgICB2YXJpYW50Lm9wdGlvbjEgPT09IG9wdGlvbjEgJiZcbiAgICAgICAgdmFyaWFudC5vcHRpb24yID09PSBvcHRpb24yICYmXG4gICAgICAgIHZhcmlhbnQub3B0aW9uMyA9PT0gb3B0aW9uM1xuICAgICk7XG5cbiAgICBzZXRDdXJyZW50VmFyaWFudChjVmFyaWFudCk7XG5cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50KGZvcm0sICd2YXJpYW50Y2hhbmdlZCcsIHtcbiAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgIGRldGFpbDogeyBjdXJyZW50VmFyaWFudDogY1ZhcmlhbnQsIGZvcm1hdE1vbmV5IH0sXG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQVRDQnV0dG9uQ2xpY2sgPSAoZSkgPT4ge1xuICAgIGlmICh0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5pZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgZm9ybSA9IHRoaXMuY2xvc2VzdCgnZm9ybScpO1xuICAgICAgc2V0U3RhdHVzKCdsb2FkaW5nJyk7XG4gICAgICBhZGRJdGVtRnJvbUZvcm0oZm9ybSkudGhlbigoYWRkZWRJdGVtKSA9PiB7XG4gICAgICAgIGlmIChhZGRlZEl0ZW0uaWQpIHtcbiAgICAgICAgICBzZXRTdGF0dXMoJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICBnZXRDYXJ0KCkudGhlbigoY2FydCkgPT4ge1xuICAgICAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudChmb3JtLCAnY2FydHVwZGF0ZWQnLCB7XG4gICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgICBkZXRhaWw6IHsgY2FydCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzZXRTdGF0dXMoJ3N1c3BlbmRlZCcpO1xuICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFkZGVkSXRlbS5kZXNjcmlwdGlvbikge1xuICAgICAgICAgIHNldFN0YXR1cygnZXJyb3InKTtcbiAgICAgICAgICBzZXRFcnJvckRlc2NyaXB0aW9uKGFkZGVkSXRlbS5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzZXRFcnJvckRlc2NyaXB0aW9uKCcnKTtcbiAgICAgICAgICAgIHNldFN0YXR1cygnc3VzcGVuZGVkJyk7XG4gICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gaHRtbGAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICA8aDUgY2xhc3M9XCJtb2RhbC10aXRsZVwiIGlkPVwiZXhhbXBsZU1vZGFsTGFiZWxcIj5OZXcgbWVzc2FnZTwvaDU+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzcz1cImNsb3NlXCJcbiAgICAgICAgZGF0YS1kaXNtaXNzPVwibW9kYWxcIlxuICAgICAgICBhcmlhLWxhYmVsPVwiQ2xvc2VcIlxuICAgICAgPlxuICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIj5cbiAgICAgIDxmb3JtPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxsYWJlbCBmb3I9XCJyZWNpcGllbnQtbmFtZVwiIGNsYXNzPVwiY29sLWZvcm0tbGFiZWxcIj5SZWNpcGllbnQ6PC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicmVjaXBpZW50LW5hbWVcIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICA8bGFiZWwgZm9yPVwibWVzc2FnZS10ZXh0XCIgY2xhc3M9XCJjb2wtZm9ybS1sYWJlbFwiPk1lc3NhZ2U6PC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cIm1lc3NhZ2UtdGV4dFwiPjwvdGV4dGFyZWE+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9mb3JtPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1mb290ZXJcIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiPlxuICAgICAgICBDbG9zZVxuICAgICAgPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlNlbmQgbWVzc2FnZTwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5gO1xufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXG4gICdhdGMtcmFkaW9idXR0b24tZm9ybScsXG4gIGNvbXBvbmVudChhdGNSYWRpb2J1dHRvbkZvcm0sIHtcbiAgICB1c2VTaGFkb3dET006IGZhbHNlLFxuICAgIG9ic2VydmVkQXR0cmlidXRlczogW1xuICAgICAgJ2RhdGEtcHJvZHVjdCcsXG4gICAgICAnZGF0YS1zZWxlY3RlZC1vci1maXJzdC1hdmFpbGFibGUtdmFyaWFudCcsXG4gICAgICAnZGF0YS1vcHRpb25zLXdpdGgtdmFsdWVzJyxcbiAgICAgICdzZWxlY3Rvci13cmFwcGVyLWN1c3RvbS1jbGFzc2VzJyxcbiAgICAgICdzZWxlY3Rvci1sYWJlbC1jdXN0b20tY2xhc3NlcycsXG4gICAgICAnc2VsZWN0b3ItY3VzdG9tLWNsYXNzZXMnLFxuICAgICAgJ3F1YW50aXR5LWlucHV0LWN1c3RvbS1jbGFzc2VzJyxcbiAgICAgICdhdGMtYnV0dG9uLWN1c3RvbS1jbGFzc2VzJyxcbiAgICBdLFxuICB9KVxuKTtcbiIsImltcG9ydCBCU04gZnJvbSAnYm9vdHN0cmFwLm5hdGl2ZSc7XG5pbXBvcnQgYXBpcyBmcm9tICcuL2FqYXhhcGlzJztcbmltcG9ydCBoZWxwZXIgZnJvbSAnLi9oZWxwZXInO1xuaW1wb3J0ICcuL3NlY3Rpb25zL3Rlc3RpbW9uaWFscyc7XG5pbXBvcnQgJy4vc2VjdGlvbnMvaGVhZGVyJztcbmltcG9ydCAnLi9zZWN0aW9ucy9tYXNvbnJ5LWdhbGxlcnknO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvcHJlZGljdGl2ZS1zZWFyY2gnO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvYXRjLWRyb3Bkb3duLWlucHV0cyc7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9jb2xsZWN0aW9uLWl0ZW0nO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvYXRjLXJhZGlvYnV0dG9uLWZvcm0nO1xuXG53aW5kb3cuZGF0b21hciA9IHtcbiAgQlNOLFxuICBhcGlzLFxuICBoZWxwZXIsXG59O1xuIl0sIm5hbWVzIjpbInRyYW5zaXRpb25FbmRFdmVudCIsImRvY3VtZW50IiwiaGVhZCIsInN0eWxlIiwic3VwcG9ydFRyYW5zaXRpb24iLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uIiwiZWxlbWVudCIsImR1cmF0aW9uIiwicGFyc2VGbG9hdCIsImdldENvbXB1dGVkU3R5bGUiLCJpc05hTiIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiaGFuZGxlciIsImNhbGxlZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ0cmFuc2l0aW9uRW5kV3JhcHBlciIsImUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2V0VGltZW91dCIsInF1ZXJ5RWxlbWVudCIsInNlbGVjdG9yIiwicGFyZW50IiwibG9va1VwIiwiRWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJib290c3RyYXBDdXN0b21FdmVudCIsImV2ZW50TmFtZSIsImNvbXBvbmVudE5hbWUiLCJyZWxhdGVkIiwiT3JpZ2luYWxDdXN0b21FdmVudCIsIkN1c3RvbUV2ZW50IiwiY2FuY2VsYWJsZSIsInJlbGF0ZWRUYXJnZXQiLCJkaXNwYXRjaEN1c3RvbUV2ZW50IiwiY3VzdG9tRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiQWxlcnQiLCJzZWxmIiwiYWxlcnQiLCJjbG9zZUN1c3RvbUV2ZW50IiwiY2xvc2VkQ3VzdG9tRXZlbnQiLCJ0cmlnZ2VySGFuZGxlciIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwidHJhbnNpdGlvbkVuZEhhbmRsZXIiLCJ0b2dnbGVFdmVudHMiLCJhY3Rpb24iLCJjbGlja0hhbmRsZXIiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiY2xvc2UiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJjYWxsIiwiZGVmYXVsdFByZXZlbnRlZCIsImRpc3Bvc2UiLCJyZW1vdmUiLCJCdXR0b24iLCJsYWJlbHMiLCJjaGFuZ2VDdXN0b21FdmVudCIsInRvZ2dsZSIsImlucHV0IiwibGFiZWwiLCJ0YWdOYW1lIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJ0eXBlIiwiY2hlY2tlZCIsImFkZCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInJlbW92ZUF0dHJpYnV0ZSIsInRvZ2dsZWQiLCJzY3JlZW5YIiwic2NyZWVuWSIsIkFycmF5IiwiZnJvbSIsIm1hcCIsIm90aGVyTGFiZWwiLCJvdGhlcklucHV0Iiwia2V5SGFuZGxlciIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsImFjdGl2ZUVsZW1lbnQiLCJwcmV2ZW50U2Nyb2xsIiwicHJldmVudERlZmF1bHQiLCJmb2N1c1RvZ2dsZSIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJsZW5ndGgiLCJidG4iLCJtb3VzZUhvdmVyRXZlbnRzIiwic3VwcG9ydFBhc3NpdmUiLCJyZXN1bHQiLCJvcHRzIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiLCJ3cmFwIiwicGFzc2l2ZUhhbmRsZXIiLCJwYXNzaXZlIiwiaXNFbGVtZW50SW5TY3JvbGxSYW5nZSIsImJjciIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInZpZXdwb3J0SGVpZ2h0Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRIZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJDYXJvdXNlbCIsIm9wdGlvbnMiLCJ2YXJzIiwib3BzIiwic2xpZGVDdXN0b21FdmVudCIsInNsaWRDdXN0b21FdmVudCIsInNsaWRlcyIsImxlZnRBcnJvdyIsInJpZ2h0QXJyb3ciLCJpbmRpY2F0b3IiLCJpbmRpY2F0b3JzIiwicGF1c2VIYW5kbGVyIiwiaW50ZXJ2YWwiLCJpc1NsaWRpbmciLCJjbGVhckludGVydmFsIiwidGltZXIiLCJyZXN1bWVIYW5kbGVyIiwiY3ljbGUiLCJpbmRpY2F0b3JIYW5kbGVyIiwiZXZlbnRUYXJnZXQiLCJpbmRleCIsInBhcnNlSW50Iiwic2xpZGVUbyIsImNvbnRyb2xzSGFuZGxlciIsImN1cnJlbnRUYXJnZXQiLCJzcmNFbGVtZW50IiwicmVmIiwicGF1c2UiLCJ0b3VjaCIsInRvdWNoRG93bkhhbmRsZXIiLCJrZXlib2FyZCIsInRvZ2dsZVRvdWNoRXZlbnRzIiwidG91Y2hNb3ZlSGFuZGxlciIsInRvdWNoRW5kSGFuZGxlciIsImlzVG91Y2giLCJ0b3VjaFBvc2l0aW9uIiwic3RhcnRYIiwiY2hhbmdlZFRvdWNoZXMiLCJwYWdlWCIsImN1cnJlbnRYIiwiZW5kWCIsIk1hdGgiLCJhYnMiLCJzZXRBY3RpdmVQYWdlIiwicGFnZUluZGV4IiwieCIsIm5leHQiLCJ0aW1lb3V0IiwiZWxhcHNlZFRpbWUiLCJhY3RpdmVJdGVtIiwiZ2V0QWN0aXZlSW5kZXgiLCJvcmllbnRhdGlvbiIsImRpcmVjdGlvbiIsImhpZGRlbiIsInNldEludGVydmFsIiwiaWR4Iiwib2Zmc2V0V2lkdGgiLCJpbmRleE9mIiwiaXRlbUNsYXNzZXMiLCJzbGlkZSIsImNscyIsImludGVydmFsQXR0cmlidXRlIiwiaW50ZXJ2YWxEYXRhIiwidG91Y2hEYXRhIiwicGF1c2VEYXRhIiwia2V5Ym9hcmREYXRhIiwiaW50ZXJ2YWxPcHRpb24iLCJ0b3VjaE9wdGlvbiIsIkNvbGxhcHNlIiwiYWNjb3JkaW9uIiwiY29sbGFwc2UiLCJhY3RpdmVDb2xsYXBzZSIsInNob3dDdXN0b21FdmVudCIsInNob3duQ3VzdG9tRXZlbnQiLCJoaWRlQ3VzdG9tRXZlbnQiLCJoaWRkZW5DdXN0b21FdmVudCIsIm9wZW5BY3Rpb24iLCJjb2xsYXBzZUVsZW1lbnQiLCJpc0FuaW1hdGluZyIsImhlaWdodCIsInNjcm9sbEhlaWdodCIsImNsb3NlQWN0aW9uIiwic2hvdyIsImhpZGUiLCJpZCIsImFjY29yZGlvbkRhdGEiLCJzZXRGb2N1cyIsImZvY3VzIiwic2V0QWN0aXZlIiwiRHJvcGRvd24iLCJvcHRpb24iLCJtZW51IiwibWVudUl0ZW1zIiwicGVyc2lzdCIsInByZXZlbnRFbXB0eUFuY2hvciIsImFuY2hvciIsImhyZWYiLCJzbGljZSIsInRvZ2dsZURpc21pc3MiLCJvcGVuIiwiZGlzbWlzc0hhbmRsZXIiLCJoYXNEYXRhIiwiaXNTYW1lRWxlbWVudCIsImlzSW5zaWRlTWVudSIsImlzTWVudUl0ZW0iLCJjaGlsZHJlbiIsImNoaWxkIiwicHVzaCIsIk1vZGFsIiwibW9kYWwiLCJzY3JvbGxCYXJXaWR0aCIsIm92ZXJsYXkiLCJvdmVybGF5RGVsYXkiLCJmaXhlZEl0ZW1zIiwic2V0U2Nyb2xsYmFyIiwib3Blbk1vZGFsIiwiYm9keSIsImJvZHlQYWQiLCJwYWRkaW5nUmlnaHQiLCJib2R5T3ZlcmZsb3ciLCJtb2RhbE92ZXJmbG93IiwibWVhc3VyZVNjcm9sbGJhciIsImZpeGVkIiwiaXRlbVBhZCIsInJlc2V0U2Nyb2xsYmFyIiwic2Nyb2xsRGl2IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoVmFsdWUiLCJjbGFzc05hbWUiLCJhcHBlbmRDaGlsZCIsImNsaWVudFdpZHRoIiwiY3JlYXRlT3ZlcmxheSIsIm5ld092ZXJsYXkiLCJhbmltYXRpb24iLCJyZW1vdmVPdmVybGF5IiwidXBkYXRlIiwiYmVmb3JlU2hvdyIsImRpc3BsYXkiLCJ0cmlnZ2VyU2hvdyIsInRyaWdnZXJIaWRlIiwiZm9yY2UiLCJjbGlja1RhcmdldCIsIm1vZGFsSUQiLCJ0YXJnZXRBdHRyVmFsdWUiLCJlbGVtQXR0clZhbHVlIiwibW9kYWxUcmlnZ2VyIiwicGFyZW50V2l0aERhdGEiLCJiYWNrZHJvcCIsImN1cnJlbnRPcGVuIiwic2V0Q29udGVudCIsImNvbnRlbnQiLCJpbm5lckhUTUwiLCJjaGVja01vZGFsIiwiY29uY2F0IiwidHJpbSIsIm1vdXNlQ2xpY2tFdmVudHMiLCJkb3duIiwidXAiLCJnZXRTY3JvbGwiLCJ5IiwicGFnZVlPZmZzZXQiLCJzY3JvbGxUb3AiLCJwYWdlWE9mZnNldCIsInNjcm9sbExlZnQiLCJzdHlsZVRpcCIsImxpbmsiLCJwb3NpdGlvbiIsInRpcFBvc2l0aW9ucyIsImVsZW1lbnREaW1lbnNpb25zIiwidyIsImgiLCJvZmZzZXRIZWlnaHQiLCJ3aW5kb3dXaWR0aCIsIndpbmRvd0hlaWdodCIsInJlY3QiLCJzY3JvbGwiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwibGlua0RpbWVuc2lvbnMiLCJyaWdodCIsImxlZnQiLCJpc1BvcG92ZXIiLCJhcnJvdyIsImhhbGZUb3BFeGNlZWQiLCJoYWxmTGVmdEV4Y2VlZCIsImhhbGZSaWdodEV4Y2VlZCIsImhhbGZCb3R0b21FeGNlZWQiLCJ0b3BFeGNlZWQiLCJsZWZ0RXhjZWVkIiwiYm90dG9tRXhjZWVkIiwicmlnaHRFeGNlZWQiLCJ0b3BQb3NpdGlvbiIsImxlZnRQb3NpdGlvbiIsImFycm93VG9wIiwiYXJyb3dMZWZ0IiwiYXJyb3dXaWR0aCIsImFycm93SGVpZ2h0IiwicmVwbGFjZSIsIlBvcG92ZXIiLCJwb3BvdmVyIiwiaXNJcGhvbmUiLCJ0ZXN0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwidGl0bGVTdHJpbmciLCJjb250ZW50U3RyaW5nIiwidHJpZ2dlckRhdGEiLCJhbmltYXRpb25EYXRhIiwicGxhY2VtZW50RGF0YSIsImRpc21pc3NpYmxlRGF0YSIsImRlbGF5RGF0YSIsImNvbnRhaW5lckRhdGEiLCJjbG9zZUJ0biIsImNvbnRhaW5lckVsZW1lbnQiLCJjb250YWluZXJEYXRhRWxlbWVudCIsIm5hdmJhckZpeGVkVG9wIiwibmF2YmFyRml4ZWRCb3R0b20iLCJwbGFjZW1lbnRDbGFzcyIsImRpc21pc3NpYmxlSGFuZGxlciIsImdldENvbnRlbnRzIiwidGl0bGUiLCJyZW1vdmVQb3BvdmVyIiwiY29udGFpbmVyIiwiY3JlYXRlUG9wb3ZlciIsInBvcG92ZXJBcnJvdyIsInRlbXBsYXRlIiwicG9wb3ZlclRpdGxlIiwiZGlzbWlzc2libGUiLCJwb3BvdmVyQm9keU1hcmt1cCIsInBvcG92ZXJUZW1wbGF0ZSIsImZpcnN0Q2hpbGQiLCJwb3BvdmVySGVhZGVyIiwicG9wb3ZlckJvZHkiLCJzaG93UG9wb3ZlciIsInVwZGF0ZVBvcG92ZXIiLCJwbGFjZW1lbnQiLCJmb3JjZUZvY3VzIiwidHJpZ2dlciIsInRvdWNoSGFuZGxlciIsImRpc21pc3NIYW5kbGVyVG9nZ2xlIiwic2hvd1RyaWdnZXIiLCJoaWRlVHJpZ2dlciIsImNsZWFyVGltZW91dCIsImRlbGF5IiwicG9wb3ZlckNvbnRlbnRzIiwiU2Nyb2xsU3B5IiwidGFyZ2V0RGF0YSIsIm9mZnNldERhdGEiLCJzcHlUYXJnZXQiLCJzY3JvbGxUYXJnZXQiLCJ1cGRhdGVUYXJnZXRzIiwibGlua3MiLCJpdGVtcyIsInRhcmdldHMiLCJ0YXJnZXRJdGVtIiwiY2hhckF0IiwidXBkYXRlSXRlbSIsIml0ZW0iLCJkcm9wbWVudSIsImRyb3BMaW5rIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsIm5leHRTaWJsaW5nIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiYWN0aXZlU2libGluZyIsInRhcmdldFJlY3QiLCJpc1dpbmRvdyIsImlzQWN0aXZlIiwidG9wRWRnZSIsInNjcm9sbE9mZnNldCIsIm9mZnNldCIsImJvdHRvbUVkZ2UiLCJpbnNpZGUiLCJ1cGRhdGVJdGVtcyIsImwiLCJyZWZyZXNoIiwiVGFiIiwiaGVpZ2h0RGF0YSIsInRhYnMiLCJkcm9wZG93biIsInRhYnNDb250ZW50Q29udGFpbmVyIiwiYWN0aXZlVGFiIiwiYWN0aXZlQ29udGVudCIsIm5leHRDb250ZW50IiwiY29udGFpbmVySGVpZ2h0IiwiZXF1YWxDb250ZW50cyIsIm5leHRIZWlnaHQiLCJhbmltYXRlSGVpZ2h0IiwidHJpZ2dlckVuZCIsImdldEFjdGl2ZVRhYiIsImFjdGl2ZVRhYnMiLCJnZXRBY3RpdmVDb250ZW50IiwiVG9hc3QiLCJ0b2FzdCIsImF1dG9oaWRlRGF0YSIsInNob3dDb21wbGV0ZSIsImF1dG9oaWRlIiwiaGlkZUNvbXBsZXRlIiwiZGlzcG9zZUNvbXBsZXRlIiwibm9UaW1lciIsIlRvb2x0aXAiLCJ0b29sdGlwIiwiZ2V0VGl0bGUiLCJyZW1vdmVUb29sVGlwIiwiY3JlYXRlVG9vbFRpcCIsInRvb2x0aXBNYXJrdXAiLCJ0b29sdGlwQXJyb3ciLCJ0b29sdGlwSW5uZXIiLCJ1cGRhdGVUb29sdGlwIiwic2hvd1Rvb2x0aXAiLCJ0b2dnbGVBY3Rpb24iLCJzaG93QWN0aW9uIiwiaGlkZUFjdGlvbiIsImNvbXBvbmVudHNJbml0IiwiaW5pdGlhbGl6ZURhdGFBUEkiLCJDb25zdHJ1Y3RvciIsImNvbGxlY3Rpb24iLCJpbml0Q2FsbGJhY2siLCJjb21wb25lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaW5pdFdyYXBwZXIiLCJyZW1vdmVFbGVtZW50RGF0YUFQSSIsIkNvbnN0cnVjdG9yTmFtZSIsInJlbW92ZURhdGFBUEkiLCJ2ZXJzaW9uIiwiVmVyc2lvbiIsImJpbmQiLCJmbiIsInRoaXNBcmciLCJhcmdzIiwiYXJndW1lbnRzIiwiaSIsImFwcGx5IiwidG9TdHJpbmciLCJwcm90b3R5cGUiLCJpc0FycmF5IiwidmFsIiwiaXNVbmRlZmluZWQiLCJpc0J1ZmZlciIsImNvbnN0cnVjdG9yIiwiaXNBcnJheUJ1ZmZlciIsImlzRm9ybURhdGEiLCJGb3JtRGF0YSIsImlzQXJyYXlCdWZmZXJWaWV3IiwiQXJyYXlCdWZmZXIiLCJpc1ZpZXciLCJidWZmZXIiLCJpc1N0cmluZyIsImlzTnVtYmVyIiwiaXNPYmplY3QiLCJpc1BsYWluT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJpc0RhdGUiLCJpc0ZpbGUiLCJpc0Jsb2IiLCJpc0Z1bmN0aW9uIiwiaXNTdHJlYW0iLCJwaXBlIiwiaXNVUkxTZWFyY2hQYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJzdHIiLCJpc1N0YW5kYXJkQnJvd3NlckVudiIsInByb2R1Y3QiLCJmb3JFYWNoIiwib2JqIiwiaGFzT3duUHJvcGVydHkiLCJtZXJnZSIsImFzc2lnblZhbHVlIiwiZXh0ZW5kIiwiYSIsImIiLCJzdHJpcEJPTSIsImNoYXJDb2RlQXQiLCJlbmNvZGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJidWlsZFVSTCIsInVybCIsInBhcmFtcyIsInBhcmFtc1NlcmlhbGl6ZXIiLCJzZXJpYWxpemVkUGFyYW1zIiwidXRpbHMiLCJwYXJ0cyIsInNlcmlhbGl6ZSIsInBhcnNlVmFsdWUiLCJ2IiwidG9JU09TdHJpbmciLCJKU09OIiwic3RyaW5naWZ5Iiwiam9pbiIsImhhc2htYXJrSW5kZXgiLCJJbnRlcmNlcHRvck1hbmFnZXIiLCJoYW5kbGVycyIsInVzZSIsImZ1bGZpbGxlZCIsInJlamVjdGVkIiwiZWplY3QiLCJmb3JFYWNoSGFuZGxlciIsInRyYW5zZm9ybURhdGEiLCJkYXRhIiwiaGVhZGVycyIsImZucyIsInRyYW5zZm9ybSIsImlzQ2FuY2VsIiwidmFsdWUiLCJfX0NBTkNFTF9fIiwibm9ybWFsaXplSGVhZGVyTmFtZSIsIm5vcm1hbGl6ZWROYW1lIiwicHJvY2Vzc0hlYWRlciIsIm5hbWUiLCJ0b1VwcGVyQ2FzZSIsImVuaGFuY2VFcnJvciIsImVycm9yIiwiY29uZmlnIiwiY29kZSIsInJlcXVlc3QiLCJyZXNwb25zZSIsImlzQXhpb3NFcnJvciIsInRvSlNPTiIsIm1lc3NhZ2UiLCJkZXNjcmlwdGlvbiIsIm51bWJlciIsImZpbGVOYW1lIiwibGluZU51bWJlciIsImNvbHVtbk51bWJlciIsInN0YWNrIiwiY3JlYXRlRXJyb3IiLCJFcnJvciIsInNldHRsZSIsInJlc29sdmUiLCJyZWplY3QiLCJ2YWxpZGF0ZVN0YXR1cyIsInN0YXR1cyIsInN0YW5kYXJkQnJvd3NlckVudiIsIndyaXRlIiwiZXhwaXJlcyIsInBhdGgiLCJkb21haW4iLCJzZWN1cmUiLCJjb29raWUiLCJEYXRlIiwidG9HTVRTdHJpbmciLCJyZWFkIiwibWF0Y2giLCJSZWdFeHAiLCJkZWNvZGVVUklDb21wb25lbnQiLCJub3ciLCJub25TdGFuZGFyZEJyb3dzZXJFbnYiLCJpc0Fic29sdXRlVVJMIiwiY29tYmluZVVSTHMiLCJiYXNlVVJMIiwicmVsYXRpdmVVUkwiLCJidWlsZEZ1bGxQYXRoIiwicmVxdWVzdGVkVVJMIiwiaWdub3JlRHVwbGljYXRlT2YiLCJwYXJzZUhlYWRlcnMiLCJwYXJzZWQiLCJzcGxpdCIsInBhcnNlciIsImxpbmUiLCJzdWJzdHIiLCJ0b0xvd2VyQ2FzZSIsIm1zaWUiLCJ1cmxQYXJzaW5nTm9kZSIsIm9yaWdpblVSTCIsInJlc29sdmVVUkwiLCJwcm90b2NvbCIsImhvc3QiLCJzZWFyY2giLCJoYXNoIiwiaG9zdG5hbWUiLCJwb3J0IiwicGF0aG5hbWUiLCJsb2NhdGlvbiIsImlzVVJMU2FtZU9yaWdpbiIsInJlcXVlc3RVUkwiLCJ4aHJBZGFwdGVyIiwiUHJvbWlzZSIsImRpc3BhdGNoWGhyUmVxdWVzdCIsInJlcXVlc3REYXRhIiwicmVxdWVzdEhlYWRlcnMiLCJYTUxIdHRwUmVxdWVzdCIsImF1dGgiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwidW5lc2NhcGUiLCJBdXRob3JpemF0aW9uIiwiYnRvYSIsImZ1bGxQYXRoIiwibWV0aG9kIiwib25yZWFkeXN0YXRlY2hhbmdlIiwiaGFuZGxlTG9hZCIsInJlYWR5U3RhdGUiLCJyZXNwb25zZVVSTCIsInJlc3BvbnNlSGVhZGVycyIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsInJlc3BvbnNlRGF0YSIsInJlc3BvbnNlVHlwZSIsInJlc3BvbnNlVGV4dCIsInN0YXR1c1RleHQiLCJvbmFib3J0IiwiaGFuZGxlQWJvcnQiLCJvbmVycm9yIiwiaGFuZGxlRXJyb3IiLCJvbnRpbWVvdXQiLCJoYW5kbGVUaW1lb3V0IiwidGltZW91dEVycm9yTWVzc2FnZSIsInhzcmZWYWx1ZSIsIndpdGhDcmVkZW50aWFscyIsInhzcmZDb29raWVOYW1lIiwiY29va2llcyIsInVuZGVmaW5lZCIsInhzcmZIZWFkZXJOYW1lIiwic2V0UmVxdWVzdEhlYWRlciIsIm9uRG93bmxvYWRQcm9ncmVzcyIsIm9uVXBsb2FkUHJvZ3Jlc3MiLCJ1cGxvYWQiLCJjYW5jZWxUb2tlbiIsInByb21pc2UiLCJ0aGVuIiwib25DYW5jZWxlZCIsImNhbmNlbCIsImFib3J0Iiwic2VuZCIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwic2V0Q29udGVudFR5cGVJZlVuc2V0IiwiZ2V0RGVmYXVsdEFkYXB0ZXIiLCJhZGFwdGVyIiwicmVxdWlyZSQkMCIsInByb2Nlc3MiLCJyZXF1aXJlJCQxIiwiZGVmYXVsdHMiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwidHJhbnNmb3JtUmVzcG9uc2UiLCJwYXJzZSIsIm1heENvbnRlbnRMZW5ndGgiLCJtYXhCb2R5TGVuZ3RoIiwiY29tbW9uIiwiZm9yRWFjaE1ldGhvZE5vRGF0YSIsImZvckVhY2hNZXRob2RXaXRoRGF0YSIsInRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQiLCJ0aHJvd0lmUmVxdWVzdGVkIiwiZGlzcGF0Y2hSZXF1ZXN0IiwiY2xlYW5IZWFkZXJDb25maWciLCJvbkFkYXB0ZXJSZXNvbHV0aW9uIiwib25BZGFwdGVyUmVqZWN0aW9uIiwicmVhc29uIiwibWVyZ2VDb25maWciLCJjb25maWcxIiwiY29uZmlnMiIsInZhbHVlRnJvbUNvbmZpZzJLZXlzIiwibWVyZ2VEZWVwUHJvcGVydGllc0tleXMiLCJkZWZhdWx0VG9Db25maWcyS2V5cyIsImRpcmVjdE1lcmdlS2V5cyIsImdldE1lcmdlZFZhbHVlIiwic291cmNlIiwibWVyZ2VEZWVwUHJvcGVydGllcyIsInByb3AiLCJ2YWx1ZUZyb21Db25maWcyIiwiZGVmYXVsdFRvQ29uZmlnMiIsImF4aW9zS2V5cyIsIm90aGVyS2V5cyIsImtleXMiLCJmaWx0ZXIiLCJmaWx0ZXJBeGlvc0tleXMiLCJBeGlvcyIsImluc3RhbmNlQ29uZmlnIiwiaW50ZXJjZXB0b3JzIiwiY2hhaW4iLCJ1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyIsImludGVyY2VwdG9yIiwidW5zaGlmdCIsInB1c2hSZXNwb25zZUludGVyY2VwdG9ycyIsInNoaWZ0IiwiZ2V0VXJpIiwiQ2FuY2VsIiwiQ2FuY2VsVG9rZW4iLCJleGVjdXRvciIsIlR5cGVFcnJvciIsInJlc29sdmVQcm9taXNlIiwicHJvbWlzZUV4ZWN1dG9yIiwidG9rZW4iLCJjIiwic3ByZWFkIiwiY2FsbGJhY2siLCJhcnIiLCJjcmVhdGVJbnN0YW5jZSIsImRlZmF1bHRDb25maWciLCJjb250ZXh0IiwiaW5zdGFuY2UiLCJheGlvcyIsImNyZWF0ZSIsInJlcXVpcmUkJDIiLCJhbGwiLCJwcm9taXNlcyIsInJlcXVpcmUkJDMiLCJvbmNlIiwibm9vcCIsImlzQXJyYXlMaWtlIiwibWFwQXN5bmMiLCJlYWNoZm4iLCJpdGVyYXRvciIsImNiIiwicmVzdWx0cyIsImVyciIsIm9ubHlfb25jZSIsIl9rZXlzIiwiayIsImtleUl0ZXJhdG9yIiwiY29sbCIsImxlbiIsImVhY2hPZkxpbWl0IiwibGltaXQiLCJuZXh0S2V5IiwiZG9uZSIsInJ1bm5pbmciLCJlcnJvcmVkIiwicmVwbGVuaXNoIiwib25seU9uY2UiLCJkb1BhcmFsbGVsTGltaXQiLCJhdHRyaWJ1dGVUb1N0cmluZyIsImF0dHJpYnV0ZSIsInRvZ2dsZUNsYXNzIiwiZWxlbSIsInJlbW92ZUNsYXNzIiwiY2xhc3NOYW1lcyIsInByb3BlcnRpZXMiLCJmb3JtYXRNb25leSIsImNlbnRzIiwiZm9ybWF0IiwicGxhY2Vob2xkZXJSZWdleCIsImZvcm1hdFN0cmluZyIsImZvcm1hdFdpdGhEZWxpbWl0ZXJzIiwicHJlY2lzaW9uIiwidGhvdXNhbmRzIiwiZGVjaW1hbCIsIk51bWJlciIsInRvRml4ZWQiLCJkb2xsYXJzQW1vdW50IiwiY2VudHNBbW91bnQiLCJpc05pbCIsIlN0cmluZyIsImVzY2FwZU1hcCIsInVuZXNjYXBlTWFwIiwiZXNjYXBlIiwibSIsImFqYXhUZW1wbGF0ZUZ1bmMiLCJlbmNvZGVkIiwiZW5jb2RlVVJJIiwicG9zdCIsImdldENhcnQiLCJnZXRQcm9kdWN0IiwiaGFuZGxlIiwiY2xlYXJDYXJ0IiwidXBkYXRlQ2FydEZyb21Gb3JtIiwiZm9ybSIsImNoYW5nZUl0ZW1CeUtleU9ySWQiLCJxdWFudGl0eSIsInJlbW92ZUl0ZW1CeUtleU9ySWQiLCJjaGFuZ2VJdGVtQnlMaW5lIiwicmVtb3ZlSXRlbUJ5TGluZSIsImFkZEl0ZW0iLCJhZGRJdGVtRnJvbUZvcm0iLCJ1cGRhdGVDYXJ0QXR0cmlidXRlcyIsImF0dHJpYnV0ZXMiLCJ1cGRhdGVDYXJ0Tm90ZSIsIm5vdGUiLCJnZXRSZWNvbW1lbmRlZFByb2R1Y3RzIiwicHJvZHVjdElkIiwiZ2V0UHJlZGljdGl2ZVNlYXJjaFJlc3VsdHMiLCJxIiwidW5hdmFpbGFibGVQcm9kdWN0cyIsImZpZWxkcyIsInBhcmFtc1N0cmluZyIsIl9nZXRQYWdlQ29sbGVjdGlvbiIsInBhZ2UiLCJ0YWciLCJhY2NlcHQiLCJnZXRDb2xsZWN0aW9uIiwicHJvZHVjdHNfaGFuZGxlcyIsImN1cnJlbnRfcGFnZSIsImdldFBhZ2VDb2xsZWN0aW9uIiwicGFnaW5hdGUiLCJwYWdlcyIsImdldENvbGxlY3Rpb25XaXRoUHJvZHVjdHNEZXRhaWxzIiwicHJvZHVjdHNMb2FkZWRDYWxsYmFjayIsInByb2R1Y3RzSGFuZGxlcyIsInByb2R1Y3RzQ291bnQiLCJ0bXBQcm9kdWN0cyIsInVwZGF0ZWRDb2xsZWN0aW9uIiwibWFwTGltaXQiLCJwcm9kdWN0SGFuZGxlIiwicHJvZHVjdHMiLCJmYWN0b3J5IiwibW9kdWxlIiwiX3dpbmRvdyIsIkdsaWRlciIsInNldHRpbmdzIiwiXyIsIl9nbGlkZXIiLCJlbGUiLCJvcHQiLCJhc3NpZ24iLCJzbGlkZXNUb1Njcm9sbCIsInNsaWRlc1RvU2hvdyIsInJlc2l6ZUxvY2siLCJlYXNpbmciLCJ0IiwiZCIsImFuaW1hdGVfaWQiLCJhcnJvd3MiLCJfb3B0Iiwic2tpcFRyYWNrIiwidHJhY2siLCJpbml0IiwicmVzaXplIiwiZXZlbnQiLCJ1cGRhdGVDb250cm9scyIsImdsaWRlclByb3RvdHlwZSIsInBhZ2luZyIsIndpZHRoIiwiY29udGFpbmVyV2lkdGgiLCJicmVha3BvaW50Q2hhbmdlZCIsInNldHRpbmdzQnJlYWtwb2ludCIsIl9hdXRvU2xpZGUiLCJzbGlkZUNvdW50IiwiaXRlbVdpZHRoIiwiZXhhY3RXaWR0aCIsImZsb29yIiwiX18iLCJtYXgiLCJ0cmFja1dpZHRoIiwiaXNEcmFnIiwicHJldmVudENsaWNrIiwic2Nyb2xsVG8iLCJiaW5kQXJyb3dzIiwiYnVpbGREb3RzIiwiYmluZERyYWciLCJlbWl0IiwibW91c2UiLCJoYW5kbGVNb3VzZSIsIm1vdXNldXAiLCJtb3VzZURvd24iLCJldmVudHMiLCJtb3VzZWxlYXZlIiwibW91c2Vkb3duIiwic3RvcFByb3BhZ2F0aW9uIiwiY2xpZW50WCIsIm1vdXNlbW92ZSIsImNsaWNrIiwiZHJhZ2dhYmxlIiwiZG90cyIsImNlaWwiLCJkb3QiLCJkYXRhc2V0Iiwic2Nyb2xsSXRlbSIsIl9mdW5jIiwic2Nyb2xsUHJvcGFnYXRlIiwiZGlzYWJsZUFycm93cyIsInJld2luZCIsInByZXYiLCJyb3VuZCIsIm1pZGRsZSIsImV4dHJhTWlkZGxlIiwic2xpZGVDbGFzc2VzIiwid2FzVmlzaWJsZSIsInN0YXJ0IiwiZW5kIiwiaXRlbVN0YXJ0IiwiaXRlbUVuZCIsImlzVmlzaWJsZSIsInNjcm9sbExvY2siLCJzY3JvbGxMb2NrRGVsYXkiLCJvcmlnaW5hbFNsaWRlIiwiYmFja3dhcmRzIiwibWluIiwicmVzcCIsInJlc3BvbnNpdmUiLCJzb3J0IiwiYnJlYWtwb2ludCIsInNpemUiLCJpbm5lcldpZHRoIiwic2Nyb2xsRHVyYXRpb24iLCJnZXRUaW1lIiwiYW5pbWF0ZUluZGV4IiwiYW5pbWF0ZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInJlbW92ZUl0ZW0iLCJkcmFnVmVsb2NpdHkiLCJkb3VibGUiLCJzdGVwIiwiaW52Iiwic2V0T3B0aW9uIiwiZ2xvYmFsIiwiZGVzdHJveSIsImNsb25lTm9kZSIsImNsZWFyIiwib3V0ZXJIVE1MIiwicmVwbGFjZUNoaWxkIiwiYXJnIiwiYnViYmxlcyIsImV2ZW50UHJvcGFnYXRlIiwiZGV0YWlsIiwiZXZlbnRIYW5kbGVyIiwic2V0dXBUZXN0aW1vbmlhbFNsaWRlciIsIm9mZmNhbnZhc0lkIiwib2ZmY2FudmFzIiwic2NyZWVuT3ZlcmxheSIsIm1vYmlsZU9mZmNhbnZhcyIsIm4iLCJ0aGlzIiwiciIsIm8iLCJBIiwicmVjYWxjdWxhdGUiLCJyZXNwb25zaXZlT3B0aW9ucyIsImRvY1dpZHRoIiwicyIsImJyZWFrQXQiLCJPIiwidXNlQ29udGFpbmVyRm9yQnJlYWtwb2ludHMiLCJjb2x1bW5zIiwibWFyZ2luIiwibW9iaWxlRmlyc3QiLCJ1Iiwicm93cyIsInAiLCJNIiwiY29scyIsIm1hY3lDb21wbGV0ZSIsInRtcFJvd3MiLCJmIiwibGFzdGNvbCIsIkMiLCJub2RlTmFtZSIsImJ5Q3NzIiwic2VsZWN0b3JzIiwic3Vic3RyaW5nIiwiZ2V0RWxlbWVudEJ5SWQiLCJydW4iLCJvbiIsImciLCJuYXR1cmFsSGVpZ2h0IiwibmF0dXJhbFdpZHRoIiwiRSIsImNvbXBsZXRlIiwiY29uc3RhbnRzIiwiRVZFTlRfSU1BR0VfTE9BRCIsImltZyIsIkVWRU5UX0lNQUdFX0VSUk9SIiwiRVZFTlRfSU1BR0VfQ09NUExFVEUiLCJJIiwiRVZFTlRfUkVTSVpFIiwicXVldWUiLCJOIiwiZGVidWciLCJjb25zb2xlIiwiVCIsInJlc2l6ZXIiLCJMIiwidXNlT3duSW1hZ2VMb2FkZXIiLCJ3YWl0Rm9ySW1hZ2VzIiwiRVZFTlRfSU5JVElBTElaRUQiLCJnZXRQcm9wZXJ0eVZhbHVlIiwiViIsIm9mZnNldFBhcmVudCIsInRydWVPcmRlciIsIkVWRU5UX1JFQ0FMQ1VMQVRFRCIsIlIiLCJ1c2VJbWFnZUxvYWRlciIsIm9uSW5pdCIsImNhbmNlbExlZ2FjeSIsInJhbmRvbSIsIndhcm4iLCJyZWNhbGN1bGF0ZU9uSW1hZ2VMb2FkIiwicnVuT25JbWFnZUxvYWQiLCJyZUluaXQiLCJNYWN5IiwiY3VycmVudCIsImN1cnJlbnRJZCIsInNldEN1cnJlbnQiLCJzdGF0ZSIsIm5vdGlmeSIsInBoYXNlU3ltYm9sIiwiU3ltYm9sIiwiaG9va1N5bWJvbCIsInVwZGF0ZVN5bWJvbCIsImNvbW1pdFN5bWJvbCIsImVmZmVjdHNTeW1ib2wiLCJsYXlvdXRFZmZlY3RzU3ltYm9sIiwiY29udGV4dEV2ZW50IiwiU3RhdGUiLCJNYXAiLCJyZXMiLCJwaGFzZSIsImVmZmVjdHMiLCJlZmZlY3QiLCJfcnVuRWZmZWN0cyIsImhvb2tzIiwiaG9vayIsInRlYXJkb3duIiwiZGVmZXIiLCJydW5uZXIiLCJ0YXNrcyIsInJ1blRhc2tzIiwidGFzayIsIkJhc2VTY2hlZHVsZXIiLCJyZW5kZXJlciIsIl91cGRhdGVRdWV1ZWQiLCJoYW5kbGVQaGFzZSIsImNvbW1pdCIsInJ1bkVmZmVjdHMiLCJyZW5kZXIiLCJ0b0NhbWVsQ2FzZSIsImNoYXIiLCJtYWtlQ29tcG9uZW50IiwiU2NoZWR1bGVyIiwiZnJhZyIsImJhc2VFbGVtZW50T3JPcHRpb25zIiwiQmFzZUVsZW1lbnQiLCJiYXNlRWxlbWVudCIsIkhUTUxFbGVtZW50Iiwib2JzZXJ2ZWRBdHRyaWJ1dGVzIiwidXNlU2hhZG93RE9NIiwic2hhZG93Um9vdEluaXQiLCJfc2NoZWR1bGVyIiwiYXR0YWNoU2hhZG93IiwibW9kZSIsInNoYWRvd1Jvb3QiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwiUmVmbGVjdCIsInNldCIsInJlZmxlY3RpdmVQcm9wIiwiaW5pdGlhbFZhbHVlIiwiZnJlZXplIiwiZW51bWVyYWJsZSIsImNvbmZpZ3VyYWJsZSIsInByb3RvIiwiUHJveHkiLCJyZWNlaXZlciIsImRlc2MiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJ3cml0YWJsZSIsInNldFByb3RvdHlwZU9mIiwiSG9vayIsImNyZWF0ZUVmZmVjdCIsInNldEVmZmVjdHMiLCJpZ25vcmVkMSIsImlnbm9yZWQyIiwidmFsdWVzIiwibGFzdFZhbHVlcyIsImhhc0NoYW5nZWQiLCJfdGVhcmRvd24iLCJzb21lIiwidXNlRWZmZWN0IiwidXNlQ29udGV4dCIsIl91cGRhdGVyIiwiX3JhbkVmZmVjdCIsIl91bnN1YnNjcmliZSIsIkNvbnRleHQiLCJ2aXJ0dWFsIiwiX3N1YnNjcmliZSIsImNvbXBvc2VkIiwidW5zdWJzY3JpYmUiLCJkZWZhdWx0VmFsdWUiLCJtYWtlQ29udGV4dCIsIlByb3ZpZGVyIiwibGlzdGVuZXJzIiwiU2V0IiwiX3ZhbHVlIiwiQ29uc3VtZXIiLCJ1c2VNZW1vIiwidXNlQ2FsbGJhY2siLCJpbnB1dHMiLCJzZXRMYXlvdXRFZmZlY3RzIiwidXNlTGF5b3V0RWZmZWN0IiwidXNlU3RhdGUiLCJ1cGRhdGVyIiwibWFrZUFyZ3MiLCJ1cGRhdGVyRm4iLCJwcmV2aW91c1ZhbHVlIiwidXNlUmVkdWNlciIsImluaXRpYWxTdGF0ZSIsImRpc3BhdGNoIiwiY3VycmVudFN0YXRlIiwicmVkdWNlciIsInVzZVJlZiIsImhhdW50ZWQiLCJjcmVhdGVDb250ZXh0IiwidXNlRGVib3VuY2VkQ2FsbGJhY2siLCJmdW5jIiwicmF3V2FpdCIsImxlYWRpbmciLCJ0cmFpbGluZyIsImxhc3RDYWxsVGltZSIsImxhc3RJbnZva2VUaW1lIiwidGltZXJJZCIsImxhc3RBcmdzIiwibGFzdFRoaXMiLCJmdW5jUmVmIiwibW91bnRlZCIsInVzZVJBRiIsIndhaXQiLCJtYXhpbmciLCJtYXhXYWl0IiwiaW52b2tlRnVuYyIsInRpbWUiLCJzdGFydFRpbWVyIiwicGVuZGluZ0Z1bmMiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImNhbmNlbFRpbWVyIiwicmVtYWluaW5nV2FpdCIsInRpbWVTaW5jZUxhc3RDYWxsIiwidGltZVNpbmNlTGFzdEludm9rZSIsInRpbWVXYWl0aW5nIiwic2hvdWxkSW52b2tlIiwidHJhaWxpbmdFZGdlIiwidGltZXJFeHBpcmVkIiwibGVhZGluZ0VkZ2UiLCJmbHVzaCIsImRlYm91bmNlZCIsImlzSW52b2tpbmciLCJwZW5kaW5nIiwiZGVib3VuY2VkU3RhdGUiLCJwcmVkaWN0aXZlU2VhcmNoIiwic2V0USIsInNldFJlc3VsdHMiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsInNldFZhbHVlIiwicmVzb3VyY2VzIiwiaGFuZGxlS2V5dXAiLCJodG1sIiwiY3VzdG9tRWxlbWVudHMiLCJkZWZpbmUiLCJhdGNEcm9wZG93bklucHV0cyIsImRhdGFQcm9kdWN0IiwiZGF0YVNlbGVjdGVkT3JGaXJzdEF2YWlsYWJsZVZhcmlhbnQiLCJkYXRhT3B0aW9uc1dpdGhWYWx1ZXMiLCJzZWxlY3RvcldyYXBwZXJDdXN0b21DbGFzc2VzIiwic2VsZWN0b3JMYWJlbEN1c3RvbUNsYXNzZXMiLCJzZWxlY3RvckN1c3RvbUNsYXNzZXMiLCJxdWFudGl0eUlucHV0Q3VzdG9tQ2xhc3NlcyIsImF0Y0J1dHRvbkN1c3RvbUNsYXNzZXMiLCJvcHRpb25zV2l0aFZhbHVlcyIsInZhcmlhbnRzIiwiZmluZCIsInZhcmlhbnQiLCJjdXJyZW50VmFyaWFudCIsInNldEN1cnJlbnRWYXJpYW50Iiwic2V0U3RhdHVzIiwiZXJyb3JEZXNjcmlwdGlvbiIsInNldEVycm9yRGVzY3JpcHRpb24iLCJoYW5kbGVPcHRpb25DaGFuZ2UiLCJvcHRpb24xIiwib3B0aW9uMiIsIm9wdGlvbjMiLCJjVmFyaWFudCIsImhhbmRsZUFUQ0J1dHRvbkNsaWNrIiwiYWRkZWRJdGVtIiwiY2FydCIsImF2YWlsYWJsZSIsImNvbGxlY3Rpb25JdGVtIiwiY29sbGVjdGlvbkhhbmRsZSIsImNvbGxlY3Rpb25UaXRsZSIsImRhdGFUYWciLCJzZXRDb2xsZWN0aW9uIiwiaGFuZGxlQ2xpY2siLCJvcmlnaW5hbEV2ZW50IiwiYXRjUmFkaW9idXR0b25Gb3JtIiwiZGF0b21hciIsIkJTTiIsImFwaXMiLCJoZWxwZXIiXSwibWFwcGluZ3MiOiI7Ozs7O0VBQUE7Ozs7O0VBS0EsSUFBSUEsa0JBQWtCLEdBQUcsc0JBQXNCQyxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBcEMsR0FBNEMscUJBQTVDLEdBQW9FLGVBQTdGO0VBRUEsSUFBSUMsaUJBQWlCLEdBQUcsc0JBQXNCSCxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBcEMsSUFBNkMsZ0JBQWdCRixRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBbkc7RUFF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
