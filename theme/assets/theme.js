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

  function ajaxAPICreator (axiosConfig) {
    var instance = axios$1.create(axiosConfig);
    return {
      getCart: function getCart() {
        return instance.get('/cart.js');
      },
      getProduct: function getProduct(handle) {
        return instance.get("/products/".concat(handle, ".js"));
      },
      clearCart: function clearCart() {
        return instance.post('/cart/clear.js');
      },
      updateCartFromForm: function updateCartFromForm(form) {
        return instance.post('/cart/update.js', new FormData(form));
      },
      changeItemByKeyOrId: function changeItemByKeyOrId(keyOrId, quantity) {
        return instance.post('/cart/change.js', {
          quantity: quantity,
          id: keyOrId
        });
      },
      removeItemByKeyOrId: function removeItemByKeyOrId(keyOrId) {
        return instance.post('/cart/change.js', {
          quantity: 0,
          id: keyOrId
        });
      },
      changeItemByLine: function changeItemByLine(line, quantity) {
        return instance.post('/cart/change.js', {
          quantity: quantity,
          line: line
        });
      },
      removeItemByLine: function removeItemByLine(line) {
        return instance.post('/cart/change.js', {
          quantity: 0,
          line: line
        });
      },
      addItem: function addItem(id, quantity, properties) {
        return instance.post('/cart/add.js', {
          id: id,
          quantity: quantity,
          properties: properties
        });
      },
      addItemFromForm: function addItemFromForm(form) {
        return instance.post('/cart/add.js', new FormData(form));
      },
      updateCartAttributes: function updateCartAttributes(attributes) {
        var data = '';

        if (Array.isArray(attributes)) {
          attributes.forEach(function (attribute) {
            var key = attributeToString(attribute.key);

            if (key !== '') {
              data += 'attributes[' + key + ']=' + attributeToString(attribute.value) + '&';
            }
          });
        } else if (_typeof(attributes) === 'object' && attributes !== null) {
          Object.keys(attributes).forEach(function (key) {
            var value = attributes[key];
            data += 'attributes[' + attributeToString(key) + ']=' + attributeToString(value) + '&';
          });
        }

        return instance.post('/cart/update.js', data);
      },
      updateCartNote: function updateCartNote(note) {
        return instance.post('/cart/update.js', "note=".concat(attributeToString(note)));
      }
    };
  }

  // code for testimonials
  window.addEventListener('load', function () {
    new Glider(document.querySelector('.glider'), {
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
  });

  document.addEventListener('click', function (event) {
    var target = event.target;

    if (target.closest('.dropdown-menu')) {
      console.log('prevent dropdown menu from closing');
      event.stopPropagation();
    } // class="navbar-toggler" data-trigger="#navbar_main"


    if (target.closest('.navbar-toggler[data-trigger]')) {
      event.preventDefault();
      event.stopPropagation();
      var offcanvas_id = target.closest('.navbar-toggler[data-trigger]').getAttribute('data-trigger');
      var offcanvas = document.querySelector(offcanvas_id);

      if (offcanvas) {
        toggleClass(offcanvas, 'show');
      }

      toggleClass(document.body, 'offcanvas-active');
      var screen_overlay = document.querySelector('.screen-overlay');

      if (screen_overlay) {
        toggleClass(screen_overlay, 'show');
      }
    }

    if (target.closest('.btn-close, .screen-overlay')) {
      var _screen_overlay = document.querySelector('.screen-overlay');

      if (_screen_overlay) {
        removeClass(_screen_overlay, 'show');
      }

      var mobile_offcanvas = document.querySelector('.mobile-offcanvas');

      if (mobile_offcanvas) {
        removeClass(mobile_offcanvas, 'show');
      }

      removeClass(document.body, 'offcanvas-active');
    }
  });

  window.datomar = {
    BSN: index,
    api: ajaxAPICreator({})
  };

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ib290c3RyYXAubmF0aXZlL2Rpc3QvYm9vdHN0cmFwLW5hdGl2ZS5lc20uanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvaGVscGVyLmpzIiwic3JjL3NjcmlwdHMvYWpheGFwaS5qcyIsInNyYy9zY3JpcHRzL3NlY3Rpb25zL3Rlc3RpbW9uaWFscy5qcyIsInNyYy9zY3JpcHRzL3NlY3Rpb25zL2hlYWRlci5qcyIsInNyYy9zY3JpcHRzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICAqIE5hdGl2ZSBKYXZhU2NyaXB0IGZvciBCb290c3RyYXAgdjMuMC4xMCAoaHR0cHM6Ly90aGVkbnAuZ2l0aHViLmlvL2Jvb3RzdHJhcC5uYXRpdmUvKVxuICAqIENvcHlyaWdodCAyMDE1LTIwMjAgwqkgZG5wX3RoZW1lXG4gICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdGhlZG5wL2Jvb3RzdHJhcC5uYXRpdmUvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAgKi9cbnZhciB0cmFuc2l0aW9uRW5kRXZlbnQgPSAnd2Via2l0VHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuaGVhZC5zdHlsZSA/ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyA6ICd0cmFuc2l0aW9uZW5kJztcblxudmFyIHN1cHBvcnRUcmFuc2l0aW9uID0gJ3dlYmtpdFRyYW5zaXRpb24nIGluIGRvY3VtZW50LmhlYWQuc3R5bGUgfHwgJ3RyYW5zaXRpb24nIGluIGRvY3VtZW50LmhlYWQuc3R5bGU7XG5cbnZhciB0cmFuc2l0aW9uRHVyYXRpb24gPSAnd2Via2l0VHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuaGVhZC5zdHlsZSA/ICd3ZWJraXRUcmFuc2l0aW9uRHVyYXRpb24nIDogJ3RyYW5zaXRpb25EdXJhdGlvbic7XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24oZWxlbWVudCkge1xuICB2YXIgZHVyYXRpb24gPSBzdXBwb3J0VHJhbnNpdGlvbiA/IHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KVt0cmFuc2l0aW9uRHVyYXRpb25dKSA6IDA7XG4gIGR1cmF0aW9uID0gdHlwZW9mIGR1cmF0aW9uID09PSAnbnVtYmVyJyAmJiAhaXNOYU4oZHVyYXRpb24pID8gZHVyYXRpb24gKiAxMDAwIDogMDtcbiAgcmV0dXJuIGR1cmF0aW9uO1xufVxuXG5mdW5jdGlvbiBlbXVsYXRlVHJhbnNpdGlvbkVuZChlbGVtZW50LGhhbmRsZXIpe1xuICB2YXIgY2FsbGVkID0gMCwgZHVyYXRpb24gPSBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKGVsZW1lbnQpO1xuICBkdXJhdGlvbiA/IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggdHJhbnNpdGlvbkVuZEV2ZW50LCBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kV3JhcHBlcihlKXtcbiAgICAgICAgICAgICAgIWNhbGxlZCAmJiBoYW5kbGVyKGUpLCBjYWxsZWQgPSAxO1xuICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoIHRyYW5zaXRpb25FbmRFdmVudCwgdHJhbnNpdGlvbkVuZFdyYXBwZXIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyAhY2FsbGVkICYmIGhhbmRsZXIoKSwgY2FsbGVkID0gMTsgfSwgMTcpO1xufVxuXG5mdW5jdGlvbiBxdWVyeUVsZW1lbnQoc2VsZWN0b3IsIHBhcmVudCkge1xuICB2YXIgbG9va1VwID0gcGFyZW50ICYmIHBhcmVudCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBwYXJlbnQgOiBkb2N1bWVudDtcbiAgcmV0dXJuIHNlbGVjdG9yIGluc3RhbmNlb2YgRWxlbWVudCA/IHNlbGVjdG9yIDogbG9va1VwLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBib290c3RyYXBDdXN0b21FdmVudChldmVudE5hbWUsIGNvbXBvbmVudE5hbWUsIHJlbGF0ZWQpIHtcbiAgdmFyIE9yaWdpbmFsQ3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoIGV2ZW50TmFtZSArICcuYnMuJyArIGNvbXBvbmVudE5hbWUsIHtjYW5jZWxhYmxlOiB0cnVlfSk7XG4gIE9yaWdpbmFsQ3VzdG9tRXZlbnQucmVsYXRlZFRhcmdldCA9IHJlbGF0ZWQ7XG4gIHJldHVybiBPcmlnaW5hbEN1c3RvbUV2ZW50O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEN1c3RvbUV2ZW50KGN1c3RvbUV2ZW50KXtcbiAgdGhpcyAmJiB0aGlzLmRpc3BhdGNoRXZlbnQoY3VzdG9tRXZlbnQpO1xufVxuXG5mdW5jdGlvbiBBbGVydChlbGVtZW50KSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBhbGVydCxcbiAgICBjbG9zZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2Nsb3NlJywnYWxlcnQnKSxcbiAgICBjbG9zZWRDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdjbG9zZWQnLCdhbGVydCcpO1xuICBmdW5jdGlvbiB0cmlnZ2VySGFuZGxlcigpIHtcbiAgICBhbGVydC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKGFsZXJ0LHRyYW5zaXRpb25FbmRIYW5kbGVyKSA6IHRyYW5zaXRpb25FbmRIYW5kbGVyKCk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbil7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgnY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgZnVuY3Rpb24gY2xpY2tIYW5kbGVyKGUpIHtcbiAgICBhbGVydCA9IGUgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5hbGVydFwiKTtcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KCdbZGF0YS1kaXNtaXNzPVwiYWxlcnRcIl0nLGFsZXJ0KTtcbiAgICBlbGVtZW50ICYmIGFsZXJ0ICYmIChlbGVtZW50ID09PSBlLnRhcmdldCB8fCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSkgJiYgc2VsZi5jbG9zZSgpO1xuICB9XG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRIYW5kbGVyKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGFsZXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYWxlcnQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhbGVydCxjbG9zZWRDdXN0b21FdmVudCk7XG4gIH1cbiAgc2VsZi5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIGFsZXJ0ICYmIGVsZW1lbnQgJiYgYWxlcnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoYWxlcnQsY2xvc2VDdXN0b21FdmVudCk7XG4gICAgICBpZiAoIGNsb3NlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICBzZWxmLmRpc3Bvc2UoKTtcbiAgICAgIGFsZXJ0LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgIHRyaWdnZXJIYW5kbGVyKCk7XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgZGVsZXRlIGVsZW1lbnQuQWxlcnQ7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGFsZXJ0ID0gZWxlbWVudC5jbG9zZXN0KCcuYWxlcnQnKTtcbiAgZWxlbWVudC5BbGVydCAmJiBlbGVtZW50LkFsZXJ0LmRpc3Bvc2UoKTtcbiAgaWYgKCAhZWxlbWVudC5BbGVydCApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgc2VsZi5lbGVtZW50ID0gZWxlbWVudDtcbiAgZWxlbWVudC5BbGVydCA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIEJ1dHRvbihlbGVtZW50KSB7XG4gIHZhciBzZWxmID0gdGhpcywgbGFiZWxzLFxuICAgICAgY2hhbmdlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnY2hhbmdlJywgJ2J1dHRvbicpO1xuICBmdW5jdGlvbiB0b2dnbGUoZSkge1xuICAgIHZhciBpbnB1dCxcbiAgICAgICAgbGFiZWwgPSBlLnRhcmdldC50YWdOYW1lID09PSAnTEFCRUwnID8gZS50YXJnZXRcbiAgICAgICAgICAgICAgOiBlLnRhcmdldC5jbG9zZXN0KCdMQUJFTCcpID8gZS50YXJnZXQuY2xvc2VzdCgnTEFCRUwnKSA6IG51bGw7XG4gICAgaW5wdXQgPSBsYWJlbCAmJiBsYWJlbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnSU5QVVQnKVswXTtcbiAgICBpZiAoICFpbnB1dCApIHsgcmV0dXJuOyB9XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGlucHV0LCBjaGFuZ2VDdXN0b21FdmVudCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGNoYW5nZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoIGlucHV0LnR5cGUgPT09ICdjaGVja2JveCcgKSB7XG4gICAgICBpZiAoIGNoYW5nZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgICAgaWYgKCAhaW5wdXQuY2hlY2tlZCApIHtcbiAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIGlucHV0LmdldEF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIGlucHV0LmdldEF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCFlbGVtZW50LnRvZ2dsZWQpIHtcbiAgICAgICAgZWxlbWVudC50b2dnbGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCBpbnB1dC50eXBlID09PSAncmFkaW8nICYmICFlbGVtZW50LnRvZ2dsZWQgKSB7XG4gICAgICBpZiAoIGNoYW5nZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgICAgaWYgKCAhaW5wdXQuY2hlY2tlZCB8fCAoZS5zY3JlZW5YID09PSAwICYmIGUuc2NyZWVuWSA9PSAwKSApIHtcbiAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2ZvY3VzJyk7XG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIGVsZW1lbnQudG9nZ2xlZCA9IHRydWU7XG4gICAgICAgIEFycmF5LmZyb20obGFiZWxzKS5tYXAoZnVuY3Rpb24gKG90aGVyTGFiZWwpe1xuICAgICAgICAgIHZhciBvdGhlcklucHV0ID0gb3RoZXJMYWJlbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnSU5QVVQnKVswXTtcbiAgICAgICAgICBpZiAoIG90aGVyTGFiZWwgIT09IGxhYmVsICYmIG90aGVyTGFiZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSApICB7XG4gICAgICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwob3RoZXJJbnB1dCwgY2hhbmdlQ3VzdG9tRXZlbnQpO1xuICAgICAgICAgICAgb3RoZXJMYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIG90aGVySW5wdXQucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICBvdGhlcklucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7IGVsZW1lbnQudG9nZ2xlZCA9IGZhbHNlOyB9LCA1MCApO1xuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBrZXkgPT09IDMyICYmIGUudGFyZ2V0ID09PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIHRvZ2dsZShlKTtcbiAgfVxuICBmdW5jdGlvbiBwcmV2ZW50U2Nyb2xsKGUpIHtcbiAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAga2V5ID09PSAzMiAmJiBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbiAgZnVuY3Rpb24gZm9jdXNUb2dnbGUoZSkge1xuICAgIGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnSU5QVVQnICkge1xuICAgICAgdmFyIGFjdGlvbiA9IGUudHlwZSA9PT0gJ2ZvY3VzaW4nID8gJ2FkZCcgOiAncmVtb3ZlJztcbiAgICAgIGUudGFyZ2V0LmNsb3Nlc3QoJy5idG4nKS5jbGFzc0xpc3RbYWN0aW9uXSgnZm9jdXMnKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0oJ2NsaWNrJyx0b2dnbGUsZmFsc2UgKTtcbiAgICBlbGVtZW50W2FjdGlvbl0oJ2tleXVwJyxrZXlIYW5kbGVyLGZhbHNlKSwgZWxlbWVudFthY3Rpb25dKCdrZXlkb3duJyxwcmV2ZW50U2Nyb2xsLGZhbHNlKTtcbiAgICBlbGVtZW50W2FjdGlvbl0oJ2ZvY3VzaW4nLGZvY3VzVG9nZ2xlLGZhbHNlKSwgZWxlbWVudFthY3Rpb25dKCdmb2N1c291dCcsZm9jdXNUb2dnbGUsZmFsc2UpO1xuICB9XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5CdXR0b247XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuQnV0dG9uICYmIGVsZW1lbnQuQnV0dG9uLmRpc3Bvc2UoKTtcbiAgbGFiZWxzID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdidG4nKTtcbiAgaWYgKCFsYWJlbHMubGVuZ3RoKSB7IHJldHVybjsgfVxuICBpZiAoICFlbGVtZW50LkJ1dHRvbiApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgZWxlbWVudC50b2dnbGVkID0gZmFsc2U7XG4gIGVsZW1lbnQuQnV0dG9uID0gc2VsZjtcbiAgQXJyYXkuZnJvbShsYWJlbHMpLm1hcChmdW5jdGlvbiAoYnRuKXtcbiAgICAhYnRuLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJylcbiAgICAgICYmIHF1ZXJ5RWxlbWVudCgnaW5wdXQ6Y2hlY2tlZCcsYnRuKVxuICAgICAgJiYgYnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIGJ0bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpXG4gICAgICAmJiAhcXVlcnlFbGVtZW50KCdpbnB1dDpjaGVja2VkJyxidG4pXG4gICAgICAmJiBidG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gIH0pO1xufVxuXG52YXIgbW91c2VIb3ZlckV2ZW50cyA9ICgnb25tb3VzZWxlYXZlJyBpbiBkb2N1bWVudCkgPyBbICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSA6IFsgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcgXTtcblxudmFyIHN1cHBvcnRQYXNzaXZlID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIHdyYXAoKXtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCB3cmFwLCBvcHRzKTtcbiAgICB9LCBvcHRzKTtcbiAgfSBjYXRjaCAoZSkge31cbiAgcmV0dXJuIHJlc3VsdDtcbn0pKCk7XG5cbnZhciBwYXNzaXZlSGFuZGxlciA9IHN1cHBvcnRQYXNzaXZlID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZTtcblxuZnVuY3Rpb24gaXNFbGVtZW50SW5TY3JvbGxSYW5nZShlbGVtZW50KSB7XG4gIHZhciBiY3IgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgdmlld3BvcnRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgcmV0dXJuIGJjci50b3AgPD0gdmlld3BvcnRIZWlnaHQgJiYgYmNyLmJvdHRvbSA+PSAwO1xufVxuXG5mdW5jdGlvbiBDYXJvdXNlbCAoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgdmFycywgb3BzLFxuICAgIHNsaWRlQ3VzdG9tRXZlbnQsIHNsaWRDdXN0b21FdmVudCxcbiAgICBzbGlkZXMsIGxlZnRBcnJvdywgcmlnaHRBcnJvdywgaW5kaWNhdG9yLCBpbmRpY2F0b3JzO1xuICBmdW5jdGlvbiBwYXVzZUhhbmRsZXIoKSB7XG4gICAgaWYgKCBvcHMuaW50ZXJ2YWwgIT09ZmFsc2UgJiYgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncGF1c2VkJyk7XG4gICAgICAhdmFycy5pc1NsaWRpbmcgJiYgKCBjbGVhckludGVydmFsKHZhcnMudGltZXIpLCB2YXJzLnRpbWVyID0gbnVsbCApO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiByZXN1bWVIYW5kbGVyKCkge1xuICAgIGlmICggb3BzLmludGVydmFsICE9PSBmYWxzZSAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3BhdXNlZCcpO1xuICAgICAgIXZhcnMuaXNTbGlkaW5nICYmICggY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKSwgdmFycy50aW1lciA9IG51bGwgKTtcbiAgICAgICF2YXJzLmlzU2xpZGluZyAmJiBzZWxmLmN5Y2xlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGluZGljYXRvckhhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodmFycy5pc1NsaWRpbmcpIHsgcmV0dXJuOyB9XG4gICAgdmFyIGV2ZW50VGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKCBldmVudFRhcmdldCAmJiAhZXZlbnRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSAmJiBldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xpZGUtdG8nKSApIHtcbiAgICAgIHZhcnMuaW5kZXggPSBwYXJzZUludCggZXZlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNsaWRlLXRvJykpO1xuICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZTsgfVxuICAgIHNlbGYuc2xpZGVUbyggdmFycy5pbmRleCApO1xuICB9XG4gIGZ1bmN0aW9uIGNvbnRyb2xzSGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICB2YXIgZXZlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGlmICggZXZlbnRUYXJnZXQgPT09IHJpZ2h0QXJyb3cgKSB7XG4gICAgICB2YXJzLmluZGV4Kys7XG4gICAgfSBlbHNlIGlmICggZXZlbnRUYXJnZXQgPT09IGxlZnRBcnJvdyApIHtcbiAgICAgIHZhcnMuaW5kZXgtLTtcbiAgICB9XG4gICAgc2VsZi5zbGlkZVRvKCB2YXJzLmluZGV4ICk7XG4gIH1cbiAgZnVuY3Rpb24ga2V5SGFuZGxlcihyZWYpIHtcbiAgICB2YXIgd2hpY2ggPSByZWYud2hpY2g7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHN3aXRjaCAod2hpY2gpIHtcbiAgICAgIGNhc2UgMzk6XG4gICAgICAgIHZhcnMuaW5kZXgrKztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM3OlxuICAgICAgICB2YXJzLmluZGV4LS07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgIH1cbiAgICBzZWxmLnNsaWRlVG8oIHZhcnMuaW5kZXggKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGlmICggb3BzLnBhdXNlICYmIG9wcy5pbnRlcnZhbCApIHtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggbW91c2VIb3ZlckV2ZW50c1swXSwgcGF1c2VIYW5kbGVyLCBmYWxzZSApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzFdLCByZXN1bWVIYW5kbGVyLCBmYWxzZSApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHBhdXNlSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggJ3RvdWNoZW5kJywgcmVzdW1lSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB9XG4gICAgb3BzLnRvdWNoICYmIHNsaWRlcy5sZW5ndGggPiAxICYmIGVsZW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCB0b3VjaERvd25IYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIHJpZ2h0QXJyb3cgJiYgcmlnaHRBcnJvd1thY3Rpb25dKCAnY2xpY2snLCBjb250cm9sc0hhbmRsZXIsZmFsc2UgKTtcbiAgICBsZWZ0QXJyb3cgJiYgbGVmdEFycm93W2FjdGlvbl0oICdjbGljaycsIGNvbnRyb2xzSGFuZGxlcixmYWxzZSApO1xuICAgIGluZGljYXRvciAmJiBpbmRpY2F0b3JbYWN0aW9uXSggJ2NsaWNrJywgaW5kaWNhdG9ySGFuZGxlcixmYWxzZSApO1xuICAgIG9wcy5rZXlib2FyZCAmJiB3aW5kb3dbYWN0aW9uXSggJ2tleWRvd24nLCBrZXlIYW5kbGVyLGZhbHNlICk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlVG91Y2hFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGVsZW1lbnRbYWN0aW9uXSggJ3RvdWNobW92ZScsIHRvdWNoTW92ZUhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2hlbmQnLCB0b3VjaEVuZEhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hEb3duSGFuZGxlcihlKSB7XG4gICAgaWYgKCB2YXJzLmlzVG91Y2ggKSB7IHJldHVybjsgfVxuICAgIHZhcnMudG91Y2hQb3NpdGlvbi5zdGFydFggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYO1xuICAgIGlmICggZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkgKSB7XG4gICAgICB2YXJzLmlzVG91Y2ggPSB0cnVlO1xuICAgICAgdG9nZ2xlVG91Y2hFdmVudHMoMSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvdWNoTW92ZUhhbmRsZXIoZSkge1xuICAgIGlmICggIXZhcnMuaXNUb3VjaCApIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyByZXR1cm47IH1cbiAgICB2YXJzLnRvdWNoUG9zaXRpb24uY3VycmVudFggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYO1xuICAgIGlmICggZS50eXBlID09PSAndG91Y2htb3ZlJyAmJiBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA+IDEgKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvdWNoRW5kSGFuZGxlciAoZSkge1xuICAgIGlmICggIXZhcnMuaXNUb3VjaCB8fCB2YXJzLmlzU2xpZGluZyApIHsgcmV0dXJuIH1cbiAgICB2YXJzLnRvdWNoUG9zaXRpb24uZW5kWCA9IHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCB8fCBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYO1xuICAgIGlmICggdmFycy5pc1RvdWNoICkge1xuICAgICAgaWYgKCAoIWVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpIHx8ICFlbGVtZW50LmNvbnRhaW5zKGUucmVsYXRlZFRhcmdldCkgKVxuICAgICAgICAgICYmIE1hdGguYWJzKHZhcnMudG91Y2hQb3NpdGlvbi5zdGFydFggLSB2YXJzLnRvdWNoUG9zaXRpb24uZW5kWCkgPCA3NSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCB2YXJzLnRvdWNoUG9zaXRpb24uY3VycmVudFggPCB2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYICkge1xuICAgICAgICAgIHZhcnMuaW5kZXgrKztcbiAgICAgICAgfSBlbHNlIGlmICggdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYID4gdmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCApIHtcbiAgICAgICAgICB2YXJzLmluZGV4LS07XG4gICAgICAgIH1cbiAgICAgICAgdmFycy5pc1RvdWNoID0gZmFsc2U7XG4gICAgICAgIHNlbGYuc2xpZGVUbyh2YXJzLmluZGV4KTtcbiAgICAgIH1cbiAgICAgIHRvZ2dsZVRvdWNoRXZlbnRzKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldEFjdGl2ZVBhZ2UocGFnZUluZGV4KSB7XG4gICAgQXJyYXkuZnJvbShpbmRpY2F0b3JzKS5tYXAoZnVuY3Rpb24gKHgpe3guY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7fSk7XG4gICAgaW5kaWNhdG9yc1twYWdlSW5kZXhdICYmIGluZGljYXRvcnNbcGFnZUluZGV4XS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgfVxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kSGFuZGxlcihlKXtcbiAgICBpZiAodmFycy50b3VjaFBvc2l0aW9uKXtcbiAgICAgIHZhciBuZXh0ID0gdmFycy5pbmRleCxcbiAgICAgICAgICB0aW1lb3V0ID0gZSAmJiBlLnRhcmdldCAhPT0gc2xpZGVzW25leHRdID8gZS5lbGFwc2VkVGltZSoxMDAwKzEwMCA6IDIwLFxuICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBzZWxmLmdldEFjdGl2ZUluZGV4KCksXG4gICAgICAgICAgb3JpZW50YXRpb24gPSB2YXJzLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ25leHQnIDogJ3ByZXYnO1xuICAgICAgdmFycy5pc1NsaWRpbmcgJiYgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh2YXJzLnRvdWNoUG9zaXRpb24pe1xuICAgICAgICAgIHZhcnMuaXNTbGlkaW5nID0gZmFsc2U7XG4gICAgICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgIHNsaWRlc1thY3RpdmVJdGVtXS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LnJlbW92ZSgoXCJjYXJvdXNlbC1pdGVtLVwiICsgb3JpZW50YXRpb24pKTtcbiAgICAgICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LnJlbW92ZSgoXCJjYXJvdXNlbC1pdGVtLVwiICsgKHZhcnMuZGlyZWN0aW9uKSkpO1xuICAgICAgICAgIHNsaWRlc1thY3RpdmVJdGVtXS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNsaWRDdXN0b21FdmVudCk7XG4gICAgICAgICAgaWYgKCAhZG9jdW1lbnQuaGlkZGVuICYmIG9wcy5pbnRlcnZhbCAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BhdXNlZCcpICkge1xuICAgICAgICAgICAgc2VsZi5jeWNsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgdGltZW91dCk7XG4gICAgfVxuICB9XG4gIHNlbGYuY3ljbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHZhcnMudGltZXIpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodmFycy50aW1lcik7XG4gICAgICB2YXJzLnRpbWVyID0gbnVsbDtcbiAgICB9XG4gICAgdmFycy50aW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpZHggPSB2YXJzLmluZGV4IHx8IHNlbGYuZ2V0QWN0aXZlSW5kZXgoKTtcbiAgICAgIGlzRWxlbWVudEluU2Nyb2xsUmFuZ2UoZWxlbWVudCkgJiYgKGlkeCsrLCBzZWxmLnNsaWRlVG8oIGlkeCApICk7XG4gICAgfSwgb3BzLmludGVydmFsKTtcbiAgfTtcbiAgc2VsZi5zbGlkZVRvID0gZnVuY3Rpb24gKG5leHQpIHtcbiAgICBpZiAodmFycy5pc1NsaWRpbmcpIHsgcmV0dXJuOyB9XG4gICAgdmFyIGFjdGl2ZUl0ZW0gPSBzZWxmLmdldEFjdGl2ZUluZGV4KCksIG9yaWVudGF0aW9uO1xuICAgIGlmICggYWN0aXZlSXRlbSA9PT0gbmV4dCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgICggKGFjdGl2ZUl0ZW0gPCBuZXh0ICkgfHwgKGFjdGl2ZUl0ZW0gPT09IDAgJiYgbmV4dCA9PT0gc2xpZGVzLmxlbmd0aCAtMSApICkge1xuICAgICAgdmFycy5kaXJlY3Rpb24gPSAnbGVmdCc7XG4gICAgfSBlbHNlIGlmICAoIChhY3RpdmVJdGVtID4gbmV4dCkgfHwgKGFjdGl2ZUl0ZW0gPT09IHNsaWRlcy5sZW5ndGggLSAxICYmIG5leHQgPT09IDAgKSApIHtcbiAgICAgIHZhcnMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcbiAgICB9XG4gICAgaWYgKCBuZXh0IDwgMCApIHsgbmV4dCA9IHNsaWRlcy5sZW5ndGggLSAxOyB9XG4gICAgZWxzZSBpZiAoIG5leHQgPj0gc2xpZGVzLmxlbmd0aCApeyBuZXh0ID0gMDsgfVxuICAgIG9yaWVudGF0aW9uID0gdmFycy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICduZXh0JyA6ICdwcmV2JztcbiAgICBzbGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3NsaWRlJywgJ2Nhcm91c2VsJywgc2xpZGVzW25leHRdKTtcbiAgICBzbGlkQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2xpZCcsICdjYXJvdXNlbCcsIHNsaWRlc1tuZXh0XSk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNsaWRlQ3VzdG9tRXZlbnQpO1xuICAgIGlmIChzbGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFycy5pbmRleCA9IG5leHQ7XG4gICAgdmFycy5pc1NsaWRpbmcgPSB0cnVlO1xuICAgIGNsZWFySW50ZXJ2YWwodmFycy50aW1lcik7XG4gICAgdmFycy50aW1lciA9IG51bGw7XG4gICAgc2V0QWN0aXZlUGFnZSggbmV4dCApO1xuICAgIGlmICggZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihzbGlkZXNbbmV4dF0pICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzbGlkZScpICkge1xuICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5hZGQoKFwiY2Fyb3VzZWwtaXRlbS1cIiArIG9yaWVudGF0aW9uKSk7XG4gICAgICBzbGlkZXNbbmV4dF0ub2Zmc2V0V2lkdGg7XG4gICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgoXCJjYXJvdXNlbC1pdGVtLVwiICsgKHZhcnMuZGlyZWN0aW9uKSkpO1xuICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5hZGQoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKHNsaWRlc1tuZXh0XSwgdHJhbnNpdGlvbkVuZEhhbmRsZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICBzbGlkZXNbbmV4dF0ub2Zmc2V0V2lkdGg7XG4gICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFycy5pc1NsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKCBvcHMuaW50ZXJ2YWwgJiYgZWxlbWVudCAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BhdXNlZCcpICkge1xuICAgICAgICAgIHNlbGYuY3ljbGUoKTtcbiAgICAgICAgfVxuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZEN1c3RvbUV2ZW50KTtcbiAgICAgIH0sIDEwMCApO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5nZXRBY3RpdmVJbmRleCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEFycmF5LmZyb20oc2xpZGVzKS5pbmRleE9mKGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtaXRlbSBhY3RpdmUnKVswXSkgfHwgMDsgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpdGVtQ2xhc3NlcyA9IFsnbGVmdCcsJ3JpZ2h0JywncHJldicsJ25leHQnXTtcbiAgICBBcnJheS5mcm9tKHNsaWRlcykubWFwKGZ1bmN0aW9uIChzbGlkZSxpZHgpIHtcbiAgICAgIHNsaWRlLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgJiYgc2V0QWN0aXZlUGFnZSggaWR4ICk7XG4gICAgICBpdGVtQ2xhc3Nlcy5tYXAoZnVuY3Rpb24gKGNscykgeyByZXR1cm4gc2xpZGUuY2xhc3NMaXN0LnJlbW92ZSgoXCJjYXJvdXNlbC1pdGVtLVwiICsgY2xzKSk7IH0pO1xuICAgIH0pO1xuICAgIGNsZWFySW50ZXJ2YWwodmFycy50aW1lcik7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgdmFycyA9IHt9O1xuICAgIG9wcyA9IHt9O1xuICAgIGRlbGV0ZSBlbGVtZW50LkNhcm91c2VsO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KCBlbGVtZW50ICk7XG4gIGVsZW1lbnQuQ2Fyb3VzZWwgJiYgZWxlbWVudC5DYXJvdXNlbC5kaXNwb3NlKCk7XG4gIHNsaWRlcyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtaXRlbScpO1xuICBsZWZ0QXJyb3cgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWNvbnRyb2wtcHJldicpWzBdO1xuICByaWdodEFycm93ID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1jb250cm9sLW5leHQnKVswXTtcbiAgaW5kaWNhdG9yID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1pbmRpY2F0b3JzJylbMF07XG4gIGluZGljYXRvcnMgPSBpbmRpY2F0b3IgJiYgaW5kaWNhdG9yLmdldEVsZW1lbnRzQnlUYWdOYW1lKCBcIkxJXCIgKSB8fCBbXTtcbiAgaWYgKHNsaWRlcy5sZW5ndGggPCAyKSB7IHJldHVybiB9XG4gIHZhclxuICAgIGludGVydmFsQXR0cmlidXRlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW50ZXJ2YWwnKSxcbiAgICBpbnRlcnZhbERhdGEgPSBpbnRlcnZhbEF0dHJpYnV0ZSA9PT0gJ2ZhbHNlJyA/IDAgOiBwYXJzZUludChpbnRlcnZhbEF0dHJpYnV0ZSksXG4gICAgdG91Y2hEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG91Y2gnKSA9PT0gJ2ZhbHNlJyA/IDAgOiAxLFxuICAgIHBhdXNlRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBhdXNlJykgPT09ICdob3ZlcicgfHwgZmFsc2UsXG4gICAga2V5Ym9hcmREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEta2V5Ym9hcmQnKSA9PT0gJ3RydWUnIHx8IGZhbHNlLFxuICAgIGludGVydmFsT3B0aW9uID0gb3B0aW9ucy5pbnRlcnZhbCxcbiAgICB0b3VjaE9wdGlvbiA9IG9wdGlvbnMudG91Y2g7XG4gIG9wcyA9IHt9O1xuICBvcHMua2V5Ym9hcmQgPSBvcHRpb25zLmtleWJvYXJkID09PSB0cnVlIHx8IGtleWJvYXJkRGF0YTtcbiAgb3BzLnBhdXNlID0gKG9wdGlvbnMucGF1c2UgPT09ICdob3ZlcicgfHwgcGF1c2VEYXRhKSA/ICdob3ZlcicgOiBmYWxzZTtcbiAgb3BzLnRvdWNoID0gdG91Y2hPcHRpb24gfHwgdG91Y2hEYXRhO1xuICBvcHMuaW50ZXJ2YWwgPSB0eXBlb2YgaW50ZXJ2YWxPcHRpb24gPT09ICdudW1iZXInID8gaW50ZXJ2YWxPcHRpb25cbiAgICAgICAgICAgICAgOiBpbnRlcnZhbE9wdGlvbiA9PT0gZmFsc2UgfHwgaW50ZXJ2YWxEYXRhID09PSAwIHx8IGludGVydmFsRGF0YSA9PT0gZmFsc2UgPyAwXG4gICAgICAgICAgICAgIDogaXNOYU4oaW50ZXJ2YWxEYXRhKSA/IDUwMDBcbiAgICAgICAgICAgICAgOiBpbnRlcnZhbERhdGE7XG4gIGlmIChzZWxmLmdldEFjdGl2ZUluZGV4KCk8MCkge1xuICAgIHNsaWRlcy5sZW5ndGggJiYgc2xpZGVzWzBdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIGluZGljYXRvcnMubGVuZ3RoICYmIHNldEFjdGl2ZVBhZ2UoMCk7XG4gIH1cbiAgdmFycyA9IHt9O1xuICB2YXJzLmRpcmVjdGlvbiA9ICdsZWZ0JztcbiAgdmFycy5pbmRleCA9IDA7XG4gIHZhcnMudGltZXIgPSBudWxsO1xuICB2YXJzLmlzU2xpZGluZyA9IGZhbHNlO1xuICB2YXJzLmlzVG91Y2ggPSBmYWxzZTtcbiAgdmFycy50b3VjaFBvc2l0aW9uID0ge1xuICAgIHN0YXJ0WCA6IDAsXG4gICAgY3VycmVudFggOiAwLFxuICAgIGVuZFggOiAwXG4gIH07XG4gIHRvZ2dsZUV2ZW50cygxKTtcbiAgaWYgKCBvcHMuaW50ZXJ2YWwgKXsgc2VsZi5jeWNsZSgpOyB9XG4gIGVsZW1lbnQuQ2Fyb3VzZWwgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBDb2xsYXBzZShlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGFjY29yZGlvbiA9IG51bGwsXG4gICAgICBjb2xsYXBzZSA9IG51bGwsXG4gICAgICBhY3RpdmVDb2xsYXBzZSxcbiAgICAgIGFjdGl2ZUVsZW1lbnQsXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQ7XG4gIGZ1bmN0aW9uIG9wZW5BY3Rpb24oY29sbGFwc2VFbGVtZW50LCB0b2dnbGUpIHtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIGNvbGxhcHNlRWxlbWVudC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNpbmcnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2UnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKGNvbGxhcHNlRWxlbWVudC5zY3JvbGxIZWlnaHQpICsgXCJweFwiO1xuICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGNvbGxhcHNlRWxlbWVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgY29sbGFwc2VFbGVtZW50LmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywndHJ1ZScpO1xuICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ3RydWUnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzaW5nJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2UnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZUFjdGlvbihjb2xsYXBzZUVsZW1lbnQsIHRvZ2dsZSkge1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKCBoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgY29sbGFwc2VFbGVtZW50LmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKGNvbGxhcHNlRWxlbWVudC5zY3JvbGxIZWlnaHQpICsgXCJweFwiO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzZScpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNpbmcnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcwcHgnO1xuICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGNvbGxhcHNlRWxlbWVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgY29sbGFwc2VFbGVtZW50LmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywnZmFsc2UnKTtcbiAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCdmYWxzZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNpbmcnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICAgIH0pO1xuICB9XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZSAmJiBlLnRhcmdldC50YWdOYW1lID09PSAnQScgfHwgZWxlbWVudC50YWdOYW1lID09PSAnQScpIHtlLnByZXZlbnREZWZhdWx0KCk7fVxuICAgIGlmIChlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSB8fCBlLnRhcmdldCA9PT0gZWxlbWVudCkge1xuICAgICAgaWYgKCFjb2xsYXBzZS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkgeyBzZWxmLnNob3coKTsgfVxuICAgICAgZWxzZSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgfVxuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBjb2xsYXBzZS5pc0FuaW1hdGluZyApIHsgcmV0dXJuOyB9XG4gICAgY2xvc2VBY3Rpb24oY29sbGFwc2UsZWxlbWVudCk7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZWQnKTtcbiAgfTtcbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggYWNjb3JkaW9uICkge1xuICAgICAgYWN0aXZlQ29sbGFwc2UgPSBhY2NvcmRpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvbGxhcHNlIHNob3dcIilbMF07XG4gICAgICBhY3RpdmVFbGVtZW50ID0gYWN0aXZlQ29sbGFwc2UgJiYgKHF1ZXJ5RWxlbWVudCgoXCJbZGF0YS10YXJnZXQ9XFxcIiNcIiArIChhY3RpdmVDb2xsYXBzZS5pZCkgKyBcIlxcXCJdXCIpLGFjY29yZGlvbilcbiAgICAgICAgICAgICAgICAgICAgfHwgcXVlcnlFbGVtZW50KChcIltocmVmPVxcXCIjXCIgKyAoYWN0aXZlQ29sbGFwc2UuaWQpICsgXCJcXFwiXVwiKSxhY2NvcmRpb24pICk7XG4gICAgfVxuICAgIGlmICggIWNvbGxhcHNlLmlzQW5pbWF0aW5nICkge1xuICAgICAgaWYgKCBhY3RpdmVFbGVtZW50ICYmIGFjdGl2ZUNvbGxhcHNlICE9PSBjb2xsYXBzZSApIHtcbiAgICAgICAgY2xvc2VBY3Rpb24oYWN0aXZlQ29sbGFwc2UsYWN0aXZlRWxlbWVudCk7XG4gICAgICAgIGFjdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2VkJyk7XG4gICAgICB9XG4gICAgICBvcGVuQWN0aW9uKGNvbGxhcHNlLGVsZW1lbnQpO1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzZWQnKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLnRvZ2dsZSxmYWxzZSk7XG4gICAgZGVsZXRlIGVsZW1lbnQuQ29sbGFwc2U7XG4gIH07XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgICBlbGVtZW50LkNvbGxhcHNlICYmIGVsZW1lbnQuQ29sbGFwc2UuZGlzcG9zZSgpO1xuICAgIHZhciBhY2NvcmRpb25EYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50Jyk7XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAnY29sbGFwc2UnKTtcbiAgICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ2NvbGxhcHNlJyk7XG4gICAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAnY29sbGFwc2UnKTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAnY29sbGFwc2UnKTtcbiAgICBjb2xsYXBzZSA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLnRhcmdldCB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpKTtcbiAgICBjb2xsYXBzZS5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIGFjY29yZGlvbiA9IGVsZW1lbnQuY2xvc2VzdChvcHRpb25zLnBhcmVudCB8fCBhY2NvcmRpb25EYXRhKTtcbiAgICBpZiAoICFlbGVtZW50LkNvbGxhcHNlICkge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsc2VsZi50b2dnbGUsZmFsc2UpO1xuICAgIH1cbiAgICBlbGVtZW50LkNvbGxhcHNlID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gc2V0Rm9jdXMgKGVsZW1lbnQpe1xuICBlbGVtZW50LmZvY3VzID8gZWxlbWVudC5mb2N1cygpIDogZWxlbWVudC5zZXRBY3RpdmUoKTtcbn1cblxuZnVuY3Rpb24gRHJvcGRvd24oZWxlbWVudCxvcHRpb24pIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgICAgcmVsYXRlZFRhcmdldCA9IG51bGwsXG4gICAgICBwYXJlbnQsIG1lbnUsIG1lbnVJdGVtcyA9IFtdLFxuICAgICAgcGVyc2lzdDtcbiAgZnVuY3Rpb24gcHJldmVudEVtcHR5QW5jaG9yKGFuY2hvcikge1xuICAgIChhbmNob3IuaHJlZiAmJiBhbmNob3IuaHJlZi5zbGljZSgtMSkgPT09ICcjJyB8fCBhbmNob3IucGFyZW50Tm9kZSAmJiBhbmNob3IucGFyZW50Tm9kZS5ocmVmXG4gICAgICAmJiBhbmNob3IucGFyZW50Tm9kZS5ocmVmLnNsaWNlKC0xKSA9PT0gJyMnKSAmJiB0aGlzLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRGlzbWlzcygpIHtcbiAgICB2YXIgYWN0aW9uID0gZWxlbWVudC5vcGVuID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oJ2NsaWNrJyxkaXNtaXNzSGFuZGxlcixmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgna2V5ZG93bicscHJldmVudFNjcm9sbCxmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgna2V5dXAnLGtleUhhbmRsZXIsZmFsc2UpO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oJ2ZvY3VzJyxkaXNtaXNzSGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgZnVuY3Rpb24gZGlzbWlzc0hhbmRsZXIoZSkge1xuICAgIHZhciBldmVudFRhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICAgIGhhc0RhdGEgPSBldmVudFRhcmdldCAmJiAoZXZlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRvZ2dsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGV2ZW50VGFyZ2V0LnBhcmVudE5vZGUgJiYgZXZlbnRUYXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgZXZlbnRUYXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlJykpO1xuICAgIGlmICggZS50eXBlID09PSAnZm9jdXMnICYmIChldmVudFRhcmdldCA9PT0gZWxlbWVudCB8fCBldmVudFRhcmdldCA9PT0gbWVudSB8fCBtZW51LmNvbnRhaW5zKGV2ZW50VGFyZ2V0KSApICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIChldmVudFRhcmdldCA9PT0gbWVudSB8fCBtZW51LmNvbnRhaW5zKGV2ZW50VGFyZ2V0KSkgJiYgKHBlcnNpc3QgfHwgaGFzRGF0YSkgKSB7IHJldHVybjsgfVxuICAgIGVsc2Uge1xuICAgICAgcmVsYXRlZFRhcmdldCA9IGV2ZW50VGFyZ2V0ID09PSBlbGVtZW50IHx8IGVsZW1lbnQuY29udGFpbnMoZXZlbnRUYXJnZXQpID8gZWxlbWVudCA6IG51bGw7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gICAgcHJldmVudEVtcHR5QW5jaG9yLmNhbGwoZSxldmVudFRhcmdldCk7XG4gIH1cbiAgZnVuY3Rpb24gY2xpY2tIYW5kbGVyKGUpIHtcbiAgICByZWxhdGVkVGFyZ2V0ID0gZWxlbWVudDtcbiAgICBzZWxmLnNob3coKTtcbiAgICBwcmV2ZW50RW1wdHlBbmNob3IuY2FsbChlLGUudGFyZ2V0KTtcbiAgfVxuICBmdW5jdGlvbiBwcmV2ZW50U2Nyb2xsKGUpIHtcbiAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAgaWYoIGtleSA9PT0gMzggfHwga2V5ID09PSA0MCApIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gIH1cbiAgZnVuY3Rpb24ga2V5SGFuZGxlcihlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlLFxuICAgICAgICBhY3RpdmVJdGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCxcbiAgICAgICAgaXNTYW1lRWxlbWVudCA9IGFjdGl2ZUl0ZW0gPT09IGVsZW1lbnQsXG4gICAgICAgIGlzSW5zaWRlTWVudSA9IG1lbnUuY29udGFpbnMoYWN0aXZlSXRlbSksXG4gICAgICAgIGlzTWVudUl0ZW0gPSBhY3RpdmVJdGVtLnBhcmVudE5vZGUgPT09IG1lbnUgfHwgYWN0aXZlSXRlbS5wYXJlbnROb2RlLnBhcmVudE5vZGUgPT09IG1lbnUsXG4gICAgICAgIGlkeCA9IG1lbnVJdGVtcy5pbmRleE9mKGFjdGl2ZUl0ZW0pO1xuICAgIGlmICggaXNNZW51SXRlbSApIHtcbiAgICAgIGlkeCA9IGlzU2FtZUVsZW1lbnQgPyAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5ID09PSAzOCA/IChpZHg+MT9pZHgtMTowKVxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtleSA9PT0gNDAgPyAoaWR4PG1lbnVJdGVtcy5sZW5ndGgtMT9pZHgrMTppZHgpIDogaWR4O1xuICAgICAgbWVudUl0ZW1zW2lkeF0gJiYgc2V0Rm9jdXMobWVudUl0ZW1zW2lkeF0pO1xuICAgIH1cbiAgICBpZiAoIChtZW51SXRlbXMubGVuZ3RoICYmIGlzTWVudUl0ZW1cbiAgICAgICAgICB8fCAhbWVudUl0ZW1zLmxlbmd0aCAmJiAoaXNJbnNpZGVNZW51IHx8IGlzU2FtZUVsZW1lbnQpXG4gICAgICAgICAgfHwgIWlzSW5zaWRlTWVudSApXG4gICAgICAgICAgJiYgZWxlbWVudC5vcGVuICYmIGtleSA9PT0gMjdcbiAgICApIHtcbiAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ2Ryb3Bkb3duJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBtZW51LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICBwYXJlbnQuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJyx0cnVlKTtcbiAgICBlbGVtZW50Lm9wZW4gPSB0cnVlO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRGb2N1cyggbWVudS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnSU5QVVQnKVswXSB8fCBlbGVtZW50ICk7XG4gICAgICB0b2dnbGVEaXNtaXNzKCk7XG4gICAgICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoICdzaG93bicsICdkcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpO1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgc2hvd25DdXN0b21FdmVudCk7XG4gICAgfSwxKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ2Ryb3Bkb3duJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBtZW51LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBwYXJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJyxmYWxzZSk7XG4gICAgZWxlbWVudC5vcGVuID0gZmFsc2U7XG4gICAgdG9nZ2xlRGlzbWlzcygpO1xuICAgIHNldEZvY3VzKGVsZW1lbnQpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgZWxlbWVudC5Ecm9wZG93biAmJiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICAgIH0sMSk7XG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ2Ryb3Bkb3duJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9O1xuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmIGVsZW1lbnQub3BlbikgeyBzZWxmLmhpZGUoKTsgfVxuICAgIGVsc2UgeyBzZWxmLnNob3coKTsgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiBlbGVtZW50Lm9wZW4pIHsgc2VsZi5oaWRlKCk7IH1cbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkRyb3Bkb3duO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LkRyb3Bkb3duICYmIGVsZW1lbnQuRHJvcGRvd24uZGlzcG9zZSgpO1xuICBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gIG1lbnUgPSBxdWVyeUVsZW1lbnQoJy5kcm9wZG93bi1tZW51JywgcGFyZW50KTtcbiAgQXJyYXkuZnJvbShtZW51LmNoaWxkcmVuKS5tYXAoZnVuY3Rpb24gKGNoaWxkKXtcbiAgICBjaGlsZC5jaGlsZHJlbi5sZW5ndGggJiYgKGNoaWxkLmNoaWxkcmVuWzBdLnRhZ05hbWUgPT09ICdBJyAmJiBtZW51SXRlbXMucHVzaChjaGlsZC5jaGlsZHJlblswXSkpO1xuICAgIGNoaWxkLnRhZ05hbWUgPT09ICdBJyAmJiBtZW51SXRlbXMucHVzaChjaGlsZCk7XG4gIH0pO1xuICBpZiAoICFlbGVtZW50LkRyb3Bkb3duICkge1xuICAgICEoJ3RhYmluZGV4JyBpbiBtZW51KSAmJiBtZW51LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgcGVyc2lzdCA9IG9wdGlvbiA9PT0gdHJ1ZSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wZXJzaXN0JykgPT09ICd0cnVlJyB8fCBmYWxzZTtcbiAgZWxlbWVudC5vcGVuID0gZmFsc2U7XG4gIGVsZW1lbnQuRHJvcGRvd24gPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBNb2RhbChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcywgbW9kYWwsXG4gICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgIHJlbGF0ZWRUYXJnZXQgPSBudWxsLFxuICAgIHNjcm9sbEJhcldpZHRoLFxuICAgIG92ZXJsYXksXG4gICAgb3ZlcmxheURlbGF5LFxuICAgIGZpeGVkSXRlbXMsXG4gICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIHNldFNjcm9sbGJhcigpIHtcbiAgICB2YXIgb3Blbk1vZGFsID0gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGFsLW9wZW4nKSxcbiAgICAgICAgYm9keVBhZCA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkucGFkZGluZ1JpZ2h0KSxcbiAgICAgICAgYm9keU92ZXJmbG93ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCAhPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodFxuICAgICAgICAgICAgICAgICAgICB8fCBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAhPT0gZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQsXG4gICAgICAgIG1vZGFsT3ZlcmZsb3cgPSBtb2RhbC5jbGllbnRIZWlnaHQgIT09IG1vZGFsLnNjcm9sbEhlaWdodDtcbiAgICBzY3JvbGxCYXJXaWR0aCA9IG1lYXN1cmVTY3JvbGxiYXIoKTtcbiAgICBtb2RhbC5zdHlsZS5wYWRkaW5nUmlnaHQgPSAhbW9kYWxPdmVyZmxvdyAmJiBzY3JvbGxCYXJXaWR0aCA/IChzY3JvbGxCYXJXaWR0aCArIFwicHhcIikgOiAnJztcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9IG1vZGFsT3ZlcmZsb3cgfHwgYm9keU92ZXJmbG93ID8gKChib2R5UGFkICsgKG9wZW5Nb2RhbCA/IDA6c2Nyb2xsQmFyV2lkdGgpKSArIFwicHhcIikgOiAnJztcbiAgICBmaXhlZEl0ZW1zLmxlbmd0aCAmJiBmaXhlZEl0ZW1zLm1hcChmdW5jdGlvbiAoZml4ZWQpe1xuICAgICAgdmFyIGl0ZW1QYWQgPSBnZXRDb21wdXRlZFN0eWxlKGZpeGVkKS5wYWRkaW5nUmlnaHQ7XG4gICAgICBmaXhlZC5zdHlsZS5wYWRkaW5nUmlnaHQgPSBtb2RhbE92ZXJmbG93IHx8IGJvZHlPdmVyZmxvdyA/ICgocGFyc2VJbnQoaXRlbVBhZCkgKyAob3Blbk1vZGFsPzA6c2Nyb2xsQmFyV2lkdGgpKSArIFwicHhcIikgOiAoKHBhcnNlSW50KGl0ZW1QYWQpKSArIFwicHhcIik7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVzZXRTY3JvbGxiYXIoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPSAnJztcbiAgICBtb2RhbC5zdHlsZS5wYWRkaW5nUmlnaHQgPSAnJztcbiAgICBmaXhlZEl0ZW1zLmxlbmd0aCAmJiBmaXhlZEl0ZW1zLm1hcChmdW5jdGlvbiAoZml4ZWQpe1xuICAgICAgZml4ZWQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJyc7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gbWVhc3VyZVNjcm9sbGJhcigpIHtcbiAgICB2YXIgc2Nyb2xsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksIHdpZHRoVmFsdWU7XG4gICAgc2Nyb2xsRGl2LmNsYXNzTmFtZSA9ICdtb2RhbC1zY3JvbGxiYXItbWVhc3VyZSc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JvbGxEaXYpO1xuICAgIHdpZHRoVmFsdWUgPSBzY3JvbGxEaXYub2Zmc2V0V2lkdGggLSBzY3JvbGxEaXYuY2xpZW50V2lkdGg7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpO1xuICAgIHJldHVybiB3aWR0aFZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZU92ZXJsYXkoKSB7XG4gICAgdmFyIG5ld092ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcubW9kYWwtYmFja2Ryb3AnKTtcbiAgICBpZiAoIG92ZXJsYXkgPT09IG51bGwgKSB7XG4gICAgICBuZXdPdmVybGF5LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbW9kYWwtYmFja2Ryb3AnICsgKG9wcy5hbmltYXRpb24gPyAnIGZhZGUnIDogJycpKTtcbiAgICAgIG92ZXJsYXkgPSBuZXdPdmVybGF5O1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcbiAgICB9XG4gICAgcmV0dXJuIG92ZXJsYXk7XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlT3ZlcmxheSAoKSB7XG4gICAgb3ZlcmxheSA9IHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWJhY2tkcm9wJyk7XG4gICAgaWYgKCBvdmVybGF5ICYmICFkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbCBzaG93JylbMF0gKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG92ZXJsYXkpOyBvdmVybGF5ID0gbnVsbDtcbiAgICB9XG4gICAgb3ZlcmxheSA9PT0gbnVsbCAmJiAoZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1vcGVuJyksIHJlc2V0U2Nyb2xsYmFyKCkpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgd2luZG93W2FjdGlvbl0oICdyZXNpemUnLCBzZWxmLnVwZGF0ZSwgcGFzc2l2ZUhhbmRsZXIpO1xuICAgIG1vZGFsW2FjdGlvbl0oICdjbGljaycsZGlzbWlzc0hhbmRsZXIsZmFsc2UpO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oICdrZXlkb3duJyxrZXlIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBiZWZvcmVTaG93KCkge1xuICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIHNldFNjcm9sbGJhcigpO1xuICAgICFkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbCBzaG93JylbMF0gJiYgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdtb2RhbC1vcGVuJyk7XG4gICAgbW9kYWwuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIG1vZGFsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBmYWxzZSk7XG4gICAgbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChtb2RhbCwgdHJpZ2dlclNob3cpIDogdHJpZ2dlclNob3coKTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VyU2hvdygpIHtcbiAgICBzZXRGb2N1cyhtb2RhbCk7XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gICAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICdtb2RhbCcsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJpZ2dlckhpZGUoZm9yY2UpIHtcbiAgICBtb2RhbC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgZWxlbWVudCAmJiAoc2V0Rm9jdXMoZWxlbWVudCkpO1xuICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy5tb2RhbC1iYWNrZHJvcCcpO1xuICAgIGlmIChmb3JjZSAhPT0gMSAmJiBvdmVybGF5ICYmIG92ZXJsYXkuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXSkge1xuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChvdmVybGF5LHJlbW92ZU92ZXJsYXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVPdmVybGF5KCk7XG4gICAgfVxuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIG1vZGFsLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ21vZGFsJyk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gY2xpY2tIYW5kbGVyKGUpIHtcbiAgICBpZiAoIG1vZGFsLmlzQW5pbWF0aW5nICkgeyByZXR1cm47IH1cbiAgICB2YXIgY2xpY2tUYXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgbW9kYWxJRCA9IFwiI1wiICsgKG1vZGFsLmdldEF0dHJpYnV0ZSgnaWQnKSksXG4gICAgICAgIHRhcmdldEF0dHJWYWx1ZSA9IGNsaWNrVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSB8fCBjbGlja1RhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSxcbiAgICAgICAgZWxlbUF0dHJWYWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgaWYgKCAhbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JylcbiAgICAgICAgJiYgKGNsaWNrVGFyZ2V0ID09PSBlbGVtZW50ICYmIHRhcmdldEF0dHJWYWx1ZSA9PT0gbW9kYWxJRFxuICAgICAgICB8fCBlbGVtZW50LmNvbnRhaW5zKGNsaWNrVGFyZ2V0KSAmJiBlbGVtQXR0clZhbHVlID09PSBtb2RhbElEKSApIHtcbiAgICAgIG1vZGFsLm1vZGFsVHJpZ2dlciA9IGVsZW1lbnQ7XG4gICAgICByZWxhdGVkVGFyZ2V0ID0gZWxlbWVudDtcbiAgICAgIHNlbGYuc2hvdygpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKHJlZikge1xuICAgIHZhciB3aGljaCA9IHJlZi53aGljaDtcbiAgICBpZiAoIW1vZGFsLmlzQW5pbWF0aW5nICYmIG9wcy5rZXlib2FyZCAmJiB3aGljaCA9PSAyNyAmJiBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkaXNtaXNzSGFuZGxlcihlKSB7XG4gICAgaWYgKCBtb2RhbC5pc0FuaW1hdGluZyApIHsgcmV0dXJuOyB9XG4gICAgdmFyIGNsaWNrVGFyZ2V0ID0gZS50YXJnZXQsXG4gICAgICAgIGhhc0RhdGEgPSBjbGlja1RhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGlzbWlzcycpID09PSAnbW9kYWwnLFxuICAgICAgICBwYXJlbnRXaXRoRGF0YSA9IGNsaWNrVGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWRpc21pc3M9XCJtb2RhbFwiXScpO1xuICAgIGlmICggbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgKCBwYXJlbnRXaXRoRGF0YSB8fCBoYXNEYXRhXG4gICAgICAgIHx8IGNsaWNrVGFyZ2V0ID09PSBtb2RhbCAmJiBvcHMuYmFja2Ryb3AgIT09ICdzdGF0aWMnICkgKSB7XG4gICAgICBzZWxmLmhpZGUoKTsgcmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7c2VsZi5oaWRlKCk7fSBlbHNlIHtzZWxmLnNob3coKTt9XG4gIH07XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAobW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgISFtb2RhbC5pc0FuaW1hdGluZyApIHtyZXR1cm59XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAnbW9kYWwnLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50T3BlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXTtcbiAgICBpZiAoY3VycmVudE9wZW4gJiYgY3VycmVudE9wZW4gIT09IG1vZGFsKSB7XG4gICAgICBjdXJyZW50T3Blbi5tb2RhbFRyaWdnZXIgJiYgY3VycmVudE9wZW4ubW9kYWxUcmlnZ2VyLk1vZGFsLmhpZGUoKTtcbiAgICAgIGN1cnJlbnRPcGVuLk1vZGFsICYmIGN1cnJlbnRPcGVuLk1vZGFsLmhpZGUoKTtcbiAgICB9XG4gICAgaWYgKCBvcHMuYmFja2Ryb3AgKSB7XG4gICAgICBvdmVybGF5ID0gY3JlYXRlT3ZlcmxheSgpO1xuICAgIH1cbiAgICBpZiAoIG92ZXJsYXkgJiYgIWN1cnJlbnRPcGVuICYmICFvdmVybGF5LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge1xuICAgICAgb3ZlcmxheS5vZmZzZXRXaWR0aDtcbiAgICAgIG92ZXJsYXlEZWxheSA9IGdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24ob3ZlcmxheSk7XG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICB9XG4gICAgIWN1cnJlbnRPcGVuID8gc2V0VGltZW91dCggYmVmb3JlU2hvdywgb3ZlcmxheSAmJiBvdmVybGF5RGVsYXkgPyBvdmVybGF5RGVsYXk6MCApIDogYmVmb3JlU2hvdygpO1xuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoZm9yY2UpIHtcbiAgICBpZiAoICFtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtyZXR1cm59XG4gICAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoICdoaWRlJywgJ21vZGFsJyk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1vZGFsLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICBtb2RhbC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpICYmIGZvcmNlICE9PSAxID8gZW11bGF0ZVRyYW5zaXRpb25FbmQobW9kYWwsIHRyaWdnZXJIaWRlKSA6IHRyaWdnZXJIaWRlKCk7XG4gIH07XG4gIHNlbGYuc2V0Q29udGVudCA9IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gICAgcXVlcnlFbGVtZW50KCcubW9kYWwtY29udGVudCcsbW9kYWwpLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gIH07XG4gIHNlbGYudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkge1xuICAgICAgc2V0U2Nyb2xsYmFyKCk7XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi5oaWRlKDEpO1xuICAgIGlmIChlbGVtZW50KSB7ZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTsgZGVsZXRlIGVsZW1lbnQuTW9kYWw7IH1cbiAgICBlbHNlIHtkZWxldGUgbW9kYWwuTW9kYWw7fVxuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICB2YXIgY2hlY2tNb2RhbCA9IHF1ZXJ5RWxlbWVudCggZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSApO1xuICBtb2RhbCA9IGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2RhbCcpID8gZWxlbWVudCA6IGNoZWNrTW9kYWw7XG4gIGZpeGVkSXRlbXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ZpeGVkLXRvcCcpKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KEFycmF5LmZyb20oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZml4ZWQtYm90dG9tJykpKTtcbiAgaWYgKCBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbW9kYWwnKSApIHsgZWxlbWVudCA9IG51bGw7IH1cbiAgZWxlbWVudCAmJiBlbGVtZW50Lk1vZGFsICYmIGVsZW1lbnQuTW9kYWwuZGlzcG9zZSgpO1xuICBtb2RhbCAmJiBtb2RhbC5Nb2RhbCAmJiBtb2RhbC5Nb2RhbC5kaXNwb3NlKCk7XG4gIG9wcy5rZXlib2FyZCA9IG9wdGlvbnMua2V5Ym9hcmQgPT09IGZhbHNlIHx8IG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1rZXlib2FyZCcpID09PSAnZmFsc2UnID8gZmFsc2UgOiB0cnVlO1xuICBvcHMuYmFja2Ryb3AgPSBvcHRpb25zLmJhY2tkcm9wID09PSAnc3RhdGljJyB8fCBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmFja2Ryb3AnKSA9PT0gJ3N0YXRpYycgPyAnc3RhdGljJyA6IHRydWU7XG4gIG9wcy5iYWNrZHJvcCA9IG9wdGlvbnMuYmFja2Ryb3AgPT09IGZhbHNlIHx8IG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1iYWNrZHJvcCcpID09PSAnZmFsc2UnID8gZmFsc2UgOiBvcHMuYmFja2Ryb3A7XG4gIG9wcy5hbmltYXRpb24gPSBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSA/IHRydWUgOiBmYWxzZTtcbiAgb3BzLmNvbnRlbnQgPSBvcHRpb25zLmNvbnRlbnQ7XG4gIG1vZGFsLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gIGlmICggZWxlbWVudCAmJiAhZWxlbWVudC5Nb2RhbCApIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGlmICggb3BzLmNvbnRlbnQgKSB7XG4gICAgc2VsZi5zZXRDb250ZW50KCBvcHMuY29udGVudC50cmltKCkgKTtcbiAgfVxuICBpZiAoZWxlbWVudCkge1xuICAgIG1vZGFsLm1vZGFsVHJpZ2dlciA9IGVsZW1lbnQ7XG4gICAgZWxlbWVudC5Nb2RhbCA9IHNlbGY7XG4gIH0gZWxzZSB7XG4gICAgbW9kYWwuTW9kYWwgPSBzZWxmO1xuICB9XG59XG5cbnZhciBtb3VzZUNsaWNrRXZlbnRzID0geyBkb3duOiAnbW91c2Vkb3duJywgdXA6ICdtb3VzZXVwJyB9O1xuXG5mdW5jdGlvbiBnZXRTY3JvbGwoKSB7XG4gIHJldHVybiB7XG4gICAgeSA6IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wLFxuICAgIHggOiB3aW5kb3cucGFnZVhPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnRcbiAgfVxufVxuXG5mdW5jdGlvbiBzdHlsZVRpcChsaW5rLGVsZW1lbnQscG9zaXRpb24scGFyZW50KSB7XG4gIHZhciB0aXBQb3NpdGlvbnMgPSAvXFxiKHRvcHxib3R0b218bGVmdHxyaWdodCkrLyxcbiAgICAgIGVsZW1lbnREaW1lbnNpb25zID0geyB3IDogZWxlbWVudC5vZmZzZXRXaWR0aCwgaDogZWxlbWVudC5vZmZzZXRIZWlnaHQgfSxcbiAgICAgIHdpbmRvd1dpZHRoID0gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoKSxcbiAgICAgIHdpbmRvd0hlaWdodCA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0KSxcbiAgICAgIHJlY3QgPSBsaW5rLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgc2Nyb2xsID0gcGFyZW50ID09PSBkb2N1bWVudC5ib2R5ID8gZ2V0U2Nyb2xsKCkgOiB7IHg6IHBhcmVudC5vZmZzZXRMZWZ0ICsgcGFyZW50LnNjcm9sbExlZnQsIHk6IHBhcmVudC5vZmZzZXRUb3AgKyBwYXJlbnQuc2Nyb2xsVG9wIH0sXG4gICAgICBsaW5rRGltZW5zaW9ucyA9IHsgdzogcmVjdC5yaWdodCAtIHJlY3QubGVmdCwgaDogcmVjdC5ib3R0b20gLSByZWN0LnRvcCB9LFxuICAgICAgaXNQb3BvdmVyID0gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BvcG92ZXInKSxcbiAgICAgIGFycm93ID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhcnJvdycpWzBdLFxuICAgICAgaGFsZlRvcEV4Y2VlZCA9IHJlY3QudG9wICsgbGlua0RpbWVuc2lvbnMuaC8yIC0gZWxlbWVudERpbWVuc2lvbnMuaC8yIDwgMCxcbiAgICAgIGhhbGZMZWZ0RXhjZWVkID0gcmVjdC5sZWZ0ICsgbGlua0RpbWVuc2lvbnMudy8yIC0gZWxlbWVudERpbWVuc2lvbnMudy8yIDwgMCxcbiAgICAgIGhhbGZSaWdodEV4Y2VlZCA9IHJlY3QubGVmdCArIGVsZW1lbnREaW1lbnNpb25zLncvMiArIGxpbmtEaW1lbnNpb25zLncvMiA+PSB3aW5kb3dXaWR0aCxcbiAgICAgIGhhbGZCb3R0b21FeGNlZWQgPSByZWN0LnRvcCArIGVsZW1lbnREaW1lbnNpb25zLmgvMiArIGxpbmtEaW1lbnNpb25zLmgvMiA+PSB3aW5kb3dIZWlnaHQsXG4gICAgICB0b3BFeGNlZWQgPSByZWN0LnRvcCAtIGVsZW1lbnREaW1lbnNpb25zLmggPCAwLFxuICAgICAgbGVmdEV4Y2VlZCA9IHJlY3QubGVmdCAtIGVsZW1lbnREaW1lbnNpb25zLncgPCAwLFxuICAgICAgYm90dG9tRXhjZWVkID0gcmVjdC50b3AgKyBlbGVtZW50RGltZW5zaW9ucy5oICsgbGlua0RpbWVuc2lvbnMuaCA+PSB3aW5kb3dIZWlnaHQsXG4gICAgICByaWdodEV4Y2VlZCA9IHJlY3QubGVmdCArIGVsZW1lbnREaW1lbnNpb25zLncgKyBsaW5rRGltZW5zaW9ucy53ID49IHdpbmRvd1dpZHRoO1xuICBwb3NpdGlvbiA9IChwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnKSAmJiBsZWZ0RXhjZWVkICYmIHJpZ2h0RXhjZWVkID8gJ3RvcCcgOiBwb3NpdGlvbjtcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgdG9wRXhjZWVkID8gJ2JvdHRvbScgOiBwb3NpdGlvbjtcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgYm90dG9tRXhjZWVkID8gJ3RvcCcgOiBwb3NpdGlvbjtcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIGxlZnRFeGNlZWQgPyAncmlnaHQnIDogcG9zaXRpb247XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gPT09ICdyaWdodCcgJiYgcmlnaHRFeGNlZWQgPyAnbGVmdCcgOiBwb3NpdGlvbjtcbiAgdmFyIHRvcFBvc2l0aW9uLFxuICAgIGxlZnRQb3NpdGlvbixcbiAgICBhcnJvd1RvcCxcbiAgICBhcnJvd0xlZnQsXG4gICAgYXJyb3dXaWR0aCxcbiAgICBhcnJvd0hlaWdodDtcbiAgZWxlbWVudC5jbGFzc05hbWUuaW5kZXhPZihwb3NpdGlvbikgPT09IC0xICYmIChlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UodGlwUG9zaXRpb25zLHBvc2l0aW9uKSk7XG4gIGFycm93V2lkdGggPSBhcnJvdy5vZmZzZXRXaWR0aDsgYXJyb3dIZWlnaHQgPSBhcnJvdy5vZmZzZXRIZWlnaHQ7XG4gIGlmICggcG9zaXRpb24gPT09ICdsZWZ0JyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyApIHtcbiAgICBpZiAoIHBvc2l0aW9uID09PSAnbGVmdCcgKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSByZWN0LmxlZnQgKyBzY3JvbGwueCAtIGVsZW1lbnREaW1lbnNpb25zLncgLSAoIGlzUG9wb3ZlciA/IGFycm93V2lkdGggOiAwICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3QubGVmdCArIHNjcm9sbC54ICsgbGlua0RpbWVuc2lvbnMudztcbiAgICB9XG4gICAgaWYgKGhhbGZUb3BFeGNlZWQpIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gcmVjdC50b3AgKyBzY3JvbGwueTtcbiAgICAgIGFycm93VG9wID0gbGlua0RpbWVuc2lvbnMuaC8yIC0gYXJyb3dXaWR0aDtcbiAgICB9IGVsc2UgaWYgKGhhbGZCb3R0b21FeGNlZWQpIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gcmVjdC50b3AgKyBzY3JvbGwueSAtIGVsZW1lbnREaW1lbnNpb25zLmggKyBsaW5rRGltZW5zaW9ucy5oO1xuICAgICAgYXJyb3dUb3AgPSBlbGVtZW50RGltZW5zaW9ucy5oIC0gbGlua0RpbWVuc2lvbnMuaC8yIC0gYXJyb3dXaWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55IC0gZWxlbWVudERpbWVuc2lvbnMuaC8yICsgbGlua0RpbWVuc2lvbnMuaC8yO1xuICAgICAgYXJyb3dUb3AgPSBlbGVtZW50RGltZW5zaW9ucy5oLzIgLSAoaXNQb3BvdmVyID8gYXJyb3dIZWlnaHQqMC45IDogYXJyb3dIZWlnaHQvMik7XG4gICAgfVxuICB9IGVsc2UgaWYgKCBwb3NpdGlvbiA9PT0gJ3RvcCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nICkge1xuICAgIGlmICggcG9zaXRpb24gPT09ICd0b3AnKSB7XG4gICAgICB0b3BQb3NpdGlvbiA9ICByZWN0LnRvcCArIHNjcm9sbC55IC0gZWxlbWVudERpbWVuc2lvbnMuaCAtICggaXNQb3BvdmVyID8gYXJyb3dIZWlnaHQgOiAwICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gcmVjdC50b3AgKyBzY3JvbGwueSArIGxpbmtEaW1lbnNpb25zLmg7XG4gICAgfVxuICAgIGlmIChoYWxmTGVmdEV4Y2VlZCkge1xuICAgICAgbGVmdFBvc2l0aW9uID0gMDtcbiAgICAgIGFycm93TGVmdCA9IHJlY3QubGVmdCArIGxpbmtEaW1lbnNpb25zLncvMiAtIGFycm93V2lkdGg7XG4gICAgfSBlbHNlIGlmIChoYWxmUmlnaHRFeGNlZWQpIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHdpbmRvd1dpZHRoIC0gZWxlbWVudERpbWVuc2lvbnMudyoxLjAxO1xuICAgICAgYXJyb3dMZWZ0ID0gZWxlbWVudERpbWVuc2lvbnMudyAtICggd2luZG93V2lkdGggLSByZWN0LmxlZnQgKSArIGxpbmtEaW1lbnNpb25zLncvMiAtIGFycm93V2lkdGgvMjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdC5sZWZ0ICsgc2Nyb2xsLnggLSBlbGVtZW50RGltZW5zaW9ucy53LzIgKyBsaW5rRGltZW5zaW9ucy53LzI7XG4gICAgICBhcnJvd0xlZnQgPSBlbGVtZW50RGltZW5zaW9ucy53LzIgLSAoIGlzUG9wb3ZlciA/IGFycm93V2lkdGggOiBhcnJvd1dpZHRoLzIgKTtcbiAgICB9XG4gIH1cbiAgZWxlbWVudC5zdHlsZS50b3AgPSB0b3BQb3NpdGlvbiArICdweCc7XG4gIGVsZW1lbnQuc3R5bGUubGVmdCA9IGxlZnRQb3NpdGlvbiArICdweCc7XG4gIGFycm93VG9wICYmIChhcnJvdy5zdHlsZS50b3AgPSBhcnJvd1RvcCArICdweCcpO1xuICBhcnJvd0xlZnQgJiYgKGFycm93LnN0eWxlLmxlZnQgPSBhcnJvd0xlZnQgKyAncHgnKTtcbn1cblxuZnVuY3Rpb24gUG9wb3ZlcihlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHBvcG92ZXIgPSBudWxsLFxuICAgICAgdGltZXIgPSAwLFxuICAgICAgaXNJcGhvbmUgPSAvKGlQaG9uZXxpUG9kfGlQYWQpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLFxuICAgICAgdGl0bGVTdHJpbmcsXG4gICAgICBjb250ZW50U3RyaW5nLFxuICAgICAgb3BzID0ge307XG4gIHZhciB0cmlnZ2VyRGF0YSxcbiAgICAgIGFuaW1hdGlvbkRhdGEsXG4gICAgICBwbGFjZW1lbnREYXRhLFxuICAgICAgZGlzbWlzc2libGVEYXRhLFxuICAgICAgZGVsYXlEYXRhLFxuICAgICAgY29udGFpbmVyRGF0YSxcbiAgICAgIGNsb3NlQnRuLFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgICAgY29udGFpbmVyRWxlbWVudCxcbiAgICAgIGNvbnRhaW5lckRhdGFFbGVtZW50LFxuICAgICAgbW9kYWwsXG4gICAgICBuYXZiYXJGaXhlZFRvcCxcbiAgICAgIG5hdmJhckZpeGVkQm90dG9tLFxuICAgICAgcGxhY2VtZW50Q2xhc3M7XG4gIGZ1bmN0aW9uIGRpc21pc3NpYmxlSGFuZGxlcihlKSB7XG4gICAgaWYgKHBvcG92ZXIgIT09IG51bGwgJiYgZS50YXJnZXQgPT09IHF1ZXJ5RWxlbWVudCgnLmNsb3NlJyxwb3BvdmVyKSkge1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGdldENvbnRlbnRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICAwIDogb3B0aW9ucy50aXRsZSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpIHx8IG51bGwsXG4gICAgICAxIDogb3B0aW9ucy5jb250ZW50IHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbnRlbnQnKSB8fCBudWxsXG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZVBvcG92ZXIoKSB7XG4gICAgb3BzLmNvbnRhaW5lci5yZW1vdmVDaGlsZChwb3BvdmVyKTtcbiAgICB0aW1lciA9IG51bGw7IHBvcG92ZXIgPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVBvcG92ZXIoKSB7XG4gICAgdGl0bGVTdHJpbmcgPSBnZXRDb250ZW50cygpWzBdIHx8IG51bGw7XG4gICAgY29udGVudFN0cmluZyA9IGdldENvbnRlbnRzKClbMV07XG4gICAgY29udGVudFN0cmluZyA9ICEhY29udGVudFN0cmluZyA/IGNvbnRlbnRTdHJpbmcudHJpbSgpIDogbnVsbDtcbiAgICBwb3BvdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIHBvcG92ZXJBcnJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBvcG92ZXJBcnJvdy5jbGFzc0xpc3QuYWRkKCdhcnJvdycpO1xuICAgIHBvcG92ZXIuYXBwZW5kQ2hpbGQocG9wb3ZlckFycm93KTtcbiAgICBpZiAoIGNvbnRlbnRTdHJpbmcgIT09IG51bGwgJiYgb3BzLnRlbXBsYXRlID09PSBudWxsICkge1xuICAgICAgcG9wb3Zlci5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCd0b29sdGlwJyk7XG4gICAgICBpZiAodGl0bGVTdHJpbmcgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIHBvcG92ZXJUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgICAgIHBvcG92ZXJUaXRsZS5jbGFzc0xpc3QuYWRkKCdwb3BvdmVyLWhlYWRlcicpO1xuICAgICAgICBwb3BvdmVyVGl0bGUuaW5uZXJIVE1MID0gb3BzLmRpc21pc3NpYmxlID8gdGl0bGVTdHJpbmcgKyBjbG9zZUJ0biA6IHRpdGxlU3RyaW5nO1xuICAgICAgICBwb3BvdmVyLmFwcGVuZENoaWxkKHBvcG92ZXJUaXRsZSk7XG4gICAgICB9XG4gICAgICB2YXIgcG9wb3ZlckJvZHlNYXJrdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHBvcG92ZXJCb2R5TWFya3VwLmNsYXNzTGlzdC5hZGQoJ3BvcG92ZXItYm9keScpO1xuICAgICAgcG9wb3ZlckJvZHlNYXJrdXAuaW5uZXJIVE1MID0gb3BzLmRpc21pc3NpYmxlICYmIHRpdGxlU3RyaW5nID09PSBudWxsID8gY29udGVudFN0cmluZyArIGNsb3NlQnRuIDogY29udGVudFN0cmluZztcbiAgICAgIHBvcG92ZXIuYXBwZW5kQ2hpbGQocG9wb3ZlckJvZHlNYXJrdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcG9wb3ZlclRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBwb3BvdmVyVGVtcGxhdGUuaW5uZXJIVE1MID0gb3BzLnRlbXBsYXRlLnRyaW0oKTtcbiAgICAgIHBvcG92ZXIuY2xhc3NOYW1lID0gcG9wb3ZlclRlbXBsYXRlLmZpcnN0Q2hpbGQuY2xhc3NOYW1lO1xuICAgICAgcG9wb3Zlci5pbm5lckhUTUwgPSBwb3BvdmVyVGVtcGxhdGUuZmlyc3RDaGlsZC5pbm5lckhUTUw7XG4gICAgICB2YXIgcG9wb3ZlckhlYWRlciA9IHF1ZXJ5RWxlbWVudCgnLnBvcG92ZXItaGVhZGVyJyxwb3BvdmVyKSxcbiAgICAgICAgICBwb3BvdmVyQm9keSA9IHF1ZXJ5RWxlbWVudCgnLnBvcG92ZXItYm9keScscG9wb3Zlcik7XG4gICAgICB0aXRsZVN0cmluZyAmJiBwb3BvdmVySGVhZGVyICYmIChwb3BvdmVySGVhZGVyLmlubmVySFRNTCA9IHRpdGxlU3RyaW5nLnRyaW0oKSk7XG4gICAgICBjb250ZW50U3RyaW5nICYmIHBvcG92ZXJCb2R5ICYmIChwb3BvdmVyQm9keS5pbm5lckhUTUwgPSBjb250ZW50U3RyaW5nLnRyaW0oKSk7XG4gICAgfVxuICAgIG9wcy5jb250YWluZXIuYXBwZW5kQ2hpbGQocG9wb3Zlcik7XG4gICAgcG9wb3Zlci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoICdwb3BvdmVyJykgJiYgcG9wb3Zlci5jbGFzc0xpc3QuYWRkKCdwb3BvdmVyJyk7XG4gICAgIXBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCBvcHMuYW5pbWF0aW9uKSAmJiBwb3BvdmVyLmNsYXNzTGlzdC5hZGQob3BzLmFuaW1hdGlvbik7XG4gICAgIXBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCBwbGFjZW1lbnRDbGFzcykgJiYgcG9wb3Zlci5jbGFzc0xpc3QuYWRkKHBsYWNlbWVudENsYXNzKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93UG9wb3ZlcigpIHtcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAoIHBvcG92ZXIuY2xhc3NMaXN0LmFkZCgnc2hvdycpICk7XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlUG9wb3ZlcigpIHtcbiAgICBzdHlsZVRpcChlbGVtZW50LCBwb3BvdmVyLCBvcHMucGxhY2VtZW50LCBvcHMuY29udGFpbmVyKTtcbiAgfVxuICBmdW5jdGlvbiBmb3JjZUZvY3VzICgpIHtcbiAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkgeyBlbGVtZW50LmZvY3VzKCk7IH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGlmIChvcHMudHJpZ2dlciA9PT0gJ2hvdmVyJykge1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBtb3VzZUNsaWNrRXZlbnRzLmRvd24sIHNlbGYuc2hvdyApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzBdLCBzZWxmLnNob3cgKTtcbiAgICAgIGlmICghb3BzLmRpc21pc3NpYmxlKSB7IGVsZW1lbnRbYWN0aW9uXSggbW91c2VIb3ZlckV2ZW50c1sxXSwgc2VsZi5oaWRlICk7IH1cbiAgICB9IGVsc2UgaWYgKCdjbGljaycgPT0gb3BzLnRyaWdnZXIpIHtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggb3BzLnRyaWdnZXIsIHNlbGYudG9nZ2xlICk7XG4gICAgfSBlbHNlIGlmICgnZm9jdXMnID09IG9wcy50cmlnZ2VyKSB7XG4gICAgICBpc0lwaG9uZSAmJiBlbGVtZW50W2FjdGlvbl0oICdjbGljaycsIGZvcmNlRm9jdXMsIGZhbHNlICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG9wcy50cmlnZ2VyLCBzZWxmLnRvZ2dsZSApO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b3VjaEhhbmRsZXIoZSl7XG4gICAgaWYgKCBwb3BvdmVyICYmIHBvcG92ZXIuY29udGFpbnMoZS50YXJnZXQpIHx8IGUudGFyZ2V0ID09PSBlbGVtZW50IHx8IGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpKSA7IGVsc2Uge1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGRpc21pc3NIYW5kbGVyVG9nZ2xlKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBpZiAob3BzLmRpc21pc3NpYmxlKSB7XG4gICAgICBkb2N1bWVudFthY3Rpb25dKCdjbGljaycsIGRpc21pc3NpYmxlSGFuZGxlciwgZmFsc2UgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJ2ZvY3VzJyA9PSBvcHMudHJpZ2dlciAmJiBlbGVtZW50W2FjdGlvbl0oICdibHVyJywgc2VsZi5oaWRlICk7XG4gICAgICAnaG92ZXInID09IG9wcy50cmlnZ2VyICYmIGRvY3VtZW50W2FjdGlvbl0oICd0b3VjaHN0YXJ0JywgdG91Y2hIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIH1cbiAgICB3aW5kb3dbYWN0aW9uXSgncmVzaXplJywgc2VsZi5oaWRlLCBwYXNzaXZlSGFuZGxlciApO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dUcmlnZ2VyKCkge1xuICAgIGRpc21pc3NIYW5kbGVyVG9nZ2xlKDEpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBoaWRlVHJpZ2dlcigpIHtcbiAgICBkaXNtaXNzSGFuZGxlclRvZ2dsZSgpO1xuICAgIHJlbW92ZVBvcG92ZXIoKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChwb3BvdmVyID09PSBudWxsKSB7IHNlbGYuc2hvdygpOyB9XG4gICAgZWxzZSB7IHNlbGYuaGlkZSgpOyB9XG4gIH07XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHBvcG92ZXIgPT09IG51bGwpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgICAgICBjcmVhdGVQb3BvdmVyKCk7XG4gICAgICAgIHVwZGF0ZVBvcG92ZXIoKTtcbiAgICAgICAgc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgISFvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQocG9wb3Zlciwgc2hvd1RyaWdnZXIpIDogc2hvd1RyaWdnZXIoKTtcbiAgICAgIH1cbiAgICB9LCAyMCApO1xuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChwb3BvdmVyICYmIHBvcG92ZXIgIT09IG51bGwgJiYgcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkge1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICAgICAgaWYgKCBoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICAgIHBvcG92ZXIuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChwb3BvdmVyLCBoaWRlVHJpZ2dlcikgOiBoaWRlVHJpZ2dlcigpO1xuICAgICAgfVxuICAgIH0sIG9wcy5kZWxheSApO1xuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi5oaWRlKCk7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgZGVsZXRlIGVsZW1lbnQuUG9wb3ZlcjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5Qb3BvdmVyICYmIGVsZW1lbnQuUG9wb3Zlci5kaXNwb3NlKCk7XG4gIHRyaWdnZXJEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHJpZ2dlcicpO1xuICBhbmltYXRpb25EYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJyk7XG4gIHBsYWNlbWVudERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wbGFjZW1lbnQnKTtcbiAgZGlzbWlzc2libGVEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGlzbWlzc2libGUnKTtcbiAgZGVsYXlEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVsYXknKTtcbiAgY29udGFpbmVyRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbnRhaW5lcicpO1xuICBjbG9zZUJ0biA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCI+w5c8L2J1dHRvbj4nO1xuICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdwb3BvdmVyJyk7XG4gIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAncG9wb3ZlcicpO1xuICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICdwb3BvdmVyJyk7XG4gIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdwb3BvdmVyJyk7XG4gIGNvbnRhaW5lckVsZW1lbnQgPSBxdWVyeUVsZW1lbnQob3B0aW9ucy5jb250YWluZXIpO1xuICBjb250YWluZXJEYXRhRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChjb250YWluZXJEYXRhKTtcbiAgbW9kYWwgPSBlbGVtZW50LmNsb3Nlc3QoJy5tb2RhbCcpO1xuICBuYXZiYXJGaXhlZFRvcCA9IGVsZW1lbnQuY2xvc2VzdCgnLmZpeGVkLXRvcCcpO1xuICBuYXZiYXJGaXhlZEJvdHRvbSA9IGVsZW1lbnQuY2xvc2VzdCgnLmZpeGVkLWJvdHRvbScpO1xuICBvcHMudGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlID8gb3B0aW9ucy50ZW1wbGF0ZSA6IG51bGw7XG4gIG9wcy50cmlnZ2VyID0gb3B0aW9ucy50cmlnZ2VyID8gb3B0aW9ucy50cmlnZ2VyIDogdHJpZ2dlckRhdGEgfHwgJ2hvdmVyJztcbiAgb3BzLmFuaW1hdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uICYmIG9wdGlvbnMuYW5pbWF0aW9uICE9PSAnZmFkZScgPyBvcHRpb25zLmFuaW1hdGlvbiA6IGFuaW1hdGlvbkRhdGEgfHwgJ2ZhZGUnO1xuICBvcHMucGxhY2VtZW50ID0gb3B0aW9ucy5wbGFjZW1lbnQgPyBvcHRpb25zLnBsYWNlbWVudCA6IHBsYWNlbWVudERhdGEgfHwgJ3RvcCc7XG4gIG9wcy5kZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuZGVsYXkgfHwgZGVsYXlEYXRhKSB8fCAyMDA7XG4gIG9wcy5kaXNtaXNzaWJsZSA9IG9wdGlvbnMuZGlzbWlzc2libGUgfHwgZGlzbWlzc2libGVEYXRhID09PSAndHJ1ZScgPyB0cnVlIDogZmFsc2U7XG4gIG9wcy5jb250YWluZXIgPSBjb250YWluZXJFbGVtZW50ID8gY29udGFpbmVyRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGNvbnRhaW5lckRhdGFFbGVtZW50ID8gY29udGFpbmVyRGF0YUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZFRvcCA/IG5hdmJhckZpeGVkVG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRCb3R0b20gPyBuYXZiYXJGaXhlZEJvdHRvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG1vZGFsID8gbW9kYWwgOiBkb2N1bWVudC5ib2R5O1xuICBwbGFjZW1lbnRDbGFzcyA9IFwiYnMtcG9wb3Zlci1cIiArIChvcHMucGxhY2VtZW50KTtcbiAgdmFyIHBvcG92ZXJDb250ZW50cyA9IGdldENvbnRlbnRzKCk7XG4gIHRpdGxlU3RyaW5nID0gcG9wb3ZlckNvbnRlbnRzWzBdO1xuICBjb250ZW50U3RyaW5nID0gcG9wb3ZlckNvbnRlbnRzWzFdO1xuICBpZiAoICFjb250ZW50U3RyaW5nICYmICFvcHMudGVtcGxhdGUgKSB7IHJldHVybjsgfVxuICBpZiAoICFlbGVtZW50LlBvcG92ZXIgKSB7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICB9XG4gIGVsZW1lbnQuUG9wb3ZlciA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIFNjcm9sbFNweShlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICB2YXJzLFxuICAgIHRhcmdldERhdGEsXG4gICAgb2Zmc2V0RGF0YSxcbiAgICBzcHlUYXJnZXQsXG4gICAgc2Nyb2xsVGFyZ2V0LFxuICAgIG9wcyA9IHt9O1xuICBmdW5jdGlvbiB1cGRhdGVUYXJnZXRzKCl7XG4gICAgdmFyIGxpbmtzID0gc3B5VGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdBJyk7XG4gICAgaWYgKHZhcnMubGVuZ3RoICE9PSBsaW5rcy5sZW5ndGgpIHtcbiAgICAgIHZhcnMuaXRlbXMgPSBbXTtcbiAgICAgIHZhcnMudGFyZ2V0cyA9IFtdO1xuICAgICAgQXJyYXkuZnJvbShsaW5rcykubWFwKGZ1bmN0aW9uIChsaW5rKXtcbiAgICAgICAgdmFyIGhyZWYgPSBsaW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpLFxuICAgICAgICAgIHRhcmdldEl0ZW0gPSBocmVmICYmIGhyZWYuY2hhckF0KDApID09PSAnIycgJiYgaHJlZi5zbGljZSgtMSkgIT09ICcjJyAmJiBxdWVyeUVsZW1lbnQoaHJlZik7XG4gICAgICAgIGlmICggdGFyZ2V0SXRlbSApIHtcbiAgICAgICAgICB2YXJzLml0ZW1zLnB1c2gobGluayk7XG4gICAgICAgICAgdmFycy50YXJnZXRzLnB1c2godGFyZ2V0SXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdmFycy5sZW5ndGggPSBsaW5rcy5sZW5ndGg7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHVwZGF0ZUl0ZW0oaW5kZXgpIHtcbiAgICB2YXIgaXRlbSA9IHZhcnMuaXRlbXNbaW5kZXhdLFxuICAgICAgdGFyZ2V0SXRlbSA9IHZhcnMudGFyZ2V0c1tpbmRleF0sXG4gICAgICBkcm9wbWVudSA9IGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdkcm9wZG93bi1pdGVtJykgJiYgaXRlbS5jbG9zZXN0KCcuZHJvcGRvd24tbWVudScpLFxuICAgICAgZHJvcExpbmsgPSBkcm9wbWVudSAmJiBkcm9wbWVudS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLFxuICAgICAgbmV4dFNpYmxpbmcgPSBpdGVtLm5leHRFbGVtZW50U2libGluZyxcbiAgICAgIGFjdGl2ZVNpYmxpbmcgPSBuZXh0U2libGluZyAmJiBuZXh0U2libGluZy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKS5sZW5ndGgsXG4gICAgICB0YXJnZXRSZWN0ID0gdmFycy5pc1dpbmRvdyAmJiB0YXJnZXRJdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgaXNBY3RpdmUgPSBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgfHwgZmFsc2UsXG4gICAgICB0b3BFZGdlID0gKHZhcnMuaXNXaW5kb3cgPyB0YXJnZXRSZWN0LnRvcCArIHZhcnMuc2Nyb2xsT2Zmc2V0IDogdGFyZ2V0SXRlbS5vZmZzZXRUb3ApIC0gb3BzLm9mZnNldCxcbiAgICAgIGJvdHRvbUVkZ2UgPSB2YXJzLmlzV2luZG93ID8gdGFyZ2V0UmVjdC5ib3R0b20gKyB2YXJzLnNjcm9sbE9mZnNldCAtIG9wcy5vZmZzZXRcbiAgICAgICAgICAgICAgICAgOiB2YXJzLnRhcmdldHNbaW5kZXgrMV0gPyB2YXJzLnRhcmdldHNbaW5kZXgrMV0ub2Zmc2V0VG9wIC0gb3BzLm9mZnNldFxuICAgICAgICAgICAgICAgICA6IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0LFxuICAgICAgaW5zaWRlID0gYWN0aXZlU2libGluZyB8fCB2YXJzLnNjcm9sbE9mZnNldCA+PSB0b3BFZGdlICYmIGJvdHRvbUVkZ2UgPiB2YXJzLnNjcm9sbE9mZnNldDtcbiAgICAgaWYgKCAhaXNBY3RpdmUgJiYgaW5zaWRlICkge1xuICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIGlmIChkcm9wTGluayAmJiAhZHJvcExpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSApIHtcbiAgICAgICAgZHJvcExpbmsuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgYm9vdHN0cmFwQ3VzdG9tRXZlbnQoICdhY3RpdmF0ZScsICdzY3JvbGxzcHknLCB2YXJzLml0ZW1zW2luZGV4XSkpO1xuICAgIH0gZWxzZSBpZiAoIGlzQWN0aXZlICYmICFpbnNpZGUgKSB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgaWYgKGRyb3BMaW5rICYmIGRyb3BMaW5rLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgJiYgIWl0ZW0ucGFyZW50Tm9kZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKS5sZW5ndGggKSB7XG4gICAgICAgIGRyb3BMaW5rLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIGlzQWN0aXZlICYmIGluc2lkZSB8fCAhaW5zaWRlICYmICFpc0FjdGl2ZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlSXRlbXMoKSB7XG4gICAgdXBkYXRlVGFyZ2V0cygpO1xuICAgIHZhcnMuc2Nyb2xsT2Zmc2V0ID0gdmFycy5pc1dpbmRvdyA/IGdldFNjcm9sbCgpLnkgOiBlbGVtZW50LnNjcm9sbFRvcDtcbiAgICB2YXJzLml0ZW1zLm1hcChmdW5jdGlvbiAobCxpZHgpeyByZXR1cm4gdXBkYXRlSXRlbShpZHgpOyB9KTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIHNjcm9sbFRhcmdldFthY3Rpb25dKCdzY3JvbGwnLCBzZWxmLnJlZnJlc2gsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgd2luZG93W2FjdGlvbl0oICdyZXNpemUnLCBzZWxmLnJlZnJlc2gsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgc2VsZi5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgIHVwZGF0ZUl0ZW1zKCk7XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5TY3JvbGxTcHk7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuU2Nyb2xsU3B5ICYmIGVsZW1lbnQuU2Nyb2xsU3B5LmRpc3Bvc2UoKTtcbiAgdGFyZ2V0RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpO1xuICBvZmZzZXREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb2Zmc2V0Jyk7XG4gIHNweVRhcmdldCA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLnRhcmdldCB8fCB0YXJnZXREYXRhKTtcbiAgc2Nyb2xsVGFyZ2V0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQgPCBlbGVtZW50LnNjcm9sbEhlaWdodCA/IGVsZW1lbnQgOiB3aW5kb3c7XG4gIGlmICghc3B5VGFyZ2V0KSB7IHJldHVybiB9XG4gIG9wcy50YXJnZXQgPSBzcHlUYXJnZXQ7XG4gIG9wcy5vZmZzZXQgPSBwYXJzZUludChvcHRpb25zLm9mZnNldCB8fCBvZmZzZXREYXRhKSB8fCAxMDtcbiAgdmFycyA9IHt9O1xuICB2YXJzLmxlbmd0aCA9IDA7XG4gIHZhcnMuaXRlbXMgPSBbXTtcbiAgdmFycy50YXJnZXRzID0gW107XG4gIHZhcnMuaXNXaW5kb3cgPSBzY3JvbGxUYXJnZXQgPT09IHdpbmRvdztcbiAgaWYgKCAhZWxlbWVudC5TY3JvbGxTcHkgKSB7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICB9XG4gIHNlbGYucmVmcmVzaCgpO1xuICBlbGVtZW50LlNjcm9sbFNweSA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIFRhYihlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBoZWlnaHREYXRhLFxuICAgIHRhYnMsIGRyb3Bkb3duLFxuICAgIHNob3dDdXN0b21FdmVudCxcbiAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICBuZXh0LFxuICAgIHRhYnNDb250ZW50Q29udGFpbmVyID0gZmFsc2UsXG4gICAgYWN0aXZlVGFiLFxuICAgIGFjdGl2ZUNvbnRlbnQsXG4gICAgbmV4dENvbnRlbnQsXG4gICAgY29udGFpbmVySGVpZ2h0LFxuICAgIGVxdWFsQ29udGVudHMsXG4gICAgbmV4dEhlaWdodCxcbiAgICBhbmltYXRlSGVpZ2h0O1xuICBmdW5jdGlvbiB0cmlnZ2VyRW5kKCkge1xuICAgIHRhYnNDb250ZW50Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9ICcnO1xuICAgIHRhYnNDb250ZW50Q29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNpbmcnKTtcbiAgICB0YWJzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gIH1cbiAgZnVuY3Rpb24gdHJpZ2dlclNob3coKSB7XG4gICAgaWYgKHRhYnNDb250ZW50Q29udGFpbmVyKSB7XG4gICAgICBpZiAoIGVxdWFsQ29udGVudHMgKSB7XG4gICAgICAgIHRyaWdnZXJFbmQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9IG5leHRIZWlnaHQgKyBcInB4XCI7XG4gICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXIub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQodGFic0NvbnRlbnRDb250YWluZXIsIHRyaWdnZXJFbmQpO1xuICAgICAgICB9LDUwKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGFicy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ3RhYicsIGFjdGl2ZVRhYik7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG5leHQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJIaWRlKCkge1xuICAgIGlmICh0YWJzQ29udGVudENvbnRhaW5lcikge1xuICAgICAgYWN0aXZlQ29udGVudC5zdHlsZS5mbG9hdCA9ICdsZWZ0JztcbiAgICAgIG5leHRDb250ZW50LnN0eWxlLmZsb2F0ID0gJ2xlZnQnO1xuICAgICAgY29udGFpbmVySGVpZ2h0ID0gYWN0aXZlQ29udGVudC5zY3JvbGxIZWlnaHQ7XG4gICAgfVxuICAgIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3RhYicsIGFjdGl2ZVRhYik7XG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3RhYicsIG5leHQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChuZXh0LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG5leHRDb250ZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIGFjdGl2ZUNvbnRlbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgaWYgKHRhYnNDb250ZW50Q29udGFpbmVyKSB7XG4gICAgICBuZXh0SGVpZ2h0ID0gbmV4dENvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgZXF1YWxDb250ZW50cyA9IG5leHRIZWlnaHQgPT09IGNvbnRhaW5lckhlaWdodDtcbiAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNpbmcnKTtcbiAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCArIFwicHhcIjtcbiAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyLm9mZnNldEhlaWdodDtcbiAgICAgIGFjdGl2ZUNvbnRlbnQuc3R5bGUuZmxvYXQgPSAnJztcbiAgICAgIG5leHRDb250ZW50LnN0eWxlLmZsb2F0ID0gJyc7XG4gICAgfVxuICAgIGlmICggbmV4dENvbnRlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbmV4dENvbnRlbnQuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChuZXh0Q29udGVudCx0cmlnZ2VyU2hvdyk7XG4gICAgICB9LDIwKTtcbiAgICB9IGVsc2UgeyB0cmlnZ2VyU2hvdygpOyB9XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFjdGl2ZVRhYiwgaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYigpIHtcbiAgICB2YXIgYWN0aXZlVGFicyA9IHRhYnMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWN0aXZlJyksIGFjdGl2ZVRhYjtcbiAgICBpZiAoIGFjdGl2ZVRhYnMubGVuZ3RoID09PSAxICYmICFhY3RpdmVUYWJzWzBdLnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdkcm9wZG93bicpICkge1xuICAgICAgYWN0aXZlVGFiID0gYWN0aXZlVGFic1swXTtcbiAgICB9IGVsc2UgaWYgKCBhY3RpdmVUYWJzLmxlbmd0aCA+IDEgKSB7XG4gICAgICBhY3RpdmVUYWIgPSBhY3RpdmVUYWJzW2FjdGl2ZVRhYnMubGVuZ3RoLTFdO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aXZlVGFiO1xuICB9XG4gIGZ1bmN0aW9uIGdldEFjdGl2ZUNvbnRlbnQoKSB7IHJldHVybiBxdWVyeUVsZW1lbnQoZ2V0QWN0aXZlVGFiKCkuZ2V0QXR0cmlidXRlKCdocmVmJykpIH1cbiAgZnVuY3Rpb24gY2xpY2tIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgbmV4dCA9IGUuY3VycmVudFRhcmdldDtcbiAgICAhdGFicy5pc0FuaW1hdGluZyAmJiBzZWxmLnNob3coKTtcbiAgfVxuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgbmV4dCA9IG5leHQgfHwgZWxlbWVudDtcbiAgICBpZiAoIW5leHQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgICAgbmV4dENvbnRlbnQgPSBxdWVyeUVsZW1lbnQobmV4dC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgICBhY3RpdmVUYWIgPSBnZXRBY3RpdmVUYWIoKTtcbiAgICAgIGFjdGl2ZUNvbnRlbnQgPSBnZXRBY3RpdmVDb250ZW50KCk7XG4gICAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCggJ2hpZGUnLCAndGFiJywgbmV4dCk7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoYWN0aXZlVGFiLCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgaWYgKGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgdGFicy5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgICBhY3RpdmVUYWIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICBhY3RpdmVUYWIuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywnZmFsc2UnKTtcbiAgICAgIG5leHQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICBuZXh0LnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsJ3RydWUnKTtcbiAgICAgIGlmICggZHJvcGRvd24gKSB7XG4gICAgICAgIGlmICggIWVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duLW1lbnUnKSApIHtcbiAgICAgICAgICBpZiAoZHJvcGRvd24uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkgeyBkcm9wZG93bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTsgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghZHJvcGRvd24uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkgeyBkcm9wZG93bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYWN0aXZlQ29udGVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSkge1xuICAgICAgICBhY3RpdmVDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoYWN0aXZlQ29udGVudCwgdHJpZ2dlckhpZGUpO1xuICAgICAgfSBlbHNlIHsgdHJpZ2dlckhpZGUoKTsgfVxuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgZGVsZXRlIGVsZW1lbnQuVGFiO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlRhYiAmJiBlbGVtZW50LlRhYi5kaXNwb3NlKCk7XG4gIGhlaWdodERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnKTtcbiAgdGFicyA9IGVsZW1lbnQuY2xvc2VzdCgnLm5hdicpO1xuICBkcm9wZG93biA9IHRhYnMgJiYgcXVlcnlFbGVtZW50KCcuZHJvcGRvd24tdG9nZ2xlJyx0YWJzKTtcbiAgYW5pbWF0ZUhlaWdodCA9ICFzdXBwb3J0VHJhbnNpdGlvbiB8fCAob3B0aW9ucy5oZWlnaHQgPT09IGZhbHNlIHx8IGhlaWdodERhdGEgPT09ICdmYWxzZScpID8gZmFsc2UgOiB0cnVlO1xuICB0YWJzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gIGlmICggIWVsZW1lbnQuVGFiICkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgaWYgKGFuaW1hdGVIZWlnaHQpIHsgdGFic0NvbnRlbnRDb250YWluZXIgPSBnZXRBY3RpdmVDb250ZW50KCkucGFyZW50Tm9kZTsgfVxuICBlbGVtZW50LlRhYiA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIFRvYXN0KGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdG9hc3QsIHRpbWVyID0gMCxcbiAgICAgIGFuaW1hdGlvbkRhdGEsXG4gICAgICBhdXRvaGlkZURhdGEsXG4gICAgICBkZWxheURhdGEsXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gc2hvd0NvbXBsZXRlKCkge1xuICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoICdzaG93aW5nJyApO1xuICAgIHRvYXN0LmNsYXNzTGlzdC5hZGQoICdzaG93JyApO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbCh0b2FzdCxzaG93bkN1c3RvbUV2ZW50KTtcbiAgICBpZiAob3BzLmF1dG9oaWRlKSB7IHNlbGYuaGlkZSgpOyB9XG4gIH1cbiAgZnVuY3Rpb24gaGlkZUNvbXBsZXRlKCkge1xuICAgIHRvYXN0LmNsYXNzTGlzdC5hZGQoICdoaWRlJyApO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbCh0b2FzdCxoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2UgKCkge1xuICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnICk7XG4gICAgb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvYXN0LCBoaWRlQ29tcGxldGUpIDogaGlkZUNvbXBsZXRlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZGlzcG9zZUNvbXBsZXRlKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsc2VsZi5oaWRlLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5Ub2FzdDtcbiAgfVxuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRvYXN0ICYmICF0b2FzdC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkge1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LHNob3dDdXN0b21FdmVudCk7XG4gICAgICBpZiAoc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICBvcHMuYW5pbWF0aW9uICYmIHRvYXN0LmNsYXNzTGlzdC5hZGQoICdmYWRlJyApO1xuICAgICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScgKTtcbiAgICAgIHRvYXN0Lm9mZnNldFdpZHRoO1xuICAgICAgdG9hc3QuY2xhc3NMaXN0LmFkZCgnc2hvd2luZycgKTtcbiAgICAgIG9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b2FzdCwgc2hvd0NvbXBsZXRlKSA6IHNob3dDb21wbGV0ZSgpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKG5vVGltZXIpIHtcbiAgICBpZiAodG9hc3QgJiYgdG9hc3QuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbCh0b2FzdCxoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgaWYoaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICBub1RpbWVyID8gY2xvc2UoKSA6ICh0aW1lciA9IHNldFRpbWVvdXQoIGNsb3NlLCBvcHMuZGVsYXkpKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9hc3QsIGRpc3Bvc2VDb21wbGV0ZSkgOiBkaXNwb3NlQ29tcGxldGUoKTtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5Ub2FzdCAmJiBlbGVtZW50LlRvYXN0LmRpc3Bvc2UoKTtcbiAgdG9hc3QgPSBlbGVtZW50LmNsb3Nlc3QoJy50b2FzdCcpO1xuICBhbmltYXRpb25EYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJyk7XG4gIGF1dG9oaWRlRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWF1dG9oaWRlJyk7XG4gIGRlbGF5RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWRlbGF5Jyk7XG4gIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3RvYXN0Jyk7XG4gIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ3RvYXN0Jyk7XG4gIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAndG9hc3QnKTtcbiAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3RvYXN0Jyk7XG4gIG9wcy5hbmltYXRpb24gPSBvcHRpb25zLmFuaW1hdGlvbiA9PT0gZmFsc2UgfHwgYW5pbWF0aW9uRGF0YSA9PT0gJ2ZhbHNlJyA/IDAgOiAxO1xuICBvcHMuYXV0b2hpZGUgPSBvcHRpb25zLmF1dG9oaWRlID09PSBmYWxzZSB8fCBhdXRvaGlkZURhdGEgPT09ICdmYWxzZScgPyAwIDogMTtcbiAgb3BzLmRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5kZWxheSB8fCBkZWxheURhdGEpIHx8IDUwMDtcbiAgaWYgKCAhZWxlbWVudC5Ub2FzdCApIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLmhpZGUsZmFsc2UpO1xuICB9XG4gIGVsZW1lbnQuVG9hc3QgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBUb29sdGlwKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdG9vbHRpcCA9IG51bGwsIHRpbWVyID0gMCwgdGl0bGVTdHJpbmcsXG4gICAgICBhbmltYXRpb25EYXRhLFxuICAgICAgcGxhY2VtZW50RGF0YSxcbiAgICAgIGRlbGF5RGF0YSxcbiAgICAgIGNvbnRhaW5lckRhdGEsXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICBjb250YWluZXJFbGVtZW50LFxuICAgICAgY29udGFpbmVyRGF0YUVsZW1lbnQsXG4gICAgICBtb2RhbCxcbiAgICAgIG5hdmJhckZpeGVkVG9wLFxuICAgICAgbmF2YmFyRml4ZWRCb3R0b20sXG4gICAgICBwbGFjZW1lbnRDbGFzcyxcbiAgICAgIG9wcyA9IHt9O1xuICBmdW5jdGlvbiBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgICAgICAgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKVxuICAgICAgICB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbC10aXRsZScpXG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlVG9vbFRpcCgpIHtcbiAgICBvcHMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHRvb2x0aXApO1xuICAgIHRvb2x0aXAgPSBudWxsOyB0aW1lciA9IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlVG9vbFRpcCgpIHtcbiAgICB0aXRsZVN0cmluZyA9IGdldFRpdGxlKCk7XG4gICAgaWYgKCB0aXRsZVN0cmluZyApIHtcbiAgICAgIHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGlmIChvcHMudGVtcGxhdGUpIHtcbiAgICAgICAgdmFyIHRvb2x0aXBNYXJrdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbHRpcE1hcmt1cC5pbm5lckhUTUwgPSBvcHMudGVtcGxhdGUudHJpbSgpO1xuICAgICAgICB0b29sdGlwLmNsYXNzTmFtZSA9IHRvb2x0aXBNYXJrdXAuZmlyc3RDaGlsZC5jbGFzc05hbWU7XG4gICAgICAgIHRvb2x0aXAuaW5uZXJIVE1MID0gdG9vbHRpcE1hcmt1cC5maXJzdENoaWxkLmlubmVySFRNTDtcbiAgICAgICAgcXVlcnlFbGVtZW50KCcudG9vbHRpcC1pbm5lcicsdG9vbHRpcCkuaW5uZXJIVE1MID0gdGl0bGVTdHJpbmcudHJpbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRvb2x0aXBBcnJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b29sdGlwQXJyb3cuY2xhc3NMaXN0LmFkZCgnYXJyb3cnKTtcbiAgICAgICAgdG9vbHRpcC5hcHBlbmRDaGlsZCh0b29sdGlwQXJyb3cpO1xuICAgICAgICB2YXIgdG9vbHRpcElubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2x0aXBJbm5lci5jbGFzc0xpc3QuYWRkKCd0b29sdGlwLWlubmVyJyk7XG4gICAgICAgIHRvb2x0aXAuYXBwZW5kQ2hpbGQodG9vbHRpcElubmVyKTtcbiAgICAgICAgdG9vbHRpcElubmVyLmlubmVySFRNTCA9IHRpdGxlU3RyaW5nO1xuICAgICAgfVxuICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAnMCc7XG4gICAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsJ3Rvb2x0aXAnKTtcbiAgICAgICF0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucygndG9vbHRpcCcpICYmIHRvb2x0aXAuY2xhc3NMaXN0LmFkZCgndG9vbHRpcCcpO1xuICAgICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKG9wcy5hbmltYXRpb24pICYmIHRvb2x0aXAuY2xhc3NMaXN0LmFkZChvcHMuYW5pbWF0aW9uKTtcbiAgICAgICF0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucyhwbGFjZW1lbnRDbGFzcykgJiYgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKHBsYWNlbWVudENsYXNzKTtcbiAgICAgIG9wcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHVwZGF0ZVRvb2x0aXAoKSB7XG4gICAgc3R5bGVUaXAoZWxlbWVudCwgdG9vbHRpcCwgb3BzLnBsYWNlbWVudCwgb3BzLmNvbnRhaW5lcik7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd1Rvb2x0aXAoKSB7XG4gICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgKCB0b29sdGlwLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKSApO1xuICB9XG4gIGZ1bmN0aW9uIHRvdWNoSGFuZGxlcihlKXtcbiAgICBpZiAoIHRvb2x0aXAgJiYgdG9vbHRpcC5jb250YWlucyhlLnRhcmdldCkgfHwgZS50YXJnZXQgPT09IGVsZW1lbnQgfHwgZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkpIDsgZWxzZSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlQWN0aW9uKGFjdGlvbil7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oICd0b3VjaHN0YXJ0JywgdG91Y2hIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIHdpbmRvd1thY3Rpb25dKCAncmVzaXplJywgc2VsZi5oaWRlLCBwYXNzaXZlSGFuZGxlciApO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dBY3Rpb24oKSB7XG4gICAgdG9nZ2xlQWN0aW9uKDEpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBoaWRlQWN0aW9uKCkge1xuICAgIHRvZ2dsZUFjdGlvbigpO1xuICAgIHJlbW92ZVRvb2xUaXAoKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKG1vdXNlQ2xpY2tFdmVudHMuZG93biwgc2VsZi5zaG93LGZhbHNlKTtcbiAgICBlbGVtZW50W2FjdGlvbl0obW91c2VIb3ZlckV2ZW50c1swXSwgc2VsZi5zaG93LGZhbHNlKTtcbiAgICBlbGVtZW50W2FjdGlvbl0obW91c2VIb3ZlckV2ZW50c1sxXSwgc2VsZi5oaWRlLGZhbHNlKTtcbiAgfVxuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0b29sdGlwID09PSBudWxsKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmKGNyZWF0ZVRvb2xUaXAoKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICB1cGRhdGVUb29sdGlwKCk7XG4gICAgICAgICAgc2hvd1Rvb2x0aXAoKTtcbiAgICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b29sdGlwLCBzaG93QWN0aW9uKSA6IHNob3dBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIDIwICk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRvb2x0aXAgJiYgdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkge1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICAgICAgaWYgKGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgICB0b29sdGlwLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgICAgISFvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9vbHRpcCwgaGlkZUFjdGlvbikgOiBoaWRlQWN0aW9uKCk7XG4gICAgICB9XG4gICAgfSwgb3BzLmRlbGF5KTtcbiAgfTtcbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0b29sdGlwKSB7IHNlbGYuc2hvdygpOyB9XG4gICAgZWxzZSB7IHNlbGYuaGlkZSgpOyB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBzZWxmLmhpZGUoKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGl0bGUnLCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbC10aXRsZScpKTtcbiAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbC10aXRsZScpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlRvb2x0aXA7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuVG9vbHRpcCAmJiBlbGVtZW50LlRvb2x0aXAuZGlzcG9zZSgpO1xuICBhbmltYXRpb25EYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJyk7XG4gIHBsYWNlbWVudERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wbGFjZW1lbnQnKTtcbiAgZGVsYXlEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVsYXknKTtcbiAgY29udGFpbmVyRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbnRhaW5lcicpO1xuICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICd0b29sdGlwJyk7XG4gIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAndG9vbHRpcCcpO1xuICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICd0b29sdGlwJyk7XG4gIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICd0b29sdGlwJyk7XG4gIGNvbnRhaW5lckVsZW1lbnQgPSBxdWVyeUVsZW1lbnQob3B0aW9ucy5jb250YWluZXIpO1xuICBjb250YWluZXJEYXRhRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChjb250YWluZXJEYXRhKTtcbiAgbW9kYWwgPSBlbGVtZW50LmNsb3Nlc3QoJy5tb2RhbCcpO1xuICBuYXZiYXJGaXhlZFRvcCA9IGVsZW1lbnQuY2xvc2VzdCgnLmZpeGVkLXRvcCcpO1xuICBuYXZiYXJGaXhlZEJvdHRvbSA9IGVsZW1lbnQuY2xvc2VzdCgnLmZpeGVkLWJvdHRvbScpO1xuICBvcHMuYW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRpb24gJiYgb3B0aW9ucy5hbmltYXRpb24gIT09ICdmYWRlJyA/IG9wdGlvbnMuYW5pbWF0aW9uIDogYW5pbWF0aW9uRGF0YSB8fCAnZmFkZSc7XG4gIG9wcy5wbGFjZW1lbnQgPSBvcHRpb25zLnBsYWNlbWVudCA/IG9wdGlvbnMucGxhY2VtZW50IDogcGxhY2VtZW50RGF0YSB8fCAndG9wJztcbiAgb3BzLnRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZSA/IG9wdGlvbnMudGVtcGxhdGUgOiBudWxsO1xuICBvcHMuZGVsYXkgPSBwYXJzZUludChvcHRpb25zLmRlbGF5IHx8IGRlbGF5RGF0YSkgfHwgMjAwO1xuICBvcHMuY29udGFpbmVyID0gY29udGFpbmVyRWxlbWVudCA/IGNvbnRhaW5lckVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBjb250YWluZXJEYXRhRWxlbWVudCA/IGNvbnRhaW5lckRhdGFFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRUb3AgPyBuYXZiYXJGaXhlZFRvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkQm90dG9tID8gbmF2YmFyRml4ZWRCb3R0b21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBtb2RhbCA/IG1vZGFsIDogZG9jdW1lbnQuYm9keTtcbiAgcGxhY2VtZW50Q2xhc3MgPSBcImJzLXRvb2x0aXAtXCIgKyAob3BzLnBsYWNlbWVudCk7XG4gIHRpdGxlU3RyaW5nID0gZ2V0VGl0bGUoKTtcbiAgaWYgKCAhdGl0bGVTdHJpbmcgKSB7IHJldHVybjsgfVxuICBpZiAoIWVsZW1lbnQuVG9vbHRpcCkge1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJyx0aXRsZVN0cmluZyk7XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RpdGxlJyk7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICB9XG4gIGVsZW1lbnQuVG9vbHRpcCA9IHNlbGY7XG59XG5cbnZhciBjb21wb25lbnRzSW5pdCA9IHt9O1xuXG5mdW5jdGlvbiBpbml0aWFsaXplRGF0YUFQSSggQ29uc3RydWN0b3IsIGNvbGxlY3Rpb24gKXtcbiAgQXJyYXkuZnJvbShjb2xsZWN0aW9uKS5tYXAoZnVuY3Rpb24gKHgpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHgpOyB9KTtcbn1cbmZ1bmN0aW9uIGluaXRDYWxsYmFjayhsb29rVXApe1xuICBsb29rVXAgPSBsb29rVXAgfHwgZG9jdW1lbnQ7XG4gIGZvciAodmFyIGNvbXBvbmVudCBpbiBjb21wb25lbnRzSW5pdCkge1xuICAgIGluaXRpYWxpemVEYXRhQVBJKCBjb21wb25lbnRzSW5pdFtjb21wb25lbnRdWzBdLCBsb29rVXAucXVlcnlTZWxlY3RvckFsbCAoY29tcG9uZW50c0luaXRbY29tcG9uZW50XVsxXSkgKTtcbiAgfVxufVxuXG5jb21wb25lbnRzSW5pdC5BbGVydCA9IFsgQWxlcnQsICdbZGF0YS1kaXNtaXNzPVwiYWxlcnRcIl0nXTtcbmNvbXBvbmVudHNJbml0LkJ1dHRvbiA9IFsgQnV0dG9uLCAnW2RhdGEtdG9nZ2xlPVwiYnV0dG9uc1wiXScgXTtcbmNvbXBvbmVudHNJbml0LkNhcm91c2VsID0gWyBDYXJvdXNlbCwgJ1tkYXRhLXJpZGU9XCJjYXJvdXNlbFwiXScgXTtcbmNvbXBvbmVudHNJbml0LkNvbGxhcHNlID0gWyBDb2xsYXBzZSwgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdJyBdO1xuY29tcG9uZW50c0luaXQuRHJvcGRvd24gPSBbIERyb3Bkb3duLCAnW2RhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIl0nXTtcbmNvbXBvbmVudHNJbml0Lk1vZGFsID0gWyBNb2RhbCwgJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJyBdO1xuY29tcG9uZW50c0luaXQuUG9wb3ZlciA9IFsgUG9wb3ZlciwgJ1tkYXRhLXRvZ2dsZT1cInBvcG92ZXJcIl0sW2RhdGEtdGlwPVwicG9wb3ZlclwiXScgXTtcbmNvbXBvbmVudHNJbml0LlNjcm9sbFNweSA9IFsgU2Nyb2xsU3B5LCAnW2RhdGEtc3B5PVwic2Nyb2xsXCJdJyBdO1xuY29tcG9uZW50c0luaXQuVGFiID0gWyBUYWIsICdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Ub2FzdCA9IFsgVG9hc3QsICdbZGF0YS1kaXNtaXNzPVwidG9hc3RcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Ub29sdGlwID0gWyBUb29sdGlwLCAnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXSxbZGF0YS10aXA9XCJ0b29sdGlwXCJdJyBdO1xuZG9jdW1lbnQuYm9keSA/IGluaXRDYWxsYmFjaygpIDogZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiBpbml0V3JhcHBlcigpe1xuXHRpbml0Q2FsbGJhY2soKTtcblx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsaW5pdFdyYXBwZXIsZmFsc2UpO1xufSwgZmFsc2UgKTtcblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudERhdGFBUEkoIENvbnN0cnVjdG9yTmFtZSwgY29sbGVjdGlvbiApe1xuICBBcnJheS5mcm9tKGNvbGxlY3Rpb24pLm1hcChmdW5jdGlvbiAoeCl7IHJldHVybiB4W0NvbnN0cnVjdG9yTmFtZV0uZGlzcG9zZSgpOyB9KTtcbn1cbmZ1bmN0aW9uIHJlbW92ZURhdGFBUEkobG9va1VwKSB7XG4gIGxvb2tVcCA9IGxvb2tVcCB8fCBkb2N1bWVudDtcbiAgZm9yICh2YXIgY29tcG9uZW50IGluIGNvbXBvbmVudHNJbml0KSB7XG4gICAgcmVtb3ZlRWxlbWVudERhdGFBUEkoIGNvbXBvbmVudCwgbG9va1VwLnF1ZXJ5U2VsZWN0b3JBbGwgKGNvbXBvbmVudHNJbml0W2NvbXBvbmVudF1bMV0pICk7XG4gIH1cbn1cblxudmFyIHZlcnNpb24gPSBcIjMuMC4xMFwiO1xuXG52YXIgaW5kZXggPSB7XG4gIEFsZXJ0OiBBbGVydCxcbiAgQnV0dG9uOiBCdXR0b24sXG4gIENhcm91c2VsOiBDYXJvdXNlbCxcbiAgQ29sbGFwc2U6IENvbGxhcHNlLFxuICBEcm9wZG93bjogRHJvcGRvd24sXG4gIE1vZGFsOiBNb2RhbCxcbiAgUG9wb3ZlcjogUG9wb3ZlcixcbiAgU2Nyb2xsU3B5OiBTY3JvbGxTcHksXG4gIFRhYjogVGFiLFxuICBUb2FzdDogVG9hc3QsXG4gIFRvb2x0aXA6IFRvb2x0aXAsXG4gIGluaXRDYWxsYmFjazogaW5pdENhbGxiYWNrLFxuICByZW1vdmVEYXRhQVBJOiByZW1vdmVEYXRhQVBJLFxuICBjb21wb25lbnRzSW5pdDogY29tcG9uZW50c0luaXQsXG4gIFZlcnNpb246IHZlcnNpb25cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGluZGV4O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8qZ2xvYmFsIHRvU3RyaW5nOnRydWUqL1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpLnJlcGxhY2UoL1xccyokLywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWRcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuKGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAodXRpbHMuaXNCbG9iKHJlcXVlc3REYXRhKSB8fCB1dGlscy5pc0ZpbGUocmVxdWVzdERhdGEpKSAmJlxuICAgICAgcmVxdWVzdERhdGEudHlwZVxuICAgICkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIHx8ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIElnbm9yZSAqLyB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsImV4cG9ydCBmdW5jdGlvbiBhdHRyaWJ1dGVUb1N0cmluZyhhdHRyaWJ1dGUpIHtcbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGUgIT09ICdzdHJpbmcnKSB7XG4gICAgYXR0cmlidXRlICs9ICcnO1xuICAgIGlmIChhdHRyaWJ1dGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBhdHRyaWJ1dGUgPSAnJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGF0dHJpYnV0ZS50cmltKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVDbGFzcyhlbGVtLCBjbGFzc05hbWUpIHtcbiAgZWxlbS5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtLCAuLi5jbGFzc05hbWVzKSB7XG4gIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSguLi5jbGFzc05hbWVzKTtcbiAgcmV0dXJuIGVsZW07XG59XG4iLCJpbXBvcnQgQXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgYXR0cmlidXRlVG9TdHJpbmcgfSBmcm9tICcuL2hlbHBlcic7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoYXhpb3NDb25maWcsIC4uLmFyZ3MpIHtcbiAgY29uc3QgaW5zdGFuY2UgPSBBeGlvcy5jcmVhdGUoYXhpb3NDb25maWcpO1xuICByZXR1cm4ge1xuICAgIGdldENhcnQoKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2UuZ2V0KCcvY2FydC5qcycpO1xuICAgIH0sXG4gICAgZ2V0UHJvZHVjdChoYW5kbGUpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZS5nZXQoYC9wcm9kdWN0cy8ke2hhbmRsZX0uanNgKTtcbiAgICB9LFxuICAgIGNsZWFyQ2FydCgpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9jbGVhci5qcycpO1xuICAgIH0sXG4gICAgdXBkYXRlQ2FydEZyb21Gb3JtKGZvcm0pIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC91cGRhdGUuanMnLCBuZXcgRm9ybURhdGEoZm9ybSkpO1xuICAgIH0sXG4gICAgY2hhbmdlSXRlbUJ5S2V5T3JJZChrZXlPcklkLCBxdWFudGl0eSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHtcbiAgICAgICAgcXVhbnRpdHk6IHF1YW50aXR5LFxuICAgICAgICBpZDoga2V5T3JJZCxcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVtb3ZlSXRlbUJ5S2V5T3JJZChrZXlPcklkKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvY2hhbmdlLmpzJywgeyBxdWFudGl0eTogMCwgaWQ6IGtleU9ySWQgfSk7XG4gICAgfSxcbiAgICBjaGFuZ2VJdGVtQnlMaW5lKGxpbmUsIHF1YW50aXR5KSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvY2hhbmdlLmpzJywgeyBxdWFudGl0eSwgbGluZSB9KTtcbiAgICB9LFxuICAgIHJlbW92ZUl0ZW1CeUxpbmUobGluZSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHsgcXVhbnRpdHk6IDAsIGxpbmUgfSk7XG4gICAgfSxcbiAgICBhZGRJdGVtKGlkLCBxdWFudGl0eSwgcHJvcGVydGllcykge1xuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2FkZC5qcycsIHtcbiAgICAgICAgaWQsXG4gICAgICAgIHF1YW50aXR5LFxuICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgfSk7XG4gICAgfSxcbiAgICBhZGRJdGVtRnJvbUZvcm0oZm9ybSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2FkZC5qcycsIG5ldyBGb3JtRGF0YShmb3JtKSk7XG4gICAgfSxcbiAgICB1cGRhdGVDYXJ0QXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gICAgICBsZXQgZGF0YSA9ICcnO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXR0cmlidXRlcykpIHtcbiAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgICAgICBjb25zdCBrZXkgPSBhdHRyaWJ1dGVUb1N0cmluZyhhdHRyaWJ1dGUua2V5KTtcbiAgICAgICAgICBpZiAoa2V5ICE9PSAnJykge1xuICAgICAgICAgICAgZGF0YSArPVxuICAgICAgICAgICAgICAnYXR0cmlidXRlc1snICtcbiAgICAgICAgICAgICAga2V5ICtcbiAgICAgICAgICAgICAgJ109JyArXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZVRvU3RyaW5nKGF0dHJpYnV0ZS52YWx1ZSkgK1xuICAgICAgICAgICAgICAnJic7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGF0dHJpYnV0ZXMgPT09ICdvYmplY3QnICYmIGF0dHJpYnV0ZXMgIT09IG51bGwpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgICAgZGF0YSArPVxuICAgICAgICAgICAgJ2F0dHJpYnV0ZXNbJyArXG4gICAgICAgICAgICBhdHRyaWJ1dGVUb1N0cmluZyhrZXkpICtcbiAgICAgICAgICAgICddPScgK1xuICAgICAgICAgICAgYXR0cmlidXRlVG9TdHJpbmcodmFsdWUpICtcbiAgICAgICAgICAgICcmJztcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvdXBkYXRlLmpzJywgZGF0YSk7XG4gICAgfSxcbiAgICB1cGRhdGVDYXJ0Tm90ZShub3RlKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdChcbiAgICAgICAgJy9jYXJ0L3VwZGF0ZS5qcycsXG4gICAgICAgIGBub3RlPSR7YXR0cmlidXRlVG9TdHJpbmcobm90ZSl9YFxuICAgICAgKTtcbiAgICB9LFxuICB9O1xufVxuIiwiLy8gY29kZSBmb3IgdGVzdGltb25pYWxzXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgbmV3IEdsaWRlcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2xpZGVyJyksIHtcbiAgICAvLyBNb2JpbGUtZmlyc3QgZGVmYXVsdHNcbiAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgc2Nyb2xsTG9jazogdHJ1ZSxcbiAgICBkb3RzOiAnI3Jlc3AtZG90cycsXG4gICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgIGFycm93czoge1xuICAgICAgcHJldjogJy5nbGlkZXItcHJldicsXG4gICAgICBuZXh0OiAnLmdsaWRlci1uZXh0JyxcbiAgICB9LFxuICAgIHJlc3BvbnNpdmU6IFtcbiAgICAgIHtcbiAgICAgICAgLy8gc2NyZWVucyBncmVhdGVyIHRoYW4gPj0gNzc1cHhcbiAgICAgICAgYnJlYWtwb2ludDogMCxcbiAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAvLyBTZXQgdG8gYGF1dG9gIGFuZCBwcm92aWRlIGl0ZW0gd2lkdGggdG8gYWRqdXN0IHRvIHZpZXdwb3J0XG4gICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgIGl0ZW1XaWR0aDogMzAwLFxuICAgICAgICAgIGR1cmF0aW9uOiAxLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgLy8gc2NyZWVucyBncmVhdGVyIHRoYW4gPj0gMTAyNHB4XG4gICAgICAgIGJyZWFrcG9pbnQ6IDU0MCxcbiAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICBzbGlkZXNUb1Nob3c6ICdhdXRvJyxcbiAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogJ2F1dG8nLFxuICAgICAgICAgIGl0ZW1XaWR0aDogMzAwLFxuICAgICAgICAgIGR1cmF0aW9uOiAxLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgdG9nZ2xlQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vaGVscGVyLmpzJztcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICBpZiAodGFyZ2V0LmNsb3Nlc3QoJy5kcm9wZG93bi1tZW51JykpIHtcbiAgICBjb25zb2xlLmxvZygncHJldmVudCBkcm9wZG93biBtZW51IGZyb20gY2xvc2luZycpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIC8vIGNsYXNzPVwibmF2YmFyLXRvZ2dsZXJcIiBkYXRhLXRyaWdnZXI9XCIjbmF2YmFyX21haW5cIlxuICBpZiAodGFyZ2V0LmNsb3Nlc3QoJy5uYXZiYXItdG9nZ2xlcltkYXRhLXRyaWdnZXJdJykpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGNvbnN0IG9mZmNhbnZhc19pZCA9IHRhcmdldFxuICAgICAgLmNsb3Nlc3QoJy5uYXZiYXItdG9nZ2xlcltkYXRhLXRyaWdnZXJdJylcbiAgICAgIC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHJpZ2dlcicpO1xuICAgIGNvbnN0IG9mZmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob2ZmY2FudmFzX2lkKTtcbiAgICBpZiAob2ZmY2FudmFzKSB7XG4gICAgICB0b2dnbGVDbGFzcyhvZmZjYW52YXMsICdzaG93Jyk7XG4gICAgfVxuICAgIHRvZ2dsZUNsYXNzKGRvY3VtZW50LmJvZHksICdvZmZjYW52YXMtYWN0aXZlJyk7XG4gICAgY29uc3Qgc2NyZWVuX292ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NyZWVuLW92ZXJsYXknKTtcbiAgICBpZiAoc2NyZWVuX292ZXJsYXkpIHtcbiAgICAgIHRvZ2dsZUNsYXNzKHNjcmVlbl9vdmVybGF5LCAnc2hvdycpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0YXJnZXQuY2xvc2VzdCgnLmJ0bi1jbG9zZSwgLnNjcmVlbi1vdmVybGF5JykpIHtcbiAgICBjb25zdCBzY3JlZW5fb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JlZW4tb3ZlcmxheScpO1xuICAgIGlmIChzY3JlZW5fb3ZlcmxheSkge1xuICAgICAgcmVtb3ZlQ2xhc3Moc2NyZWVuX292ZXJsYXksICdzaG93Jyk7XG4gICAgfVxuICAgIGNvbnN0IG1vYmlsZV9vZmZjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubW9iaWxlLW9mZmNhbnZhcycpO1xuICAgIGlmIChtb2JpbGVfb2ZmY2FudmFzKSB7XG4gICAgICByZW1vdmVDbGFzcyhtb2JpbGVfb2ZmY2FudmFzLCAnc2hvdycpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAnb2ZmY2FudmFzLWFjdGl2ZScpO1xuICB9XG59KTtcbiIsImltcG9ydCBCU04gZnJvbSAnYm9vdHN0cmFwLm5hdGl2ZSc7XG5pbXBvcnQgYWpheEFQSUNyZWF0b3IgZnJvbSAnLi9hamF4YXBpJztcbmltcG9ydCAnLi9zZWN0aW9ucy90ZXN0aW1vbmlhbHMnO1xuaW1wb3J0ICcuL3NlY3Rpb25zL2hlYWRlcic7XG5cbndpbmRvdy5kYXRvbWFyID0ge1xuICBCU04sXG4gIGFwaTogYWpheEFQSUNyZWF0b3Ioe30pLFxufTtcbiJdLCJuYW1lcyI6WyJ0cmFuc2l0aW9uRW5kRXZlbnQiLCJkb2N1bWVudCIsImhlYWQiLCJzdHlsZSIsInN1cHBvcnRUcmFuc2l0aW9uIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbiIsImVsZW1lbnQiLCJkdXJhdGlvbiIsInBhcnNlRmxvYXQiLCJnZXRDb21wdXRlZFN0eWxlIiwiaXNOYU4iLCJlbXVsYXRlVHJhbnNpdGlvbkVuZCIsImhhbmRsZXIiLCJjYWxsZWQiLCJhZGRFdmVudExpc3RlbmVyIiwidHJhbnNpdGlvbkVuZFdyYXBwZXIiLCJlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInNldFRpbWVvdXQiLCJxdWVyeUVsZW1lbnQiLCJzZWxlY3RvciIsInBhcmVudCIsImxvb2tVcCIsIkVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYm9vdHN0cmFwQ3VzdG9tRXZlbnQiLCJldmVudE5hbWUiLCJjb21wb25lbnROYW1lIiwicmVsYXRlZCIsIk9yaWdpbmFsQ3VzdG9tRXZlbnQiLCJDdXN0b21FdmVudCIsImNhbmNlbGFibGUiLCJyZWxhdGVkVGFyZ2V0IiwiZGlzcGF0Y2hDdXN0b21FdmVudCIsImN1c3RvbUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIkFsZXJ0Iiwic2VsZiIsImFsZXJ0IiwiY2xvc2VDdXN0b21FdmVudCIsImNsb3NlZEN1c3RvbUV2ZW50IiwidHJpZ2dlckhhbmRsZXIiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInRyYW5zaXRpb25FbmRIYW5kbGVyIiwidG9nZ2xlRXZlbnRzIiwiYWN0aW9uIiwiY2xpY2tIYW5kbGVyIiwidGFyZ2V0IiwiY2xvc2VzdCIsImNsb3NlIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwiY2FsbCIsImRlZmF1bHRQcmV2ZW50ZWQiLCJkaXNwb3NlIiwicmVtb3ZlIiwiQnV0dG9uIiwibGFiZWxzIiwiY2hhbmdlQ3VzdG9tRXZlbnQiLCJ0b2dnbGUiLCJpbnB1dCIsImxhYmVsIiwidGFnTmFtZSIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwidHlwZSIsImNoZWNrZWQiLCJhZGQiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJ0b2dnbGVkIiwic2NyZWVuWCIsInNjcmVlblkiLCJBcnJheSIsImZyb20iLCJtYXAiLCJvdGhlckxhYmVsIiwib3RoZXJJbnB1dCIsImtleUhhbmRsZXIiLCJrZXkiLCJ3aGljaCIsImtleUNvZGUiLCJhY3RpdmVFbGVtZW50IiwicHJldmVudFNjcm9sbCIsInByZXZlbnREZWZhdWx0IiwiZm9jdXNUb2dnbGUiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwibGVuZ3RoIiwiYnRuIiwibW91c2VIb3ZlckV2ZW50cyIsInN1cHBvcnRQYXNzaXZlIiwicmVzdWx0Iiwib3B0cyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2V0Iiwid3JhcCIsInBhc3NpdmVIYW5kbGVyIiwicGFzc2l2ZSIsImlzRWxlbWVudEluU2Nyb2xsUmFuZ2UiLCJiY3IiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ2aWV3cG9ydEhlaWdodCIsIndpbmRvdyIsImlubmVySGVpZ2h0IiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50SGVpZ2h0IiwidG9wIiwiYm90dG9tIiwiQ2Fyb3VzZWwiLCJvcHRpb25zIiwidmFycyIsIm9wcyIsInNsaWRlQ3VzdG9tRXZlbnQiLCJzbGlkQ3VzdG9tRXZlbnQiLCJzbGlkZXMiLCJsZWZ0QXJyb3ciLCJyaWdodEFycm93IiwiaW5kaWNhdG9yIiwiaW5kaWNhdG9ycyIsInBhdXNlSGFuZGxlciIsImludGVydmFsIiwiaXNTbGlkaW5nIiwiY2xlYXJJbnRlcnZhbCIsInRpbWVyIiwicmVzdW1lSGFuZGxlciIsImN5Y2xlIiwiaW5kaWNhdG9ySGFuZGxlciIsImV2ZW50VGFyZ2V0IiwiaW5kZXgiLCJwYXJzZUludCIsInNsaWRlVG8iLCJjb250cm9sc0hhbmRsZXIiLCJjdXJyZW50VGFyZ2V0Iiwic3JjRWxlbWVudCIsInJlZiIsInBhdXNlIiwidG91Y2giLCJ0b3VjaERvd25IYW5kbGVyIiwia2V5Ym9hcmQiLCJ0b2dnbGVUb3VjaEV2ZW50cyIsInRvdWNoTW92ZUhhbmRsZXIiLCJ0b3VjaEVuZEhhbmRsZXIiLCJpc1RvdWNoIiwidG91Y2hQb3NpdGlvbiIsInN0YXJ0WCIsImNoYW5nZWRUb3VjaGVzIiwicGFnZVgiLCJjdXJyZW50WCIsImVuZFgiLCJNYXRoIiwiYWJzIiwic2V0QWN0aXZlUGFnZSIsInBhZ2VJbmRleCIsIngiLCJuZXh0IiwidGltZW91dCIsImVsYXBzZWRUaW1lIiwiYWN0aXZlSXRlbSIsImdldEFjdGl2ZUluZGV4Iiwib3JpZW50YXRpb24iLCJkaXJlY3Rpb24iLCJoaWRkZW4iLCJzZXRJbnRlcnZhbCIsImlkeCIsIm9mZnNldFdpZHRoIiwiaW5kZXhPZiIsIml0ZW1DbGFzc2VzIiwic2xpZGUiLCJjbHMiLCJpbnRlcnZhbEF0dHJpYnV0ZSIsImludGVydmFsRGF0YSIsInRvdWNoRGF0YSIsInBhdXNlRGF0YSIsImtleWJvYXJkRGF0YSIsImludGVydmFsT3B0aW9uIiwidG91Y2hPcHRpb24iLCJDb2xsYXBzZSIsImFjY29yZGlvbiIsImNvbGxhcHNlIiwiYWN0aXZlQ29sbGFwc2UiLCJzaG93Q3VzdG9tRXZlbnQiLCJzaG93bkN1c3RvbUV2ZW50IiwiaGlkZUN1c3RvbUV2ZW50IiwiaGlkZGVuQ3VzdG9tRXZlbnQiLCJvcGVuQWN0aW9uIiwiY29sbGFwc2VFbGVtZW50IiwiaXNBbmltYXRpbmciLCJoZWlnaHQiLCJzY3JvbGxIZWlnaHQiLCJjbG9zZUFjdGlvbiIsInNob3ciLCJoaWRlIiwiaWQiLCJhY2NvcmRpb25EYXRhIiwic2V0Rm9jdXMiLCJmb2N1cyIsInNldEFjdGl2ZSIsIkRyb3Bkb3duIiwib3B0aW9uIiwibWVudSIsIm1lbnVJdGVtcyIsInBlcnNpc3QiLCJwcmV2ZW50RW1wdHlBbmNob3IiLCJhbmNob3IiLCJocmVmIiwic2xpY2UiLCJ0b2dnbGVEaXNtaXNzIiwib3BlbiIsImRpc21pc3NIYW5kbGVyIiwiaGFzRGF0YSIsImlzU2FtZUVsZW1lbnQiLCJpc0luc2lkZU1lbnUiLCJpc01lbnVJdGVtIiwiY2hpbGRyZW4iLCJjaGlsZCIsInB1c2giLCJNb2RhbCIsIm1vZGFsIiwic2Nyb2xsQmFyV2lkdGgiLCJvdmVybGF5Iiwib3ZlcmxheURlbGF5IiwiZml4ZWRJdGVtcyIsInNldFNjcm9sbGJhciIsIm9wZW5Nb2RhbCIsImJvZHkiLCJib2R5UGFkIiwicGFkZGluZ1JpZ2h0IiwiYm9keU92ZXJmbG93IiwibW9kYWxPdmVyZmxvdyIsIm1lYXN1cmVTY3JvbGxiYXIiLCJmaXhlZCIsIml0ZW1QYWQiLCJyZXNldFNjcm9sbGJhciIsInNjcm9sbERpdiIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aFZhbHVlIiwiY2xhc3NOYW1lIiwiYXBwZW5kQ2hpbGQiLCJjbGllbnRXaWR0aCIsImNyZWF0ZU92ZXJsYXkiLCJuZXdPdmVybGF5IiwiYW5pbWF0aW9uIiwicmVtb3ZlT3ZlcmxheSIsInVwZGF0ZSIsImJlZm9yZVNob3ciLCJkaXNwbGF5IiwidHJpZ2dlclNob3ciLCJ0cmlnZ2VySGlkZSIsImZvcmNlIiwiY2xpY2tUYXJnZXQiLCJtb2RhbElEIiwidGFyZ2V0QXR0clZhbHVlIiwiZWxlbUF0dHJWYWx1ZSIsIm1vZGFsVHJpZ2dlciIsInBhcmVudFdpdGhEYXRhIiwiYmFja2Ryb3AiLCJjdXJyZW50T3BlbiIsInNldENvbnRlbnQiLCJjb250ZW50IiwiaW5uZXJIVE1MIiwiY2hlY2tNb2RhbCIsImNvbmNhdCIsInRyaW0iLCJtb3VzZUNsaWNrRXZlbnRzIiwiZG93biIsInVwIiwiZ2V0U2Nyb2xsIiwieSIsInBhZ2VZT2Zmc2V0Iiwic2Nyb2xsVG9wIiwicGFnZVhPZmZzZXQiLCJzY3JvbGxMZWZ0Iiwic3R5bGVUaXAiLCJsaW5rIiwicG9zaXRpb24iLCJ0aXBQb3NpdGlvbnMiLCJlbGVtZW50RGltZW5zaW9ucyIsInciLCJoIiwib2Zmc2V0SGVpZ2h0Iiwid2luZG93V2lkdGgiLCJ3aW5kb3dIZWlnaHQiLCJyZWN0Iiwic2Nyb2xsIiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsImxpbmtEaW1lbnNpb25zIiwicmlnaHQiLCJsZWZ0IiwiaXNQb3BvdmVyIiwiYXJyb3ciLCJoYWxmVG9wRXhjZWVkIiwiaGFsZkxlZnRFeGNlZWQiLCJoYWxmUmlnaHRFeGNlZWQiLCJoYWxmQm90dG9tRXhjZWVkIiwidG9wRXhjZWVkIiwibGVmdEV4Y2VlZCIsImJvdHRvbUV4Y2VlZCIsInJpZ2h0RXhjZWVkIiwidG9wUG9zaXRpb24iLCJsZWZ0UG9zaXRpb24iLCJhcnJvd1RvcCIsImFycm93TGVmdCIsImFycm93V2lkdGgiLCJhcnJvd0hlaWdodCIsInJlcGxhY2UiLCJQb3BvdmVyIiwicG9wb3ZlciIsImlzSXBob25lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInRpdGxlU3RyaW5nIiwiY29udGVudFN0cmluZyIsInRyaWdnZXJEYXRhIiwiYW5pbWF0aW9uRGF0YSIsInBsYWNlbWVudERhdGEiLCJkaXNtaXNzaWJsZURhdGEiLCJkZWxheURhdGEiLCJjb250YWluZXJEYXRhIiwiY2xvc2VCdG4iLCJjb250YWluZXJFbGVtZW50IiwiY29udGFpbmVyRGF0YUVsZW1lbnQiLCJuYXZiYXJGaXhlZFRvcCIsIm5hdmJhckZpeGVkQm90dG9tIiwicGxhY2VtZW50Q2xhc3MiLCJkaXNtaXNzaWJsZUhhbmRsZXIiLCJnZXRDb250ZW50cyIsInRpdGxlIiwicmVtb3ZlUG9wb3ZlciIsImNvbnRhaW5lciIsImNyZWF0ZVBvcG92ZXIiLCJwb3BvdmVyQXJyb3ciLCJ0ZW1wbGF0ZSIsInBvcG92ZXJUaXRsZSIsImRpc21pc3NpYmxlIiwicG9wb3ZlckJvZHlNYXJrdXAiLCJwb3BvdmVyVGVtcGxhdGUiLCJmaXJzdENoaWxkIiwicG9wb3ZlckhlYWRlciIsInBvcG92ZXJCb2R5Iiwic2hvd1BvcG92ZXIiLCJ1cGRhdGVQb3BvdmVyIiwicGxhY2VtZW50IiwiZm9yY2VGb2N1cyIsInRyaWdnZXIiLCJ0b3VjaEhhbmRsZXIiLCJkaXNtaXNzSGFuZGxlclRvZ2dsZSIsInNob3dUcmlnZ2VyIiwiaGlkZVRyaWdnZXIiLCJjbGVhclRpbWVvdXQiLCJkZWxheSIsInBvcG92ZXJDb250ZW50cyIsIlNjcm9sbFNweSIsInRhcmdldERhdGEiLCJvZmZzZXREYXRhIiwic3B5VGFyZ2V0Iiwic2Nyb2xsVGFyZ2V0IiwidXBkYXRlVGFyZ2V0cyIsImxpbmtzIiwiaXRlbXMiLCJ0YXJnZXRzIiwidGFyZ2V0SXRlbSIsImNoYXJBdCIsInVwZGF0ZUl0ZW0iLCJpdGVtIiwiZHJvcG1lbnUiLCJkcm9wTGluayIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciLCJuZXh0U2libGluZyIsIm5leHRFbGVtZW50U2libGluZyIsImFjdGl2ZVNpYmxpbmciLCJ0YXJnZXRSZWN0IiwiaXNXaW5kb3ciLCJpc0FjdGl2ZSIsInRvcEVkZ2UiLCJzY3JvbGxPZmZzZXQiLCJvZmZzZXQiLCJib3R0b21FZGdlIiwiaW5zaWRlIiwidXBkYXRlSXRlbXMiLCJsIiwicmVmcmVzaCIsIlRhYiIsImhlaWdodERhdGEiLCJ0YWJzIiwiZHJvcGRvd24iLCJ0YWJzQ29udGVudENvbnRhaW5lciIsImFjdGl2ZVRhYiIsImFjdGl2ZUNvbnRlbnQiLCJuZXh0Q29udGVudCIsImNvbnRhaW5lckhlaWdodCIsImVxdWFsQ29udGVudHMiLCJuZXh0SGVpZ2h0IiwiYW5pbWF0ZUhlaWdodCIsInRyaWdnZXJFbmQiLCJnZXRBY3RpdmVUYWIiLCJhY3RpdmVUYWJzIiwiZ2V0QWN0aXZlQ29udGVudCIsIlRvYXN0IiwidG9hc3QiLCJhdXRvaGlkZURhdGEiLCJzaG93Q29tcGxldGUiLCJhdXRvaGlkZSIsImhpZGVDb21wbGV0ZSIsImRpc3Bvc2VDb21wbGV0ZSIsIm5vVGltZXIiLCJUb29sdGlwIiwidG9vbHRpcCIsImdldFRpdGxlIiwicmVtb3ZlVG9vbFRpcCIsImNyZWF0ZVRvb2xUaXAiLCJ0b29sdGlwTWFya3VwIiwidG9vbHRpcEFycm93IiwidG9vbHRpcElubmVyIiwidXBkYXRlVG9vbHRpcCIsInNob3dUb29sdGlwIiwidG9nZ2xlQWN0aW9uIiwic2hvd0FjdGlvbiIsImhpZGVBY3Rpb24iLCJjb21wb25lbnRzSW5pdCIsImluaXRpYWxpemVEYXRhQVBJIiwiQ29uc3RydWN0b3IiLCJjb2xsZWN0aW9uIiwiaW5pdENhbGxiYWNrIiwiY29tcG9uZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImluaXRXcmFwcGVyIiwicmVtb3ZlRWxlbWVudERhdGFBUEkiLCJDb25zdHJ1Y3Rvck5hbWUiLCJyZW1vdmVEYXRhQVBJIiwidmVyc2lvbiIsIlZlcnNpb24iLCJiaW5kIiwiZm4iLCJ0aGlzQXJnIiwiYXJncyIsImFyZ3VtZW50cyIsImkiLCJhcHBseSIsInRvU3RyaW5nIiwicHJvdG90eXBlIiwiaXNBcnJheSIsInZhbCIsImlzVW5kZWZpbmVkIiwiaXNCdWZmZXIiLCJjb25zdHJ1Y3RvciIsImlzQXJyYXlCdWZmZXIiLCJpc0Zvcm1EYXRhIiwiRm9ybURhdGEiLCJpc0FycmF5QnVmZmVyVmlldyIsIkFycmF5QnVmZmVyIiwiaXNWaWV3IiwiYnVmZmVyIiwiaXNTdHJpbmciLCJpc051bWJlciIsImlzT2JqZWN0IiwiaXNQbGFpbk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwiaXNEYXRlIiwiaXNGaWxlIiwiaXNCbG9iIiwiaXNGdW5jdGlvbiIsImlzU3RyZWFtIiwicGlwZSIsImlzVVJMU2VhcmNoUGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwic3RyIiwiaXNTdGFuZGFyZEJyb3dzZXJFbnYiLCJwcm9kdWN0IiwiZm9yRWFjaCIsIm9iaiIsImhhc093blByb3BlcnR5IiwibWVyZ2UiLCJhc3NpZ25WYWx1ZSIsImV4dGVuZCIsImEiLCJiIiwic3RyaXBCT00iLCJjaGFyQ29kZUF0IiwiZW5jb2RlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiYnVpbGRVUkwiLCJ1cmwiLCJwYXJhbXMiLCJwYXJhbXNTZXJpYWxpemVyIiwic2VyaWFsaXplZFBhcmFtcyIsInV0aWxzIiwicGFydHMiLCJzZXJpYWxpemUiLCJwYXJzZVZhbHVlIiwidiIsInRvSVNPU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImpvaW4iLCJoYXNobWFya0luZGV4IiwiSW50ZXJjZXB0b3JNYW5hZ2VyIiwiaGFuZGxlcnMiLCJ1c2UiLCJmdWxmaWxsZWQiLCJyZWplY3RlZCIsImVqZWN0IiwiZm9yRWFjaEhhbmRsZXIiLCJ0cmFuc2Zvcm1EYXRhIiwiZGF0YSIsImhlYWRlcnMiLCJmbnMiLCJ0cmFuc2Zvcm0iLCJpc0NhbmNlbCIsInZhbHVlIiwiX19DQU5DRUxfXyIsIm5vcm1hbGl6ZUhlYWRlck5hbWUiLCJub3JtYWxpemVkTmFtZSIsInByb2Nlc3NIZWFkZXIiLCJuYW1lIiwidG9VcHBlckNhc2UiLCJlbmhhbmNlRXJyb3IiLCJlcnJvciIsImNvbmZpZyIsImNvZGUiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJpc0F4aW9zRXJyb3IiLCJ0b0pTT04iLCJtZXNzYWdlIiwiZGVzY3JpcHRpb24iLCJudW1iZXIiLCJmaWxlTmFtZSIsImxpbmVOdW1iZXIiLCJjb2x1bW5OdW1iZXIiLCJzdGFjayIsImNyZWF0ZUVycm9yIiwiRXJyb3IiLCJzZXR0bGUiLCJyZXNvbHZlIiwicmVqZWN0IiwidmFsaWRhdGVTdGF0dXMiLCJzdGF0dXMiLCJzdGFuZGFyZEJyb3dzZXJFbnYiLCJ3cml0ZSIsImV4cGlyZXMiLCJwYXRoIiwiZG9tYWluIiwic2VjdXJlIiwiY29va2llIiwiRGF0ZSIsInRvR01UU3RyaW5nIiwicmVhZCIsIm1hdGNoIiwiUmVnRXhwIiwiZGVjb2RlVVJJQ29tcG9uZW50Iiwibm93Iiwibm9uU3RhbmRhcmRCcm93c2VyRW52IiwiaXNBYnNvbHV0ZVVSTCIsImNvbWJpbmVVUkxzIiwiYmFzZVVSTCIsInJlbGF0aXZlVVJMIiwiYnVpbGRGdWxsUGF0aCIsInJlcXVlc3RlZFVSTCIsImlnbm9yZUR1cGxpY2F0ZU9mIiwicGFyc2VIZWFkZXJzIiwicGFyc2VkIiwic3BsaXQiLCJwYXJzZXIiLCJsaW5lIiwic3Vic3RyIiwidG9Mb3dlckNhc2UiLCJtc2llIiwidXJsUGFyc2luZ05vZGUiLCJvcmlnaW5VUkwiLCJyZXNvbHZlVVJMIiwicHJvdG9jb2wiLCJob3N0Iiwic2VhcmNoIiwiaGFzaCIsImhvc3RuYW1lIiwicG9ydCIsInBhdGhuYW1lIiwibG9jYXRpb24iLCJpc1VSTFNhbWVPcmlnaW4iLCJyZXF1ZXN0VVJMIiwieGhyQWRhcHRlciIsIlByb21pc2UiLCJkaXNwYXRjaFhoclJlcXVlc3QiLCJyZXF1ZXN0RGF0YSIsInJlcXVlc3RIZWFkZXJzIiwiWE1MSHR0cFJlcXVlc3QiLCJhdXRoIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInVuZXNjYXBlIiwiQXV0aG9yaXphdGlvbiIsImJ0b2EiLCJmdWxsUGF0aCIsIm1ldGhvZCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsImhhbmRsZUxvYWQiLCJyZWFkeVN0YXRlIiwicmVzcG9uc2VVUkwiLCJyZXNwb25zZUhlYWRlcnMiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJyZXNwb25zZURhdGEiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJzdGF0dXNUZXh0Iiwib25hYm9ydCIsImhhbmRsZUFib3J0Iiwib25lcnJvciIsImhhbmRsZUVycm9yIiwib250aW1lb3V0IiwiaGFuZGxlVGltZW91dCIsInRpbWVvdXRFcnJvck1lc3NhZ2UiLCJ4c3JmVmFsdWUiLCJ3aXRoQ3JlZGVudGlhbHMiLCJ4c3JmQ29va2llTmFtZSIsImNvb2tpZXMiLCJ1bmRlZmluZWQiLCJ4c3JmSGVhZGVyTmFtZSIsInNldFJlcXVlc3RIZWFkZXIiLCJvbkRvd25sb2FkUHJvZ3Jlc3MiLCJvblVwbG9hZFByb2dyZXNzIiwidXBsb2FkIiwiY2FuY2VsVG9rZW4iLCJwcm9taXNlIiwidGhlbiIsIm9uQ2FuY2VsZWQiLCJjYW5jZWwiLCJhYm9ydCIsInNlbmQiLCJERUZBVUxUX0NPTlRFTlRfVFlQRSIsInNldENvbnRlbnRUeXBlSWZVbnNldCIsImdldERlZmF1bHRBZGFwdGVyIiwiYWRhcHRlciIsInJlcXVpcmUkJDAiLCJwcm9jZXNzIiwicmVxdWlyZSQkMSIsImRlZmF1bHRzIiwidHJhbnNmb3JtUmVxdWVzdCIsInRyYW5zZm9ybVJlc3BvbnNlIiwicGFyc2UiLCJtYXhDb250ZW50TGVuZ3RoIiwibWF4Qm9keUxlbmd0aCIsImNvbW1vbiIsImZvckVhY2hNZXRob2ROb0RhdGEiLCJmb3JFYWNoTWV0aG9kV2l0aERhdGEiLCJ0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkIiwidGhyb3dJZlJlcXVlc3RlZCIsImRpc3BhdGNoUmVxdWVzdCIsImNsZWFuSGVhZGVyQ29uZmlnIiwib25BZGFwdGVyUmVzb2x1dGlvbiIsIm9uQWRhcHRlclJlamVjdGlvbiIsInJlYXNvbiIsIm1lcmdlQ29uZmlnIiwiY29uZmlnMSIsImNvbmZpZzIiLCJ2YWx1ZUZyb21Db25maWcyS2V5cyIsIm1lcmdlRGVlcFByb3BlcnRpZXNLZXlzIiwiZGVmYXVsdFRvQ29uZmlnMktleXMiLCJkaXJlY3RNZXJnZUtleXMiLCJnZXRNZXJnZWRWYWx1ZSIsInNvdXJjZSIsIm1lcmdlRGVlcFByb3BlcnRpZXMiLCJwcm9wIiwidmFsdWVGcm9tQ29uZmlnMiIsImRlZmF1bHRUb0NvbmZpZzIiLCJheGlvc0tleXMiLCJvdGhlcktleXMiLCJrZXlzIiwiZmlsdGVyIiwiZmlsdGVyQXhpb3NLZXlzIiwiQXhpb3MiLCJpbnN0YW5jZUNvbmZpZyIsImludGVyY2VwdG9ycyIsImNoYWluIiwidW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMiLCJpbnRlcmNlcHRvciIsInVuc2hpZnQiLCJwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMiLCJzaGlmdCIsImdldFVyaSIsIkNhbmNlbCIsIkNhbmNlbFRva2VuIiwiZXhlY3V0b3IiLCJUeXBlRXJyb3IiLCJyZXNvbHZlUHJvbWlzZSIsInByb21pc2VFeGVjdXRvciIsInRva2VuIiwiYyIsInNwcmVhZCIsImNhbGxiYWNrIiwiYXJyIiwiY3JlYXRlSW5zdGFuY2UiLCJkZWZhdWx0Q29uZmlnIiwiY29udGV4dCIsImluc3RhbmNlIiwiYXhpb3MiLCJjcmVhdGUiLCJyZXF1aXJlJCQyIiwiYWxsIiwicHJvbWlzZXMiLCJyZXF1aXJlJCQzIiwiYXR0cmlidXRlVG9TdHJpbmciLCJhdHRyaWJ1dGUiLCJ0b2dnbGVDbGFzcyIsImVsZW0iLCJyZW1vdmVDbGFzcyIsImNsYXNzTmFtZXMiLCJheGlvc0NvbmZpZyIsImdldENhcnQiLCJnZXRQcm9kdWN0IiwiaGFuZGxlIiwiY2xlYXJDYXJ0IiwicG9zdCIsInVwZGF0ZUNhcnRGcm9tRm9ybSIsImZvcm0iLCJjaGFuZ2VJdGVtQnlLZXlPcklkIiwia2V5T3JJZCIsInF1YW50aXR5IiwicmVtb3ZlSXRlbUJ5S2V5T3JJZCIsImNoYW5nZUl0ZW1CeUxpbmUiLCJyZW1vdmVJdGVtQnlMaW5lIiwiYWRkSXRlbSIsInByb3BlcnRpZXMiLCJhZGRJdGVtRnJvbUZvcm0iLCJ1cGRhdGVDYXJ0QXR0cmlidXRlcyIsImF0dHJpYnV0ZXMiLCJ1cGRhdGVDYXJ0Tm90ZSIsIm5vdGUiLCJHbGlkZXIiLCJzbGlkZXNUb1Nob3ciLCJzbGlkZXNUb1Njcm9sbCIsInNjcm9sbExvY2siLCJkb3RzIiwiZHJhZ2dhYmxlIiwiYXJyb3dzIiwicHJldiIsInJlc3BvbnNpdmUiLCJicmVha3BvaW50Iiwic2V0dGluZ3MiLCJpdGVtV2lkdGgiLCJldmVudCIsImNvbnNvbGUiLCJsb2ciLCJzdG9wUHJvcGFnYXRpb24iLCJvZmZjYW52YXNfaWQiLCJvZmZjYW52YXMiLCJzY3JlZW5fb3ZlcmxheSIsIm1vYmlsZV9vZmZjYW52YXMiLCJkYXRvbWFyIiwiQlNOIiwiYXBpIiwiYWpheEFQSUNyZWF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0VBQUE7Ozs7O0VBS0EsSUFBSUEsa0JBQWtCLEdBQUcsc0JBQXNCQyxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBcEMsR0FBNEMscUJBQTVDLEdBQW9FLGVBQTdGO0VBRUEsSUFBSUMsaUJBQWlCLEdBQUcsc0JBQXNCSCxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBcEMsSUFBNkMsZ0JBQWdCRixRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBbkc7RUFFQSxJQUFJRSxrQkFBa0IsR0FBRyxzQkFBc0JKLFFBQVEsQ0FBQ0MsSUFBVCxDQUFjQyxLQUFwQyxHQUE0QywwQkFBNUMsR0FBeUUsb0JBQWxHOztFQUVBLFNBQVNHLDRCQUFULENBQXNDQyxPQUF0QyxFQUErQztFQUM3QyxNQUFJQyxRQUFRLEdBQUdKLGlCQUFpQixHQUFHSyxVQUFVLENBQUNDLGdCQUFnQixDQUFDSCxPQUFELENBQWhCLENBQTBCRixrQkFBMUIsQ0FBRCxDQUFiLEdBQStELENBQS9GO0VBQ0FHLEVBQUFBLFFBQVEsR0FBRyxPQUFPQSxRQUFQLEtBQW9CLFFBQXBCLElBQWdDLENBQUNHLEtBQUssQ0FBQ0gsUUFBRCxDQUF0QyxHQUFtREEsUUFBUSxHQUFHLElBQTlELEdBQXFFLENBQWhGO0VBQ0EsU0FBT0EsUUFBUDtFQUNEOztFQUVELFNBQVNJLG9CQUFULENBQThCTCxPQUE5QixFQUFzQ00sT0FBdEMsRUFBOEM7RUFDNUMsTUFBSUMsTUFBTSxHQUFHLENBQWI7RUFBQSxNQUFnQk4sUUFBUSxHQUFHRiw0QkFBNEIsQ0FBQ0MsT0FBRCxDQUF2RDtFQUNBQyxFQUFBQSxRQUFRLEdBQUdELE9BQU8sQ0FBQ1EsZ0JBQVIsQ0FBMEJmLGtCQUExQixFQUE4QyxTQUFTZ0Isb0JBQVQs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
