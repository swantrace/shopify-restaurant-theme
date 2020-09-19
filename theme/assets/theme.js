(function (factory) {
  typeof define === 'function' && define.amd ? define('index', factory) :
  factory();
}((function () { 'use strict';

  /*!
    * Native JavaScript for Bootstrap v3.0.9 (https://thednp.github.io/bootstrap.native/)
    * Copyright 2015-2020 © [object Object]
    * Licensed under MIT (https://github.com/thednp/bootstrap.native/blob/master/LICENSE)
    */
  var transitionEndEvent = 'webkitTransition' in document.body.style ? 'webkitTransitionEnd' : 'transitionend';
  var supportTransition = 'webkitTransition' in document.body.style || 'transition' in document.body.style;
  var transitionDuration = 'webkitTransition' in document.body.style ? 'webkitTransitionDuration' : 'transitionDuration';

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

  var version = "3.0.9";
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ib290c3RyYXAubmF0aXZlL2Rpc3QvYm9vdHN0cmFwLW5hdGl2ZS5lc20uanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvaGVscGVyLmpzIiwic3JjL3NjcmlwdHMvYWpheGFwaS5qcyIsInNyYy9zY3JpcHRzL3NlY3Rpb25zL3Rlc3RpbW9uaWFscy5qcyIsInNyYy9zY3JpcHRzL3NlY3Rpb25zL2hlYWRlci5qcyIsInNyYy9zY3JpcHRzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICAqIE5hdGl2ZSBKYXZhU2NyaXB0IGZvciBCb290c3RyYXAgdjMuMC45IChodHRwczovL3RoZWRucC5naXRodWIuaW8vYm9vdHN0cmFwLm5hdGl2ZS8pXG4gICogQ29weXJpZ2h0IDIwMTUtMjAyMCDCqSBbb2JqZWN0IE9iamVjdF1cbiAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90aGVkbnAvYm9vdHN0cmFwLm5hdGl2ZS9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICAqL1xudmFyIHRyYW5zaXRpb25FbmRFdmVudCA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID8gJ3dlYmtpdFRyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnO1xuXG52YXIgc3VwcG9ydFRyYW5zaXRpb24gPSAnd2Via2l0VHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAndHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxudmFyIHRyYW5zaXRpb25EdXJhdGlvbiA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID8gJ3dlYmtpdFRyYW5zaXRpb25EdXJhdGlvbicgOiAndHJhbnNpdGlvbkR1cmF0aW9uJztcblxuZnVuY3Rpb24gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihlbGVtZW50KSB7XG4gIHZhciBkdXJhdGlvbiA9IHN1cHBvcnRUcmFuc2l0aW9uID8gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpW3RyYW5zaXRpb25EdXJhdGlvbl0pIDogMDtcbiAgZHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmICFpc05hTihkdXJhdGlvbikgPyBkdXJhdGlvbiAqIDEwMDAgOiAwO1xuICByZXR1cm4gZHVyYXRpb247XG59XG5cbmZ1bmN0aW9uIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGVsZW1lbnQsaGFuZGxlcil7XG4gIHZhciBjYWxsZWQgPSAwLCBkdXJhdGlvbiA9IGdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24oZWxlbWVudCk7XG4gIGR1cmF0aW9uID8gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCB0cmFuc2l0aW9uRW5kRXZlbnQsIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRXcmFwcGVyKGUpe1xuICAgICAgICAgICAgICAhY2FsbGVkICYmIGhhbmRsZXIoZSksIGNhbGxlZCA9IDE7XG4gICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHJhbnNpdGlvbkVuZEV2ZW50LCB0cmFuc2l0aW9uRW5kV3JhcHBlcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICA6IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICFjYWxsZWQgJiYgaGFuZGxlcigpLCBjYWxsZWQgPSAxOyB9LCAxNyk7XG59XG5cbmZ1bmN0aW9uIHF1ZXJ5RWxlbWVudChzZWxlY3RvciwgcGFyZW50KSB7XG4gIHZhciBsb29rVXAgPSBwYXJlbnQgJiYgcGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IGRvY3VtZW50O1xuICByZXR1cm4gc2VsZWN0b3IgaW5zdGFuY2VvZiBFbGVtZW50ID8gc2VsZWN0b3IgOiBsb29rVXAucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgY29tcG9uZW50TmFtZSwgcmVsYXRlZCkge1xuICB2YXIgT3JpZ2luYWxDdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCggZXZlbnROYW1lICsgJy5icy4nICsgY29tcG9uZW50TmFtZSwge2NhbmNlbGFibGU6IHRydWV9KTtcbiAgT3JpZ2luYWxDdXN0b21FdmVudC5yZWxhdGVkVGFyZ2V0ID0gcmVsYXRlZDtcbiAgcmV0dXJuIE9yaWdpbmFsQ3VzdG9tRXZlbnQ7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ3VzdG9tRXZlbnQoY3VzdG9tRXZlbnQpe1xuICB0aGlzICYmIHRoaXMuZGlzcGF0Y2hFdmVudChjdXN0b21FdmVudCk7XG59XG5cbmZ1bmN0aW9uIEFsZXJ0KGVsZW1lbnQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGFsZXJ0LFxuICAgIGNsb3NlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnY2xvc2UnLCdhbGVydCcpLFxuICAgIGNsb3NlZEN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2Nsb3NlZCcsJ2FsZXJ0Jyk7XG4gIGZ1bmN0aW9uIHRyaWdnZXJIYW5kbGVyKCkge1xuICAgIGFsZXJ0LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gZW11bGF0ZVRyYW5zaXRpb25FbmQoYWxlcnQsdHJhbnNpdGlvbkVuZEhhbmRsZXIpIDogdHJhbnNpdGlvbkVuZEhhbmRsZXIoKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKXtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGFsZXJ0ID0gZSAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLmFsZXJ0XCIpO1xuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXScsYWxlcnQpO1xuICAgIGVsZW1lbnQgJiYgYWxlcnQgJiYgKGVsZW1lbnQgPT09IGUudGFyZ2V0IHx8IGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpKSAmJiBzZWxmLmNsb3NlKCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZEhhbmRsZXIoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgYWxlcnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChhbGVydCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFsZXJ0LGNsb3NlZEN1c3RvbUV2ZW50KTtcbiAgfVxuICBzZWxmLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggYWxlcnQgJiYgZWxlbWVudCAmJiBhbGVydC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhbGVydCxjbG9zZUN1c3RvbUV2ZW50KTtcbiAgICAgIGlmICggY2xvc2VDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgIHNlbGYuZGlzcG9zZSgpO1xuICAgICAgYWxlcnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgdHJpZ2dlckhhbmRsZXIoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5BbGVydDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgYWxlcnQgPSBlbGVtZW50LmNsb3Nlc3QoJy5hbGVydCcpO1xuICBlbGVtZW50LkFsZXJ0ICYmIGVsZW1lbnQuQWxlcnQuZGlzcG9zZSgpO1xuICBpZiAoICFlbGVtZW50LkFsZXJ0ICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBzZWxmLmVsZW1lbnQgPSBlbGVtZW50O1xuICBlbGVtZW50LkFsZXJ0ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gQnV0dG9uKGVsZW1lbnQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLCBsYWJlbHMsXG4gICAgICBjaGFuZ2VDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdjaGFuZ2UnLCAnYnV0dG9uJyk7XG4gIGZ1bmN0aW9uIHRvZ2dsZShlKSB7XG4gICAgdmFyIGlucHV0LFxuICAgICAgICBsYWJlbCA9IGUudGFyZ2V0LnRhZ05hbWUgPT09ICdMQUJFTCcgPyBlLnRhcmdldFxuICAgICAgICAgICAgICA6IGUudGFyZ2V0LmNsb3Nlc3QoJ0xBQkVMJykgPyBlLnRhcmdldC5jbG9zZXN0KCdMQUJFTCcpIDogbnVsbDtcbiAgICBpbnB1dCA9IGxhYmVsICYmIGxhYmVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdO1xuICAgIGlmICggIWlucHV0ICkgeyByZXR1cm47IH1cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoaW5wdXQsIGNoYW5nZUN1c3RvbUV2ZW50KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgY2hhbmdlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaW5wdXQudHlwZSA9PT0gJ2NoZWNrYm94JyApIHtcbiAgICAgIGlmICggY2hhbmdlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICBpZiAoICFpbnB1dC5jaGVja2VkICkge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIWVsZW1lbnQudG9nZ2xlZCkge1xuICAgICAgICBlbGVtZW50LnRvZ2dsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIGlucHV0LnR5cGUgPT09ICdyYWRpbycgJiYgIWVsZW1lbnQudG9nZ2xlZCApIHtcbiAgICAgIGlmICggY2hhbmdlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICBpZiAoICFpbnB1dC5jaGVja2VkIHx8IChlLnNjcmVlblggPT09IDAgJiYgZS5zY3JlZW5ZID09IDApICkge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZm9jdXMnKTtcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKCdjaGVja2VkJywnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgZWxlbWVudC50b2dnbGVkID0gdHJ1ZTtcbiAgICAgICAgQXJyYXkuZnJvbShsYWJlbHMpLm1hcChmdW5jdGlvbiAob3RoZXJMYWJlbCl7XG4gICAgICAgICAgdmFyIG90aGVySW5wdXQgPSBvdGhlckxhYmVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdO1xuICAgICAgICAgIGlmICggb3RoZXJMYWJlbCAhPT0gbGFiZWwgJiYgb3RoZXJMYWJlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICkgIHtcbiAgICAgICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChvdGhlcklucHV0LCBjaGFuZ2VDdXN0b21FdmVudCk7XG4gICAgICAgICAgICBvdGhlckxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgb3RoZXJJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgIG90aGVySW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHsgZWxlbWVudC50b2dnbGVkID0gZmFsc2U7IH0sIDUwICk7XG4gIH1cbiAgZnVuY3Rpb24ga2V5SGFuZGxlcihlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGtleSA9PT0gMzIgJiYgZS50YXJnZXQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgdG9nZ2xlKGUpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRTY3JvbGwoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBrZXkgPT09IDMyICYmIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBmdW5jdGlvbiBmb2N1c1RvZ2dsZShlKSB7XG4gICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdJTlBVVCcgKSB7XG4gICAgICB2YXIgYWN0aW9uID0gZS50eXBlID09PSAnZm9jdXNpbicgPyAnYWRkJyA6ICdyZW1vdmUnO1xuICAgICAgZS50YXJnZXQuY2xvc2VzdCgnLmJ0bicpLmNsYXNzTGlzdFthY3Rpb25dKCdmb2N1cycpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgnY2xpY2snLHRvZ2dsZSxmYWxzZSApO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgna2V5dXAnLGtleUhhbmRsZXIsZmFsc2UpLCBlbGVtZW50W2FjdGlvbl0oJ2tleWRvd24nLHByZXZlbnRTY3JvbGwsZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgnZm9jdXNpbicsZm9jdXNUb2dnbGUsZmFsc2UpLCBlbGVtZW50W2FjdGlvbl0oJ2ZvY3Vzb3V0Jyxmb2N1c1RvZ2dsZSxmYWxzZSk7XG4gIH1cbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkJ1dHRvbjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5CdXR0b24gJiYgZWxlbWVudC5CdXR0b24uZGlzcG9zZSgpO1xuICBsYWJlbHMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2J0bicpO1xuICBpZiAoIWxhYmVscy5sZW5ndGgpIHsgcmV0dXJuOyB9XG4gIGlmICggIWVsZW1lbnQuQnV0dG9uICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBlbGVtZW50LnRvZ2dsZWQgPSBmYWxzZTtcbiAgZWxlbWVudC5CdXR0b24gPSBzZWxmO1xuICBBcnJheS5mcm9tKGxhYmVscykubWFwKGZ1bmN0aW9uIChidG4pe1xuICAgICFidG4uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKVxuICAgICAgJiYgcXVlcnlFbGVtZW50KCdpbnB1dDpjaGVja2VkJyxidG4pXG4gICAgICAmJiBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYnRuLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJylcbiAgICAgICYmICFxdWVyeUVsZW1lbnQoJ2lucHV0OmNoZWNrZWQnLGJ0bilcbiAgICAgICYmIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgfSk7XG59XG5cbnZhciBtb3VzZUhvdmVyRXZlbnRzID0gKCdvbm1vdXNlbGVhdmUnIGluIGRvY3VtZW50KSA/IFsgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddIDogWyAnbW91c2VvdmVyJywgJ21vdXNlb3V0JyBdO1xuXG52YXIgc3VwcG9ydFBhc3NpdmUgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gd3JhcCgpe1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHdyYXAsIG9wdHMpO1xuICAgIH0sIG9wdHMpO1xuICB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4gcmVzdWx0O1xufSkoKTtcblxudmFyIHBhc3NpdmVIYW5kbGVyID0gc3VwcG9ydFBhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnRJblNjcm9sbFJhbmdlKGVsZW1lbnQpIHtcbiAgdmFyIGJjciA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB2aWV3cG9ydEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZXR1cm4gYmNyLnRvcCA8PSB2aWV3cG9ydEhlaWdodCAmJiBiY3IuYm90dG9tID49IDA7XG59XG5cbmZ1bmN0aW9uIENhcm91c2VsIChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICB2YXJzLCBvcHMsXG4gICAgc2xpZGVDdXN0b21FdmVudCwgc2xpZEN1c3RvbUV2ZW50LFxuICAgIHNsaWRlcywgbGVmdEFycm93LCByaWdodEFycm93LCBpbmRpY2F0b3IsIGluZGljYXRvcnM7XG4gIGZ1bmN0aW9uIHBhdXNlSGFuZGxlcigpIHtcbiAgICBpZiAoIG9wcy5pbnRlcnZhbCAhPT1mYWxzZSAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BhdXNlZCcpICkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKTtcbiAgICAgICF2YXJzLmlzU2xpZGluZyAmJiAoIGNsZWFySW50ZXJ2YWwodmFycy50aW1lciksIHZhcnMudGltZXIgPSBudWxsICk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlc3VtZUhhbmRsZXIoKSB7XG4gICAgaWYgKCBvcHMuaW50ZXJ2YWwgIT09IGZhbHNlICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncGF1c2VkJyk7XG4gICAgICAhdmFycy5pc1NsaWRpbmcgJiYgKCBjbGVhckludGVydmFsKHZhcnMudGltZXIpLCB2YXJzLnRpbWVyID0gbnVsbCApO1xuICAgICAgIXZhcnMuaXNTbGlkaW5nICYmIHNlbGYuY3ljbGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gaW5kaWNhdG9ySGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICB2YXIgZXZlbnRUYXJnZXQgPSBlLnRhcmdldDtcbiAgICBpZiAoIGV2ZW50VGFyZ2V0ICYmICFldmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmIGV2ZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zbGlkZS10bycpICkge1xuICAgICAgdmFycy5pbmRleCA9IHBhcnNlSW50KCBldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xpZGUtdG8nKSk7XG4gICAgfSBlbHNlIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgc2VsZi5zbGlkZVRvKCB2YXJzLmluZGV4ICk7XG4gIH1cbiAgZnVuY3Rpb24gY29udHJvbHNIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHZhciBldmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYgKCBldmVudFRhcmdldCA9PT0gcmlnaHRBcnJvdyApIHtcbiAgICAgIHZhcnMuaW5kZXgrKztcbiAgICB9IGVsc2UgaWYgKCBldmVudFRhcmdldCA9PT0gbGVmdEFycm93ICkge1xuICAgICAgdmFycy5pbmRleC0tO1xuICAgIH1cbiAgICBzZWxmLnNsaWRlVG8oIHZhcnMuaW5kZXggKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKHJlZikge1xuICAgIHZhciB3aGljaCA9IHJlZi53aGljaDtcbiAgICBpZiAodmFycy5pc1NsaWRpbmcpIHsgcmV0dXJuOyB9XG4gICAgc3dpdGNoICh3aGljaCkge1xuICAgICAgY2FzZSAzOTpcbiAgICAgICAgdmFycy5pbmRleCsrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzc6XG4gICAgICAgIHZhcnMuaW5kZXgtLTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuc2xpZGVUbyggdmFycy5pbmRleCApO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKCBvcHMucGF1c2UgJiYgb3BzLmludGVydmFsICkge1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzBdLCBwYXVzZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMV0sIHJlc3VtZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaHN0YXJ0JywgcGF1c2VIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2hlbmQnLCByZXN1bWVIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIH1cbiAgICBvcHMudG91Y2ggJiYgc2xpZGVzLmxlbmd0aCA+IDEgJiYgZWxlbWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHRvdWNoRG93bkhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgcmlnaHRBcnJvdyAmJiByaWdodEFycm93W2FjdGlvbl0oICdjbGljaycsIGNvbnRyb2xzSGFuZGxlcixmYWxzZSApO1xuICAgIGxlZnRBcnJvdyAmJiBsZWZ0QXJyb3dbYWN0aW9uXSggJ2NsaWNrJywgY29udHJvbHNIYW5kbGVyLGZhbHNlICk7XG4gICAgaW5kaWNhdG9yICYmIGluZGljYXRvclthY3Rpb25dKCAnY2xpY2snLCBpbmRpY2F0b3JIYW5kbGVyLGZhbHNlICk7XG4gICAgb3BzLmtleWJvYXJkICYmIHdpbmRvd1thY3Rpb25dKCAna2V5ZG93bicsIGtleUhhbmRsZXIsZmFsc2UgKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVUb3VjaEV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2htb3ZlJywgdG91Y2hNb3ZlSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaGVuZCcsIHRvdWNoRW5kSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBmdW5jdGlvbiB0b3VjaERvd25IYW5kbGVyKGUpIHtcbiAgICBpZiAoIHZhcnMuaXNUb3VjaCApIHsgcmV0dXJuOyB9XG4gICAgdmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSApIHtcbiAgICAgIHZhcnMuaXNUb3VjaCA9IHRydWU7XG4gICAgICB0b2dnbGVUb3VjaEV2ZW50cygxKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hNb3ZlSGFuZGxlcihlKSB7XG4gICAgaWYgKCAhdmFycy5pc1RvdWNoICkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHJldHVybjsgfVxuICAgIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCBlLnR5cGUgPT09ICd0b3VjaG1vdmUnICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID4gMSApIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hFbmRIYW5kbGVyIChlKSB7XG4gICAgaWYgKCAhdmFycy5pc1RvdWNoIHx8IHZhcnMuaXNTbGlkaW5nICkgeyByZXR1cm4gfVxuICAgIHZhcnMudG91Y2hQb3NpdGlvbi5lbmRYID0gdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYIHx8IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCB2YXJzLmlzVG91Y2ggKSB7XG4gICAgICBpZiAoICghZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkgfHwgIWVsZW1lbnQuY29udGFpbnMoZS5yZWxhdGVkVGFyZ2V0KSApXG4gICAgICAgICAgJiYgTWF0aC5hYnModmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCAtIHZhcnMudG91Y2hQb3NpdGlvbi5lbmRYKSA8IDc1ICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA8IHZhcnMudG91Y2hQb3NpdGlvbi5zdGFydFggKSB7XG4gICAgICAgICAgdmFycy5pbmRleCsrO1xuICAgICAgICB9IGVsc2UgaWYgKCB2YXJzLnRvdWNoUG9zaXRpb24uY3VycmVudFggPiB2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYICkge1xuICAgICAgICAgIHZhcnMuaW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgICB2YXJzLmlzVG91Y2ggPSBmYWxzZTtcbiAgICAgICAgc2VsZi5zbGlkZVRvKHZhcnMuaW5kZXgpO1xuICAgICAgfVxuICAgICAgdG9nZ2xlVG91Y2hFdmVudHMoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2V0QWN0aXZlUGFnZShwYWdlSW5kZXgpIHtcbiAgICBBcnJheS5mcm9tKGluZGljYXRvcnMpLm1hcChmdW5jdGlvbiAoeCl7eC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTt9KTtcbiAgICBpbmRpY2F0b3JzW3BhZ2VJbmRleF0gJiYgaW5kaWNhdG9yc1twYWdlSW5kZXhdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICB9XG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRIYW5kbGVyKGUpe1xuICAgIGlmICh2YXJzLnRvdWNoUG9zaXRpb24pe1xuICAgICAgdmFyIG5leHQgPSB2YXJzLmluZGV4LFxuICAgICAgICAgIHRpbWVvdXQgPSBlICYmIGUudGFyZ2V0ICE9PSBzbGlkZXNbbmV4dF0gPyBlLmVsYXBzZWRUaW1lKjEwMDArMTAwIDogMjAsXG4gICAgICAgICAgYWN0aXZlSXRlbSA9IHNlbGYuZ2V0QWN0aXZlSW5kZXgoKSxcbiAgICAgICAgICBvcmllbnRhdGlvbiA9IHZhcnMuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAnbmV4dCcgOiAncHJldic7XG4gICAgICB2YXJzLmlzU2xpZGluZyAmJiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHZhcnMudG91Y2hQb3NpdGlvbil7XG4gICAgICAgICAgdmFycy5pc1NsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyBvcmllbnRhdGlvbikpO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZEN1c3RvbUV2ZW50KTtcbiAgICAgICAgICBpZiAoICFkb2N1bWVudC5oaWRkZW4gJiYgb3BzLmludGVydmFsICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICAgICAgICBzZWxmLmN5Y2xlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG4gIH1cbiAgc2VsZi5jeWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodmFycy50aW1lcikge1xuICAgICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICAgIHZhcnMudGltZXIgPSBudWxsO1xuICAgIH1cbiAgICB2YXJzLnRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGlkeCA9IHZhcnMuaW5kZXggfHwgc2VsZi5nZXRBY3RpdmVJbmRleCgpO1xuICAgICAgaXNFbGVtZW50SW5TY3JvbGxSYW5nZShlbGVtZW50KSAmJiAoaWR4KyssIHNlbGYuc2xpZGVUbyggaWR4ICkgKTtcbiAgICB9LCBvcHMuaW50ZXJ2YWwpO1xuICB9O1xuICBzZWxmLnNsaWRlVG8gPSBmdW5jdGlvbiAobmV4dCkge1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICB2YXIgYWN0aXZlSXRlbSA9IHNlbGYuZ2V0QWN0aXZlSW5kZXgoKSwgb3JpZW50YXRpb247XG4gICAgaWYgKCBhY3RpdmVJdGVtID09PSBuZXh0ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAgKCAoYWN0aXZlSXRlbSA8IG5leHQgKSB8fCAoYWN0aXZlSXRlbSA9PT0gMCAmJiBuZXh0ID09PSBzbGlkZXMubGVuZ3RoIC0xICkgKSB7XG4gICAgICB2YXJzLmRpcmVjdGlvbiA9ICdsZWZ0JztcbiAgICB9IGVsc2UgaWYgICggKGFjdGl2ZUl0ZW0gPiBuZXh0KSB8fCAoYWN0aXZlSXRlbSA9PT0gc2xpZGVzLmxlbmd0aCAtIDEgJiYgbmV4dCA9PT0gMCApICkge1xuICAgICAgdmFycy5kaXJlY3Rpb24gPSAncmlnaHQnO1xuICAgIH1cbiAgICBpZiAoIG5leHQgPCAwICkgeyBuZXh0ID0gc2xpZGVzLmxlbmd0aCAtIDE7IH1cbiAgICBlbHNlIGlmICggbmV4dCA+PSBzbGlkZXMubGVuZ3RoICl7IG5leHQgPSAwOyB9XG4gICAgb3JpZW50YXRpb24gPSB2YXJzLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ25leHQnIDogJ3ByZXYnO1xuICAgIHNsaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2xpZGUnLCAnY2Fyb3VzZWwnLCBzbGlkZXNbbmV4dF0pO1xuICAgIHNsaWRDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzbGlkJywgJ2Nhcm91c2VsJywgc2xpZGVzW25leHRdKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKHNsaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICB2YXJzLmluZGV4ID0gbmV4dDtcbiAgICB2YXJzLmlzU2xpZGluZyA9IHRydWU7XG4gICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICB2YXJzLnRpbWVyID0gbnVsbDtcbiAgICBzZXRBY3RpdmVQYWdlKCBuZXh0ICk7XG4gICAgaWYgKCBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKHNsaWRlc1tuZXh0XSkgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3NsaWRlJykgKSB7XG4gICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgoXCJjYXJvdXNlbC1pdGVtLVwiICsgb3JpZW50YXRpb24pKTtcbiAgICAgIHNsaWRlc1tuZXh0XS5vZmZzZXRXaWR0aDtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LmFkZCgoXCJjYXJvdXNlbC1pdGVtLVwiICsgKHZhcnMuZGlyZWN0aW9uKSkpO1xuICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoc2xpZGVzW25leHRdLCB0cmFuc2l0aW9uRW5kSGFuZGxlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIHNsaWRlc1tuZXh0XS5vZmZzZXRXaWR0aDtcbiAgICAgIHNsaWRlc1thY3RpdmVJdGVtXS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXJzLmlzU2xpZGluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoIG9wcy5pbnRlcnZhbCAmJiBlbGVtZW50ICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICAgICAgc2VsZi5jeWNsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkQ3VzdG9tRXZlbnQpO1xuICAgICAgfSwgMTAwICk7XG4gICAgfVxuICB9O1xuICBzZWxmLmdldEFjdGl2ZUluZGV4ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gQXJyYXkuZnJvbShzbGlkZXMpLmluZGV4T2YoZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1pdGVtIGFjdGl2ZScpWzBdKSB8fCAwOyB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGl0ZW1DbGFzc2VzID0gWydsZWZ0JywncmlnaHQnLCdwcmV2JywnbmV4dCddO1xuICAgIEFycmF5LmZyb20oc2xpZGVzKS5tYXAoZnVuY3Rpb24gKHNsaWRlLGlkeCkge1xuICAgICAgc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSAmJiBzZXRBY3RpdmVQYWdlKCBpZHggKTtcbiAgICAgIGl0ZW1DbGFzc2VzLm1hcChmdW5jdGlvbiAoY2xzKSB7IHJldHVybiBzbGlkZS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyBjbHMpKTsgfSk7XG4gICAgfSk7XG4gICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICB2YXJzID0ge307XG4gICAgb3BzID0ge307XG4gICAgZGVsZXRlIGVsZW1lbnQuQ2Fyb3VzZWw7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoIGVsZW1lbnQgKTtcbiAgZWxlbWVudC5DYXJvdXNlbCAmJiBlbGVtZW50LkNhcm91c2VsLmRpc3Bvc2UoKTtcbiAgc2xpZGVzID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1pdGVtJyk7XG4gIGxlZnRBcnJvdyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtY29udHJvbC1wcmV2JylbMF07XG4gIHJpZ2h0QXJyb3cgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWNvbnRyb2wtbmV4dCcpWzBdO1xuICBpbmRpY2F0b3IgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWluZGljYXRvcnMnKVswXTtcbiAgaW5kaWNhdG9ycyA9IGluZGljYXRvciAmJiBpbmRpY2F0b3IuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIFwiTElcIiApIHx8IFtdO1xuICBpZiAoc2xpZGVzLmxlbmd0aCA8IDIpIHsgcmV0dXJuIH1cbiAgdmFyXG4gICAgaW50ZXJ2YWxBdHRyaWJ1dGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnRlcnZhbCcpLFxuICAgIGludGVydmFsRGF0YSA9IGludGVydmFsQXR0cmlidXRlID09PSAnZmFsc2UnID8gMCA6IHBhcnNlSW50KGludGVydmFsQXR0cmlidXRlKSxcbiAgICB0b3VjaERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10b3VjaCcpID09PSAnZmFsc2UnID8gMCA6IDEsXG4gICAgcGF1c2VEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF1c2UnKSA9PT0gJ2hvdmVyJyB8fCBmYWxzZSxcbiAgICBrZXlib2FyZERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1rZXlib2FyZCcpID09PSAndHJ1ZScgfHwgZmFsc2UsXG4gICAgaW50ZXJ2YWxPcHRpb24gPSBvcHRpb25zLmludGVydmFsLFxuICAgIHRvdWNoT3B0aW9uID0gb3B0aW9ucy50b3VjaDtcbiAgb3BzID0ge307XG4gIG9wcy5rZXlib2FyZCA9IG9wdGlvbnMua2V5Ym9hcmQgPT09IHRydWUgfHwga2V5Ym9hcmREYXRhO1xuICBvcHMucGF1c2UgPSAob3B0aW9ucy5wYXVzZSA9PT0gJ2hvdmVyJyB8fCBwYXVzZURhdGEpID8gJ2hvdmVyJyA6IGZhbHNlO1xuICBvcHMudG91Y2ggPSB0b3VjaE9wdGlvbiB8fCB0b3VjaERhdGE7XG4gIG9wcy5pbnRlcnZhbCA9IHR5cGVvZiBpbnRlcnZhbE9wdGlvbiA9PT0gJ251bWJlcicgPyBpbnRlcnZhbE9wdGlvblxuICAgICAgICAgICAgICA6IGludGVydmFsT3B0aW9uID09PSBmYWxzZSB8fCBpbnRlcnZhbERhdGEgPT09IDAgfHwgaW50ZXJ2YWxEYXRhID09PSBmYWxzZSA/IDBcbiAgICAgICAgICAgICAgOiBpc05hTihpbnRlcnZhbERhdGEpID8gNTAwMFxuICAgICAgICAgICAgICA6IGludGVydmFsRGF0YTtcbiAgaWYgKHNlbGYuZ2V0QWN0aXZlSW5kZXgoKTwwKSB7XG4gICAgc2xpZGVzLmxlbmd0aCAmJiBzbGlkZXNbMF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgaW5kaWNhdG9ycy5sZW5ndGggJiYgc2V0QWN0aXZlUGFnZSgwKTtcbiAgfVxuICB2YXJzID0ge307XG4gIHZhcnMuZGlyZWN0aW9uID0gJ2xlZnQnO1xuICB2YXJzLmluZGV4ID0gMDtcbiAgdmFycy50aW1lciA9IG51bGw7XG4gIHZhcnMuaXNTbGlkaW5nID0gZmFsc2U7XG4gIHZhcnMuaXNUb3VjaCA9IGZhbHNlO1xuICB2YXJzLnRvdWNoUG9zaXRpb24gPSB7XG4gICAgc3RhcnRYIDogMCxcbiAgICBjdXJyZW50WCA6IDAsXG4gICAgZW5kWCA6IDBcbiAgfTtcbiAgdG9nZ2xlRXZlbnRzKDEpO1xuICBpZiAoIG9wcy5pbnRlcnZhbCApeyBzZWxmLmN5Y2xlKCk7IH1cbiAgZWxlbWVudC5DYXJvdXNlbCA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIENvbGxhcHNlKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgYWNjb3JkaW9uID0gbnVsbCxcbiAgICAgIGNvbGxhcHNlID0gbnVsbCxcbiAgICAgIGFjdGl2ZUNvbGxhcHNlLFxuICAgICAgYWN0aXZlRWxlbWVudCxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudDtcbiAgZnVuY3Rpb24gb3BlbkFjdGlvbihjb2xsYXBzZUVsZW1lbnQsIHRvZ2dsZSkge1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgY29sbGFwc2VFbGVtZW50LmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzZScpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29sbGFwc2VFbGVtZW50LnNjcm9sbEhlaWdodCkgKyBcInB4XCI7XG4gICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoY29sbGFwc2VFbGVtZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCd0cnVlJyk7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywndHJ1ZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNpbmcnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlQWN0aW9uKGNvbGxhcHNlRWxlbWVudCwgdG9nZ2xlKSB7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29sbGFwc2VFbGVtZW50LnNjcm9sbEhlaWdodCkgKyBcInB4XCI7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlJyk7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzBweCc7XG4gICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoY29sbGFwc2VFbGVtZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCdmYWxzZScpO1xuICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ2ZhbHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gICAgfSk7XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlICYmIGUudGFyZ2V0LnRhZ05hbWUgPT09ICdBJyB8fCBlbGVtZW50LnRhZ05hbWUgPT09ICdBJykge2UucHJldmVudERlZmF1bHQoKTt9XG4gICAgaWYgKGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpIHx8IGUudGFyZ2V0ID09PSBlbGVtZW50KSB7XG4gICAgICBpZiAoIWNvbGxhcHNlLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7IHNlbGYuc2hvdygpOyB9XG4gICAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgICB9XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIGNvbGxhcHNlLmlzQW5pbWF0aW5nICkgeyByZXR1cm47IH1cbiAgICBjbG9zZUFjdGlvbihjb2xsYXBzZSxlbGVtZW50KTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICB9O1xuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBhY2NvcmRpb24gKSB7XG4gICAgICBhY3RpdmVDb2xsYXBzZSA9IGFjY29yZGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY29sbGFwc2Ugc2hvd1wiKVswXTtcbiAgICAgIGFjdGl2ZUVsZW1lbnQgPSBhY3RpdmVDb2xsYXBzZSAmJiAocXVlcnlFbGVtZW50KChcIltkYXRhLXRhcmdldD1cXFwiI1wiICsgKGFjdGl2ZUNvbGxhcHNlLmlkKSArIFwiXFxcIl1cIiksYWNjb3JkaW9uKVxuICAgICAgICAgICAgICAgICAgICB8fCBxdWVyeUVsZW1lbnQoKFwiW2hyZWY9XFxcIiNcIiArIChhY3RpdmVDb2xsYXBzZS5pZCkgKyBcIlxcXCJdXCIpLGFjY29yZGlvbikgKTtcbiAgICB9XG4gICAgaWYgKCAhY29sbGFwc2UuaXNBbmltYXRpbmcgKSB7XG4gICAgICBpZiAoIGFjdGl2ZUVsZW1lbnQgJiYgYWN0aXZlQ29sbGFwc2UgIT09IGNvbGxhcHNlICkge1xuICAgICAgICBjbG9zZUFjdGlvbihhY3RpdmVDb2xsYXBzZSxhY3RpdmVFbGVtZW50KTtcbiAgICAgICAgYWN0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZWQnKTtcbiAgICAgIH1cbiAgICAgIG9wZW5BY3Rpb24oY29sbGFwc2UsZWxlbWVudCk7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlZCcpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYudG9nZ2xlLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5Db2xsYXBzZTtcbiAgfTtcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICAgIGVsZW1lbnQuQ29sbGFwc2UgJiYgZWxlbWVudC5Db2xsYXBzZS5kaXNwb3NlKCk7XG4gICAgdmFyIGFjY29yZGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQnKTtcbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdjb2xsYXBzZScpO1xuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAnY29sbGFwc2UnKTtcbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICdjb2xsYXBzZScpO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdjb2xsYXBzZScpO1xuICAgIGNvbGxhcHNlID0gcXVlcnlFbGVtZW50KG9wdGlvbnMudGFyZ2V0IHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuICAgIGNvbGxhcHNlLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgYWNjb3JkaW9uID0gZWxlbWVudC5jbG9zZXN0KG9wdGlvbnMucGFyZW50IHx8IGFjY29yZGlvbkRhdGEpO1xuICAgIGlmICggIWVsZW1lbnQuQ29sbGFwc2UgKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLnRvZ2dsZSxmYWxzZSk7XG4gICAgfVxuICAgIGVsZW1lbnQuQ29sbGFwc2UgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBzZXRGb2N1cyAoZWxlbWVudCl7XG4gIGVsZW1lbnQuZm9jdXMgPyBlbGVtZW50LmZvY3VzKCkgOiBlbGVtZW50LnNldEFjdGl2ZSgpO1xufVxuXG5mdW5jdGlvbiBEcm9wZG93bihlbGVtZW50LG9wdGlvbikge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbCxcbiAgICAgIHBhcmVudCwgbWVudSwgbWVudUl0ZW1zID0gW10sXG4gICAgICBwZXJzaXN0O1xuICBmdW5jdGlvbiBwcmV2ZW50RW1wdHlBbmNob3IoYW5jaG9yKSB7XG4gICAgKGFuY2hvci5ocmVmICYmIGFuY2hvci5ocmVmLnNsaWNlKC0xKSA9PT0gJyMnIHx8IGFuY2hvci5wYXJlbnROb2RlICYmIGFuY2hvci5wYXJlbnROb2RlLmhyZWZcbiAgICAgICYmIGFuY2hvci5wYXJlbnROb2RlLmhyZWYuc2xpY2UoLTEpID09PSAnIycpICYmIHRoaXMucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVEaXNtaXNzKCkge1xuICAgIHZhciBhY3Rpb24gPSBlbGVtZW50Lm9wZW4gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgnY2xpY2snLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdrZXlkb3duJyxwcmV2ZW50U2Nyb2xsLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdrZXl1cCcsa2V5SGFuZGxlcixmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgnZm9jdXMnLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBkaXNtaXNzSGFuZGxlcihlKSB7XG4gICAgdmFyIGV2ZW50VGFyZ2V0ID0gZS50YXJnZXQsXG4gICAgICAgICAgaGFzRGF0YSA9IGV2ZW50VGFyZ2V0ICYmIChldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgZXZlbnRUYXJnZXQucGFyZW50Tm9kZSAmJiBldmVudFRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBldmVudFRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKSk7XG4gICAgaWYgKCBlLnR5cGUgPT09ICdmb2N1cycgJiYgKGV2ZW50VGFyZ2V0ID09PSBlbGVtZW50IHx8IGV2ZW50VGFyZ2V0ID09PSBtZW51IHx8IG1lbnUuY29udGFpbnMoZXZlbnRUYXJnZXQpICkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICggKGV2ZW50VGFyZ2V0ID09PSBtZW51IHx8IG1lbnUuY29udGFpbnMoZXZlbnRUYXJnZXQpKSAmJiAocGVyc2lzdCB8fCBoYXNEYXRhKSApIHsgcmV0dXJuOyB9XG4gICAgZWxzZSB7XG4gICAgICByZWxhdGVkVGFyZ2V0ID0gZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQgfHwgZWxlbWVudC5jb250YWlucyhldmVudFRhcmdldCkgPyBlbGVtZW50IDogbnVsbDtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgICBwcmV2ZW50RW1wdHlBbmNob3IuY2FsbChlLGV2ZW50VGFyZ2V0KTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgIHNlbGYuc2hvdygpO1xuICAgIHByZXZlbnRFbXB0eUFuY2hvci5jYWxsKGUsZS50YXJnZXQpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRTY3JvbGwoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBpZigga2V5ID09PSAzOCB8fCBrZXkgPT09IDQwICkgeyBlLnByZXZlbnREZWZhdWx0KCk7IH1cbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKGUpIHtcbiAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGUsXG4gICAgICAgIGFjdGl2ZUl0ZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50LFxuICAgICAgICBpc1NhbWVFbGVtZW50ID0gYWN0aXZlSXRlbSA9PT0gZWxlbWVudCxcbiAgICAgICAgaXNJbnNpZGVNZW51ID0gbWVudS5jb250YWlucyhhY3RpdmVJdGVtKSxcbiAgICAgICAgaXNNZW51SXRlbSA9IGFjdGl2ZUl0ZW0ucGFyZW50Tm9kZSA9PT0gbWVudSB8fCBhY3RpdmVJdGVtLnBhcmVudE5vZGUucGFyZW50Tm9kZSA9PT0gbWVudSxcbiAgICAgICAgaWR4ID0gbWVudUl0ZW1zLmluZGV4T2YoYWN0aXZlSXRlbSk7XG4gICAgaWYgKCBpc01lbnVJdGVtICkge1xuICAgICAgaWR4ID0gaXNTYW1lRWxlbWVudCA/IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBrZXkgPT09IDM4ID8gKGlkeD4xP2lkeC0xOjApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5ID09PSA0MCA/IChpZHg8bWVudUl0ZW1zLmxlbmd0aC0xP2lkeCsxOmlkeCkgOiBpZHg7XG4gICAgICBtZW51SXRlbXNbaWR4XSAmJiBzZXRGb2N1cyhtZW51SXRlbXNbaWR4XSk7XG4gICAgfVxuICAgIGlmICggKG1lbnVJdGVtcy5sZW5ndGggJiYgaXNNZW51SXRlbVxuICAgICAgICAgIHx8ICFtZW51SXRlbXMubGVuZ3RoICYmIChpc0luc2lkZU1lbnUgfHwgaXNTYW1lRWxlbWVudClcbiAgICAgICAgICB8fCAhaXNJbnNpZGVNZW51IClcbiAgICAgICAgICAmJiBlbGVtZW50Lm9wZW4gJiYga2V5ID09PSAyN1xuICAgICkge1xuICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgIH1cbiAgfVxuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1lbnUuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIHBhcmVudC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLHRydWUpO1xuICAgIGVsZW1lbnQub3BlbiA9IHRydWU7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldEZvY3VzKCBtZW51LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdIHx8IGVsZW1lbnQgKTtcbiAgICAgIHRvZ2dsZURpc21pc3MoKTtcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCggJ3Nob3duJywgJ2Ryb3Bkb3duJywgcmVsYXRlZFRhcmdldCk7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgICB9LDEpO1xuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1lbnUuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIHBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLGZhbHNlKTtcbiAgICBlbGVtZW50Lm9wZW4gPSBmYWxzZTtcbiAgICB0b2dnbGVEaXNtaXNzKCk7XG4gICAgc2V0Rm9jdXMoZWxlbWVudCk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBlbGVtZW50LkRyb3Bkb3duICYmIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgfSwxKTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH07XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgZWxlbWVudC5vcGVuKSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgZWxzZSB7IHNlbGYuc2hvdygpOyB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmIGVsZW1lbnQub3BlbikgeyBzZWxmLmhpZGUoKTsgfVxuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgZGVsZXRlIGVsZW1lbnQuRHJvcGRvd247XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuRHJvcGRvd24gJiYgZWxlbWVudC5Ecm9wZG93bi5kaXNwb3NlKCk7XG4gIHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgbWVudSA9IHF1ZXJ5RWxlbWVudCgnLmRyb3Bkb3duLW1lbnUnLCBwYXJlbnQpO1xuICBBcnJheS5mcm9tKG1lbnUuY2hpbGRyZW4pLm1hcChmdW5jdGlvbiAoY2hpbGQpe1xuICAgIGNoaWxkLmNoaWxkcmVuLmxlbmd0aCAmJiAoY2hpbGQuY2hpbGRyZW5bMF0udGFnTmFtZSA9PT0gJ0EnICYmIG1lbnVJdGVtcy5wdXNoKGNoaWxkLmNoaWxkcmVuWzBdKSk7XG4gICAgY2hpbGQudGFnTmFtZSA9PT0gJ0EnICYmIG1lbnVJdGVtcy5wdXNoKGNoaWxkKTtcbiAgfSk7XG4gIGlmICggIWVsZW1lbnQuRHJvcGRvd24gKSB7XG4gICAgISgndGFiaW5kZXgnIGluIG1lbnUpICYmIG1lbnUuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBwZXJzaXN0ID0gb3B0aW9uID09PSB0cnVlIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBlcnNpc3QnKSA9PT0gJ3RydWUnIHx8IGZhbHNlO1xuICBlbGVtZW50Lm9wZW4gPSBmYWxzZTtcbiAgZWxlbWVudC5Ecm9wZG93biA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIE1vZGFsKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLCBtb2RhbCxcbiAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgc2hvd25DdXN0b21FdmVudCxcbiAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgcmVsYXRlZFRhcmdldCA9IG51bGwsXG4gICAgc2Nyb2xsQmFyV2lkdGgsXG4gICAgb3ZlcmxheSxcbiAgICBvdmVybGF5RGVsYXksXG4gICAgZml4ZWRJdGVtcyxcbiAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gc2V0U2Nyb2xsYmFyKCkge1xuICAgIHZhciBvcGVuTW9kYWwgPSBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygnbW9kYWwtb3BlbicpLFxuICAgICAgICBib2R5UGFkID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5wYWRkaW5nUmlnaHQpLFxuICAgICAgICBib2R5T3ZlcmZsb3cgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICE9PSBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCxcbiAgICAgICAgbW9kYWxPdmVyZmxvdyA9IG1vZGFsLmNsaWVudEhlaWdodCAhPT0gbW9kYWwuc2Nyb2xsSGVpZ2h0O1xuICAgIHNjcm9sbEJhcldpZHRoID0gbWVhc3VyZVNjcm9sbGJhcigpO1xuICAgIG1vZGFsLnN0eWxlLnBhZGRpbmdSaWdodCA9ICFtb2RhbE92ZXJmbG93ICYmIHNjcm9sbEJhcldpZHRoID8gKHNjcm9sbEJhcldpZHRoICsgXCJweFwiKSA6ICcnO1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gbW9kYWxPdmVyZmxvdyB8fCBib2R5T3ZlcmZsb3cgPyAoKGJvZHlQYWQgKyAob3Blbk1vZGFsID8gMDpzY3JvbGxCYXJXaWR0aCkpICsgXCJweFwiKSA6ICcnO1xuICAgIGZpeGVkSXRlbXMubGVuZ3RoICYmIGZpeGVkSXRlbXMubWFwKGZ1bmN0aW9uIChmaXhlZCl7XG4gICAgICB2YXIgaXRlbVBhZCA9IGdldENvbXB1dGVkU3R5bGUoZml4ZWQpLnBhZGRpbmdSaWdodDtcbiAgICAgIGZpeGVkLnN0eWxlLnBhZGRpbmdSaWdodCA9IG1vZGFsT3ZlcmZsb3cgfHwgYm9keU92ZXJmbG93ID8gKChwYXJzZUludChpdGVtUGFkKSArIChvcGVuTW9kYWw/MDpzY3JvbGxCYXJXaWR0aCkpICsgXCJweFwiKSA6ICgocGFyc2VJbnQoaXRlbVBhZCkpICsgXCJweFwiKTtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiByZXNldFNjcm9sbGJhcigpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIG1vZGFsLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIGZpeGVkSXRlbXMubGVuZ3RoICYmIGZpeGVkSXRlbXMubWFwKGZ1bmN0aW9uIChmaXhlZCl7XG4gICAgICBmaXhlZC5zdHlsZS5wYWRkaW5nUmlnaHQgPSAnJztcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBtZWFzdXJlU2Nyb2xsYmFyKCkge1xuICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwgd2lkdGhWYWx1ZTtcbiAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gJ21vZGFsLXNjcm9sbGJhci1tZWFzdXJlJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbERpdik7XG4gICAgd2lkdGhWYWx1ZSA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aDtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcm9sbERpdik7XG4gICAgcmV0dXJuIHdpZHRoVmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlT3ZlcmxheSgpIHtcbiAgICB2YXIgbmV3T3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy5tb2RhbC1iYWNrZHJvcCcpO1xuICAgIGlmICggb3ZlcmxheSA9PT0gbnVsbCApIHtcbiAgICAgIG5ld092ZXJsYXkuc2V0QXR0cmlidXRlKCdjbGFzcycsICdtb2RhbC1iYWNrZHJvcCcgKyAob3BzLmFuaW1hdGlvbiA/ICcgZmFkZScgOiAnJykpO1xuICAgICAgb3ZlcmxheSA9IG5ld092ZXJsYXk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXkpO1xuICAgIH1cbiAgICByZXR1cm4gb3ZlcmxheTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVPdmVybGF5ICgpIHtcbiAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcubW9kYWwtYmFja2Ryb3AnKTtcbiAgICBpZiAoIG92ZXJsYXkgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXSApIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3ZlcmxheSk7IG92ZXJsYXkgPSBudWxsO1xuICAgIH1cbiAgICBvdmVybGF5ID09PSBudWxsICYmIChkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLW9wZW4nKSwgcmVzZXRTY3JvbGxiYXIoKSk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYudXBkYXRlLCBwYXNzaXZlSGFuZGxlcik7XG4gICAgbW9kYWxbYWN0aW9uXSggJ2NsaWNrJyxkaXNtaXNzSGFuZGxlcixmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSggJ2tleWRvd24nLGtleUhhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGJlZm9yZVNob3coKSB7XG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgc2V0U2Nyb2xsYmFyKCk7XG4gICAgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXSAmJiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLW9wZW4nKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKG1vZGFsLCB0cmlnZ2VyU2hvdykgOiB0cmlnZ2VyU2hvdygpO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJTaG93KCkge1xuICAgIHNldEZvY3VzKG1vZGFsKTtcbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ21vZGFsJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VySGlkZShmb3JjZSkge1xuICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICBlbGVtZW50ICYmIChzZXRGb2N1cyhlbGVtZW50KSk7XG4gICAgb3ZlcmxheSA9IHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWJhY2tkcm9wJyk7XG4gICAgaWYgKGZvcmNlICE9PSAxICYmIG92ZXJsYXkgJiYgb3ZlcmxheS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdKSB7XG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKG92ZXJsYXkscmVtb3ZlT3ZlcmxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZU92ZXJsYXkoKTtcbiAgICB9XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAnbW9kYWwnKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGlmICggbW9kYWwuaXNBbmltYXRpbmcgKSB7IHJldHVybjsgfVxuICAgIHZhciBjbGlja1RhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICBtb2RhbElEID0gXCIjXCIgKyAobW9kYWwuZ2V0QXR0cmlidXRlKCdpZCcpKSxcbiAgICAgICAgdGFyZ2V0QXR0clZhbHVlID0gY2xpY2tUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGNsaWNrVGFyZ2V0LmdldEF0dHJpYnV0ZSgnaHJlZicpLFxuICAgICAgICBlbGVtQXR0clZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoICFtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKVxuICAgICAgICAmJiAoY2xpY2tUYXJnZXQgPT09IGVsZW1lbnQgJiYgdGFyZ2V0QXR0clZhbHVlID09PSBtb2RhbElEXG4gICAgICAgIHx8IGVsZW1lbnQuY29udGFpbnMoY2xpY2tUYXJnZXQpICYmIGVsZW1BdHRyVmFsdWUgPT09IG1vZGFsSUQpICkge1xuICAgICAgbW9kYWwubW9kYWxUcmlnZ2VyID0gZWxlbWVudDtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgICAgc2VsZi5zaG93KCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIocmVmKSB7XG4gICAgdmFyIHdoaWNoID0gcmVmLndoaWNoO1xuICAgIGlmICghbW9kYWwuaXNBbmltYXRpbmcgJiYgb3BzLmtleWJvYXJkICYmIHdoaWNoID09IDI3ICYmIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGRpc21pc3NIYW5kbGVyKGUpIHtcbiAgICBpZiAoIG1vZGFsLmlzQW5pbWF0aW5nICkgeyByZXR1cm47IH1cbiAgICB2YXIgY2xpY2tUYXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgaGFzRGF0YSA9IGNsaWNrVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kaXNtaXNzJykgPT09ICdtb2RhbCcsXG4gICAgICAgIHBhcmVudFdpdGhEYXRhID0gY2xpY2tUYXJnZXQuY2xvc2VzdCgnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJyk7XG4gICAgaWYgKCBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAoIHBhcmVudFdpdGhEYXRhIHx8IGhhc0RhdGFcbiAgICAgICAgfHwgY2xpY2tUYXJnZXQgPT09IG1vZGFsICYmIG9wcy5iYWNrZHJvcCAhPT0gJ3N0YXRpYycgKSApIHtcbiAgICAgIHNlbGYuaGlkZSgpOyByZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtzZWxmLmhpZGUoKTt9IGVsc2Uge3NlbGYuc2hvdygpO31cbiAgfTtcbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAhIW1vZGFsLmlzQW5pbWF0aW5nICkge3JldHVybn1cbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdtb2RhbCcsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRPcGVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdO1xuICAgIGlmIChjdXJyZW50T3BlbiAmJiBjdXJyZW50T3BlbiAhPT0gbW9kYWwpIHtcbiAgICAgIGN1cnJlbnRPcGVuLm1vZGFsVHJpZ2dlciAmJiBjdXJyZW50T3Blbi5tb2RhbFRyaWdnZXIuTW9kYWwuaGlkZSgpO1xuICAgICAgY3VycmVudE9wZW4uTW9kYWwgJiYgY3VycmVudE9wZW4uTW9kYWwuaGlkZSgpO1xuICAgIH1cbiAgICBpZiAoIG9wcy5iYWNrZHJvcCApIHtcbiAgICAgIG92ZXJsYXkgPSBjcmVhdGVPdmVybGF5KCk7XG4gICAgfVxuICAgIGlmICggb3ZlcmxheSAmJiAhY3VycmVudE9wZW4gJiYgIW92ZXJsYXkuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7XG4gICAgICBvdmVybGF5Lm9mZnNldFdpZHRoO1xuICAgICAgb3ZlcmxheURlbGF5ID0gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihvdmVybGF5KTtcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cbiAgICAhY3VycmVudE9wZW4gPyBzZXRUaW1lb3V0KCBiZWZvcmVTaG93LCBvdmVybGF5ICYmIG92ZXJsYXlEZWxheSA/IG92ZXJsYXlEZWxheTowICkgOiBiZWZvcmVTaG93KCk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uIChmb3JjZSkge1xuICAgIGlmICggIW1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge3JldHVybn1cbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCggJ2hpZGUnLCAnbW9kYWwnKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKCBoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgJiYgZm9yY2UgIT09IDEgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChtb2RhbCwgdHJpZ2dlckhpZGUpIDogdHJpZ2dlckhpZGUoKTtcbiAgfTtcbiAgc2VsZi5zZXRDb250ZW50ID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICBxdWVyeUVsZW1lbnQoJy5tb2RhbC1jb250ZW50Jyxtb2RhbCkuaW5uZXJIVE1MID0gY29udGVudDtcbiAgfTtcbiAgc2VsZi51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBzZXRTY3JvbGxiYXIoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLmhpZGUoMSk7XG4gICAgaWYgKGVsZW1lbnQpIHtlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpOyBkZWxldGUgZWxlbWVudC5Nb2RhbDsgfVxuICAgIGVsc2Uge2RlbGV0ZSBtb2RhbC5Nb2RhbDt9XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIHZhciBjaGVja01vZGFsID0gcXVlcnlFbGVtZW50KCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpICk7XG4gIG1vZGFsID0gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGFsJykgPyBlbGVtZW50IDogY2hlY2tNb2RhbDtcbiAgZml4ZWRJdGVtcyA9IEFycmF5LmZyb20oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZml4ZWQtdG9wJykpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaXhlZC1ib3R0b20nKSkpO1xuICBpZiAoIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2RhbCcpICkgeyBlbGVtZW50ID0gbnVsbDsgfVxuICBlbGVtZW50ICYmIGVsZW1lbnQuTW9kYWwgJiYgZWxlbWVudC5Nb2RhbC5kaXNwb3NlKCk7XG4gIG1vZGFsICYmIG1vZGFsLk1vZGFsICYmIG1vZGFsLk1vZGFsLmRpc3Bvc2UoKTtcbiAgb3BzLmtleWJvYXJkID0gb3B0aW9ucy5rZXlib2FyZCA9PT0gZmFsc2UgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWtleWJvYXJkJykgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG4gIG9wcy5iYWNrZHJvcCA9IG9wdGlvbnMuYmFja2Ryb3AgPT09ICdzdGF0aWMnIHx8IG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1iYWNrZHJvcCcpID09PSAnc3RhdGljJyA/ICdzdGF0aWMnIDogdHJ1ZTtcbiAgb3BzLmJhY2tkcm9wID0gb3B0aW9ucy5iYWNrZHJvcCA9PT0gZmFsc2UgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJhY2tkcm9wJykgPT09ICdmYWxzZScgPyBmYWxzZSA6IG9wcy5iYWNrZHJvcDtcbiAgb3BzLmFuaW1hdGlvbiA9IG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gdHJ1ZSA6IGZhbHNlO1xuICBvcHMuY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcbiAgbW9kYWwuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgaWYgKCBlbGVtZW50ICYmICFlbGVtZW50Lk1vZGFsICkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgaWYgKCBvcHMuY29udGVudCApIHtcbiAgICBzZWxmLnNldENvbnRlbnQoIG9wcy5jb250ZW50LnRyaW0oKSApO1xuICB9XG4gIGlmIChlbGVtZW50KSB7XG4gICAgbW9kYWwubW9kYWxUcmlnZ2VyID0gZWxlbWVudDtcbiAgICBlbGVtZW50Lk1vZGFsID0gc2VsZjtcbiAgfSBlbHNlIHtcbiAgICBtb2RhbC5Nb2RhbCA9IHNlbGY7XG4gIH1cbn1cblxudmFyIG1vdXNlQ2xpY2tFdmVudHMgPSB7IGRvd246ICdtb3VzZWRvd24nLCB1cDogJ21vdXNldXAnIH07XG5cbmZ1bmN0aW9uIGdldFNjcm9sbCgpIHtcbiAgcmV0dXJuIHtcbiAgICB5IDogd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AsXG4gICAgeCA6IHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdFxuICB9XG59XG5cbmZ1bmN0aW9uIHN0eWxlVGlwKGxpbmssZWxlbWVudCxwb3NpdGlvbixwYXJlbnQpIHtcbiAgdmFyIHRpcFBvc2l0aW9ucyA9IC9cXGIodG9wfGJvdHRvbXxsZWZ0fHJpZ2h0KSsvLFxuICAgICAgZWxlbWVudERpbWVuc2lvbnMgPSB7IHcgOiBlbGVtZW50Lm9mZnNldFdpZHRoLCBoOiBlbGVtZW50Lm9mZnNldEhlaWdodCB9LFxuICAgICAgd2luZG93V2lkdGggPSAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgpLFxuICAgICAgd2luZG93SGVpZ2h0ID0gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQpLFxuICAgICAgcmVjdCA9IGxpbmsuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBzY3JvbGwgPSBwYXJlbnQgPT09IGRvY3VtZW50LmJvZHkgPyBnZXRTY3JvbGwoKSA6IHsgeDogcGFyZW50Lm9mZnNldExlZnQgKyBwYXJlbnQuc2Nyb2xsTGVmdCwgeTogcGFyZW50Lm9mZnNldFRvcCArIHBhcmVudC5zY3JvbGxUb3AgfSxcbiAgICAgIGxpbmtEaW1lbnNpb25zID0geyB3OiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LCBoOiByZWN0LmJvdHRvbSAtIHJlY3QudG9wIH0sXG4gICAgICBpc1BvcG92ZXIgPSBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncG9wb3ZlcicpLFxuICAgICAgYXJyb3cgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Fycm93JylbMF0sXG4gICAgICBoYWxmVG9wRXhjZWVkID0gcmVjdC50b3AgKyBsaW5rRGltZW5zaW9ucy5oLzIgLSBlbGVtZW50RGltZW5zaW9ucy5oLzIgPCAwLFxuICAgICAgaGFsZkxlZnRFeGNlZWQgPSByZWN0LmxlZnQgKyBsaW5rRGltZW5zaW9ucy53LzIgLSBlbGVtZW50RGltZW5zaW9ucy53LzIgPCAwLFxuICAgICAgaGFsZlJpZ2h0RXhjZWVkID0gcmVjdC5sZWZ0ICsgZWxlbWVudERpbWVuc2lvbnMudy8yICsgbGlua0RpbWVuc2lvbnMudy8yID49IHdpbmRvd1dpZHRoLFxuICAgICAgaGFsZkJvdHRvbUV4Y2VlZCA9IHJlY3QudG9wICsgZWxlbWVudERpbWVuc2lvbnMuaC8yICsgbGlua0RpbWVuc2lvbnMuaC8yID49IHdpbmRvd0hlaWdodCxcbiAgICAgIHRvcEV4Y2VlZCA9IHJlY3QudG9wIC0gZWxlbWVudERpbWVuc2lvbnMuaCA8IDAsXG4gICAgICBsZWZ0RXhjZWVkID0gcmVjdC5sZWZ0IC0gZWxlbWVudERpbWVuc2lvbnMudyA8IDAsXG4gICAgICBib3R0b21FeGNlZWQgPSByZWN0LnRvcCArIGVsZW1lbnREaW1lbnNpb25zLmggKyBsaW5rRGltZW5zaW9ucy5oID49IHdpbmRvd0hlaWdodCxcbiAgICAgIHJpZ2h0RXhjZWVkID0gcmVjdC5sZWZ0ICsgZWxlbWVudERpbWVuc2lvbnMudyArIGxpbmtEaW1lbnNpb25zLncgPj0gd2luZG93V2lkdGg7XG4gIHBvc2l0aW9uID0gKHBvc2l0aW9uID09PSAnbGVmdCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcpICYmIGxlZnRFeGNlZWQgJiYgcmlnaHRFeGNlZWQgPyAndG9wJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAndG9wJyAmJiB0b3BFeGNlZWQgPyAnYm90dG9tJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBib3R0b21FeGNlZWQgPyAndG9wJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbGVmdEV4Y2VlZCA/ICdyaWdodCcgOiBwb3NpdGlvbjtcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiByaWdodEV4Y2VlZCA/ICdsZWZ0JyA6IHBvc2l0aW9uO1xuICB2YXIgdG9wUG9zaXRpb24sXG4gICAgbGVmdFBvc2l0aW9uLFxuICAgIGFycm93VG9wLFxuICAgIGFycm93TGVmdCxcbiAgICBhcnJvd1dpZHRoLFxuICAgIGFycm93SGVpZ2h0O1xuICBlbGVtZW50LmNsYXNzTmFtZS5pbmRleE9mKHBvc2l0aW9uKSA9PT0gLTEgJiYgKGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZSh0aXBQb3NpdGlvbnMscG9zaXRpb24pKTtcbiAgYXJyb3dXaWR0aCA9IGFycm93Lm9mZnNldFdpZHRoOyBhcnJvd0hlaWdodCA9IGFycm93Lm9mZnNldEhlaWdodDtcbiAgaWYgKCBwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnICkge1xuICAgIGlmICggcG9zaXRpb24gPT09ICdsZWZ0JyApIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3QubGVmdCArIHNjcm9sbC54IC0gZWxlbWVudERpbWVuc2lvbnMudyAtICggaXNQb3BvdmVyID8gYXJyb3dXaWR0aCA6IDAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdC5sZWZ0ICsgc2Nyb2xsLnggKyBsaW5rRGltZW5zaW9ucy53O1xuICAgIH1cbiAgICBpZiAoaGFsZlRvcEV4Y2VlZCkge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55O1xuICAgICAgYXJyb3dUb3AgPSBsaW5rRGltZW5zaW9ucy5oLzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSBpZiAoaGFsZkJvdHRvbUV4Y2VlZCkge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55IC0gZWxlbWVudERpbWVuc2lvbnMuaCArIGxpbmtEaW1lbnNpb25zLmg7XG4gICAgICBhcnJvd1RvcCA9IGVsZW1lbnREaW1lbnNpb25zLmggLSBsaW5rRGltZW5zaW9ucy5oLzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oLzIgKyBsaW5rRGltZW5zaW9ucy5oLzI7XG4gICAgICBhcnJvd1RvcCA9IGVsZW1lbnREaW1lbnNpb25zLmgvMiAtIChpc1BvcG92ZXIgPyBhcnJvd0hlaWdodCowLjkgOiBhcnJvd0hlaWdodC8yKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgKSB7XG4gICAgaWYgKCBwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gIHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oIC0gKCBpc1BvcG92ZXIgPyBhcnJvd0hlaWdodCA6IDAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55ICsgbGlua0RpbWVuc2lvbnMuaDtcbiAgICB9XG4gICAgaWYgKGhhbGZMZWZ0RXhjZWVkKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSAwO1xuICAgICAgYXJyb3dMZWZ0ID0gcmVjdC5sZWZ0ICsgbGlua0RpbWVuc2lvbnMudy8yIC0gYXJyb3dXaWR0aDtcbiAgICB9IGVsc2UgaWYgKGhhbGZSaWdodEV4Y2VlZCkge1xuICAgICAgbGVmdFBvc2l0aW9uID0gd2luZG93V2lkdGggLSBlbGVtZW50RGltZW5zaW9ucy53KjEuMDE7XG4gICAgICBhcnJvd0xlZnQgPSBlbGVtZW50RGltZW5zaW9ucy53IC0gKCB3aW5kb3dXaWR0aCAtIHJlY3QubGVmdCApICsgbGlua0RpbWVuc2lvbnMudy8yIC0gYXJyb3dXaWR0aC8yO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSByZWN0LmxlZnQgKyBzY3JvbGwueCAtIGVsZW1lbnREaW1lbnNpb25zLncvMiArIGxpbmtEaW1lbnNpb25zLncvMjtcbiAgICAgIGFycm93TGVmdCA9IGVsZW1lbnREaW1lbnNpb25zLncvMiAtICggaXNQb3BvdmVyID8gYXJyb3dXaWR0aCA6IGFycm93V2lkdGgvMiApO1xuICAgIH1cbiAgfVxuICBlbGVtZW50LnN0eWxlLnRvcCA9IHRvcFBvc2l0aW9uICsgJ3B4JztcbiAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbGVmdFBvc2l0aW9uICsgJ3B4JztcbiAgYXJyb3dUb3AgJiYgKGFycm93LnN0eWxlLnRvcCA9IGFycm93VG9wICsgJ3B4Jyk7XG4gIGFycm93TGVmdCAmJiAoYXJyb3cuc3R5bGUubGVmdCA9IGFycm93TGVmdCArICdweCcpO1xufVxuXG5mdW5jdGlvbiBQb3BvdmVyKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgcG9wb3ZlciA9IG51bGwsXG4gICAgICB0aW1lciA9IDAsXG4gICAgICBpc0lwaG9uZSA9IC8oaVBob25lfGlQb2R8aVBhZCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgICB0aXRsZVN0cmluZyxcbiAgICAgIGNvbnRlbnRTdHJpbmcsXG4gICAgICBvcHMgPSB7fTtcbiAgdmFyIHRyaWdnZXJEYXRhLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIHBsYWNlbWVudERhdGEsXG4gICAgICBkaXNtaXNzaWJsZURhdGEsXG4gICAgICBkZWxheURhdGEsXG4gICAgICBjb250YWluZXJEYXRhLFxuICAgICAgY2xvc2VCdG4sXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICBjb250YWluZXJFbGVtZW50LFxuICAgICAgY29udGFpbmVyRGF0YUVsZW1lbnQsXG4gICAgICBtb2RhbCxcbiAgICAgIG5hdmJhckZpeGVkVG9wLFxuICAgICAgbmF2YmFyRml4ZWRCb3R0b20sXG4gICAgICBwbGFjZW1lbnRDbGFzcztcbiAgZnVuY3Rpb24gZGlzbWlzc2libGVIYW5kbGVyKGUpIHtcbiAgICBpZiAocG9wb3ZlciAhPT0gbnVsbCAmJiBlLnRhcmdldCA9PT0gcXVlcnlFbGVtZW50KCcuY2xvc2UnLHBvcG92ZXIpKSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZ2V0Q29udGVudHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIDAgOiBvcHRpb25zLnRpdGxlIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJykgfHwgbnVsbCxcbiAgICAgIDEgOiBvcHRpb25zLmNvbnRlbnQgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGVudCcpIHx8IG51bGxcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlUG9wb3ZlcigpIHtcbiAgICBvcHMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHBvcG92ZXIpO1xuICAgIHRpbWVyID0gbnVsbDsgcG9wb3ZlciA9IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlUG9wb3ZlcigpIHtcbiAgICB0aXRsZVN0cmluZyA9IGdldENvbnRlbnRzKClbMF0gfHwgbnVsbDtcbiAgICBjb250ZW50U3RyaW5nID0gZ2V0Q29udGVudHMoKVsxXTtcbiAgICBjb250ZW50U3RyaW5nID0gISFjb250ZW50U3RyaW5nID8gY29udGVudFN0cmluZy50cmltKCkgOiBudWxsO1xuICAgIHBvcG92ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgcG9wb3ZlckFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcG9wb3ZlckFycm93LmNsYXNzTGlzdC5hZGQoJ2Fycm93Jyk7XG4gICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyQXJyb3cpO1xuICAgIGlmICggY29udGVudFN0cmluZyAhPT0gbnVsbCAmJiBvcHMudGVtcGxhdGUgPT09IG51bGwgKSB7XG4gICAgICBwb3BvdmVyLnNldEF0dHJpYnV0ZSgncm9sZScsJ3Rvb2x0aXAnKTtcbiAgICAgIGlmICh0aXRsZVN0cmluZyAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgcG9wb3ZlclRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgcG9wb3ZlclRpdGxlLmNsYXNzTGlzdC5hZGQoJ3BvcG92ZXItaGVhZGVyJyk7XG4gICAgICAgIHBvcG92ZXJUaXRsZS5pbm5lckhUTUwgPSBvcHMuZGlzbWlzc2libGUgPyB0aXRsZVN0cmluZyArIGNsb3NlQnRuIDogdGl0bGVTdHJpbmc7XG4gICAgICAgIHBvcG92ZXIuYXBwZW5kQ2hpbGQocG9wb3ZlclRpdGxlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwb3BvdmVyQm9keU1hcmt1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgcG9wb3ZlckJvZHlNYXJrdXAuY2xhc3NMaXN0LmFkZCgncG9wb3Zlci1ib2R5Jyk7XG4gICAgICBwb3BvdmVyQm9keU1hcmt1cC5pbm5lckhUTUwgPSBvcHMuZGlzbWlzc2libGUgJiYgdGl0bGVTdHJpbmcgPT09IG51bGwgPyBjb250ZW50U3RyaW5nICsgY2xvc2VCdG4gOiBjb250ZW50U3RyaW5nO1xuICAgICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyQm9keU1hcmt1cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwb3BvdmVyVGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHBvcG92ZXJUZW1wbGF0ZS5pbm5lckhUTUwgPSBvcHMudGVtcGxhdGUudHJpbSgpO1xuICAgICAgcG9wb3Zlci5jbGFzc05hbWUgPSBwb3BvdmVyVGVtcGxhdGUuZmlyc3RDaGlsZC5jbGFzc05hbWU7XG4gICAgICBwb3BvdmVyLmlubmVySFRNTCA9IHBvcG92ZXJUZW1wbGF0ZS5maXJzdENoaWxkLmlubmVySFRNTDtcbiAgICAgIHZhciBwb3BvdmVySGVhZGVyID0gcXVlcnlFbGVtZW50KCcucG9wb3Zlci1oZWFkZXInLHBvcG92ZXIpLFxuICAgICAgICAgIHBvcG92ZXJCb2R5ID0gcXVlcnlFbGVtZW50KCcucG9wb3Zlci1ib2R5Jyxwb3BvdmVyKTtcbiAgICAgIHRpdGxlU3RyaW5nICYmIHBvcG92ZXJIZWFkZXIgJiYgKHBvcG92ZXJIZWFkZXIuaW5uZXJIVE1MID0gdGl0bGVTdHJpbmcudHJpbSgpKTtcbiAgICAgIGNvbnRlbnRTdHJpbmcgJiYgcG9wb3ZlckJvZHkgJiYgKHBvcG92ZXJCb2R5LmlubmVySFRNTCA9IGNvbnRlbnRTdHJpbmcudHJpbSgpKTtcbiAgICB9XG4gICAgb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChwb3BvdmVyKTtcbiAgICBwb3BvdmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucyggJ3BvcG92ZXInKSAmJiBwb3BvdmVyLmNsYXNzTGlzdC5hZGQoJ3BvcG92ZXInKTtcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoIG9wcy5hbmltYXRpb24pICYmIHBvcG92ZXIuY2xhc3NMaXN0LmFkZChvcHMuYW5pbWF0aW9uKTtcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoIHBsYWNlbWVudENsYXNzKSAmJiBwb3BvdmVyLmNsYXNzTGlzdC5hZGQocGxhY2VtZW50Q2xhc3MpO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dQb3BvdmVyKCkge1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICggcG9wb3Zlci5jbGFzc0xpc3QuYWRkKCdzaG93JykgKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVQb3BvdmVyKCkge1xuICAgIHN0eWxlVGlwKGVsZW1lbnQsIHBvcG92ZXIsIG9wcy5wbGFjZW1lbnQsIG9wcy5jb250YWluZXIpO1xuICB9XG4gIGZ1bmN0aW9uIGZvcmNlRm9jdXMgKCkge1xuICAgIGlmIChwb3BvdmVyID09PSBudWxsKSB7IGVsZW1lbnQuZm9jdXMoKTsgfVxuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKG9wcy50cmlnZ2VyID09PSAnaG92ZXInKSB7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlQ2xpY2tFdmVudHMuZG93biwgc2VsZi5zaG93ICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMF0sIHNlbGYuc2hvdyApO1xuICAgICAgaWYgKCFvcHMuZGlzbWlzc2libGUpIHsgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzFdLCBzZWxmLmhpZGUgKTsgfVxuICAgIH0gZWxzZSBpZiAoJ2NsaWNrJyA9PSBvcHMudHJpZ2dlcikge1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBvcHMudHJpZ2dlciwgc2VsZi50b2dnbGUgKTtcbiAgICB9IGVsc2UgaWYgKCdmb2N1cycgPT0gb3BzLnRyaWdnZXIpIHtcbiAgICAgIGlzSXBob25lICYmIGVsZW1lbnRbYWN0aW9uXSggJ2NsaWNrJywgZm9yY2VGb2N1cywgZmFsc2UgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggb3BzLnRyaWdnZXIsIHNlbGYudG9nZ2xlICk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvdWNoSGFuZGxlcihlKXtcbiAgICBpZiAoIHBvcG92ZXIgJiYgcG9wb3Zlci5jb250YWlucyhlLnRhcmdldCkgfHwgZS50YXJnZXQgPT09IGVsZW1lbnQgfHwgZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkpIDsgZWxzZSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZGlzbWlzc0hhbmRsZXJUb2dnbGUoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGlmIChvcHMuZGlzbWlzc2libGUpIHtcbiAgICAgIGRvY3VtZW50W2FjdGlvbl0oJ2NsaWNrJywgZGlzbWlzc2libGVIYW5kbGVyLCBmYWxzZSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAnZm9jdXMnID09IG9wcy50cmlnZ2VyICYmIGVsZW1lbnRbYWN0aW9uXSggJ2JsdXInLCBzZWxmLmhpZGUgKTtcbiAgICAgICdob3ZlcicgPT0gb3BzLnRyaWdnZXIgJiYgZG9jdW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCB0b3VjaEhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgfVxuICAgIHdpbmRvd1thY3Rpb25dKCdyZXNpemUnLCBzZWxmLmhpZGUsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd1RyaWdnZXIoKSB7XG4gICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUoMSk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGhpZGVUcmlnZ2VyKCkge1xuICAgIGRpc21pc3NIYW5kbGVyVG9nZ2xlKCk7XG4gICAgcmVtb3ZlUG9wb3ZlcigpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHBvcG92ZXIgPT09IG51bGwpIHsgc2VsZi5zaG93KCk7IH1cbiAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgfTtcbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkge1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICAgIGNyZWF0ZVBvcG92ZXIoKTtcbiAgICAgICAgdXBkYXRlUG9wb3ZlcigpO1xuICAgICAgICBzaG93UG9wb3ZlcigpO1xuICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChwb3BvdmVyLCBzaG93VHJpZ2dlcikgOiBzaG93VHJpZ2dlcigpO1xuICAgICAgfVxuICAgIH0sIDIwICk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHBvcG92ZXIgJiYgcG9wb3ZlciAhPT0gbnVsbCAmJiBwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgICAgcG9wb3Zlci5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHBvcG92ZXIsIGhpZGVUcmlnZ2VyKSA6IGhpZGVUcmlnZ2VyKCk7XG4gICAgICB9XG4gICAgfSwgb3BzLmRlbGF5ICk7XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLmhpZGUoKTtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5Qb3BvdmVyO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlBvcG92ZXIgJiYgZWxlbWVudC5Qb3BvdmVyLmRpc3Bvc2UoKTtcbiAgdHJpZ2dlckRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10cmlnZ2VyJyk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlbWVudCcpO1xuICBkaXNtaXNzaWJsZURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kaXNtaXNzaWJsZScpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBjb250YWluZXJEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGFpbmVyJyk7XG4gIGNsb3NlQnRuID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIj7DlzwvYnV0dG9uPic7XG4gIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3BvcG92ZXInKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICdwb3BvdmVyJyk7XG4gIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ3BvcG92ZXInKTtcbiAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3BvcG92ZXInKTtcbiAgY29udGFpbmVyRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLmNvbnRhaW5lcik7XG4gIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpO1xuICBtb2RhbCA9IGVsZW1lbnQuY2xvc2VzdCgnLm1vZGFsJyk7XG4gIG5hdmJhckZpeGVkVG9wID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtdG9wJyk7XG4gIG5hdmJhckZpeGVkQm90dG9tID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtYm90dG9tJyk7XG4gIG9wcy50ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogbnVsbDtcbiAgb3BzLnRyaWdnZXIgPSBvcHRpb25zLnRyaWdnZXIgPyBvcHRpb25zLnRyaWdnZXIgOiB0cmlnZ2VyRGF0YSB8fCAnaG92ZXInO1xuICBvcHMuYW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRpb24gJiYgb3B0aW9ucy5hbmltYXRpb24gIT09ICdmYWRlJyA/IG9wdGlvbnMuYW5pbWF0aW9uIDogYW5pbWF0aW9uRGF0YSB8fCAnZmFkZSc7XG4gIG9wcy5wbGFjZW1lbnQgPSBvcHRpb25zLnBsYWNlbWVudCA/IG9wdGlvbnMucGxhY2VtZW50IDogcGxhY2VtZW50RGF0YSB8fCAndG9wJztcbiAgb3BzLmRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5kZWxheSB8fCBkZWxheURhdGEpIHx8IDIwMDtcbiAgb3BzLmRpc21pc3NpYmxlID0gb3B0aW9ucy5kaXNtaXNzaWJsZSB8fCBkaXNtaXNzaWJsZURhdGEgPT09ICd0cnVlJyA/IHRydWUgOiBmYWxzZTtcbiAgb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lckVsZW1lbnQgPyBjb250YWluZXJFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogY29udGFpbmVyRGF0YUVsZW1lbnQgPyBjb250YWluZXJEYXRhRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkVG9wID8gbmF2YmFyRml4ZWRUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZEJvdHRvbSA/IG5hdmJhckZpeGVkQm90dG9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbW9kYWwgPyBtb2RhbCA6IGRvY3VtZW50LmJvZHk7XG4gIHBsYWNlbWVudENsYXNzID0gXCJicy1wb3BvdmVyLVwiICsgKG9wcy5wbGFjZW1lbnQpO1xuICB2YXIgcG9wb3ZlckNvbnRlbnRzID0gZ2V0Q29udGVudHMoKTtcbiAgdGl0bGVTdHJpbmcgPSBwb3BvdmVyQ29udGVudHNbMF07XG4gIGNvbnRlbnRTdHJpbmcgPSBwb3BvdmVyQ29udGVudHNbMV07XG4gIGlmICggIWNvbnRlbnRTdHJpbmcgJiYgIW9wcy50ZW1wbGF0ZSApIHsgcmV0dXJuOyB9XG4gIGlmICggIWVsZW1lbnQuUG9wb3ZlciApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgZWxlbWVudC5Qb3BvdmVyID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gU2Nyb2xsU3B5KGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIHZhcnMsXG4gICAgdGFyZ2V0RGF0YSxcbiAgICBvZmZzZXREYXRhLFxuICAgIHNweVRhcmdldCxcbiAgICBzY3JvbGxUYXJnZXQsXG4gICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIHVwZGF0ZVRhcmdldHMoKXtcbiAgICB2YXIgbGlua3MgPSBzcHlUYXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0EnKTtcbiAgICBpZiAodmFycy5sZW5ndGggIT09IGxpbmtzLmxlbmd0aCkge1xuICAgICAgdmFycy5pdGVtcyA9IFtdO1xuICAgICAgdmFycy50YXJnZXRzID0gW107XG4gICAgICBBcnJheS5mcm9tKGxpbmtzKS5tYXAoZnVuY3Rpb24gKGxpbmspe1xuICAgICAgICB2YXIgaHJlZiA9IGxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJyksXG4gICAgICAgICAgdGFyZ2V0SXRlbSA9IGhyZWYgJiYgaHJlZi5jaGFyQXQoMCkgPT09ICcjJyAmJiBocmVmLnNsaWNlKC0xKSAhPT0gJyMnICYmIHF1ZXJ5RWxlbWVudChocmVmKTtcbiAgICAgICAgaWYgKCB0YXJnZXRJdGVtICkge1xuICAgICAgICAgIHZhcnMuaXRlbXMucHVzaChsaW5rKTtcbiAgICAgICAgICB2YXJzLnRhcmdldHMucHVzaCh0YXJnZXRJdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXJzLmxlbmd0aCA9IGxpbmtzLmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlSXRlbShpbmRleCkge1xuICAgIHZhciBpdGVtID0gdmFycy5pdGVtc1tpbmRleF0sXG4gICAgICB0YXJnZXRJdGVtID0gdmFycy50YXJnZXRzW2luZGV4XSxcbiAgICAgIGRyb3BtZW51ID0gaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duLWl0ZW0nKSAmJiBpdGVtLmNsb3Nlc3QoJy5kcm9wZG93bi1tZW51JyksXG4gICAgICBkcm9wTGluayA9IGRyb3BtZW51ICYmIGRyb3BtZW51LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsXG4gICAgICBuZXh0U2libGluZyA9IGl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nLFxuICAgICAgYWN0aXZlU2libGluZyA9IG5leHRTaWJsaW5nICYmIG5leHRTaWJsaW5nLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLmxlbmd0aCxcbiAgICAgIHRhcmdldFJlY3QgPSB2YXJzLmlzV2luZG93ICYmIHRhcmdldEl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBpc0FjdGl2ZSA9IGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSB8fCBmYWxzZSxcbiAgICAgIHRvcEVkZ2UgPSAodmFycy5pc1dpbmRvdyA/IHRhcmdldFJlY3QudG9wICsgdmFycy5zY3JvbGxPZmZzZXQgOiB0YXJnZXRJdGVtLm9mZnNldFRvcCkgLSBvcHMub2Zmc2V0LFxuICAgICAgYm90dG9tRWRnZSA9IHZhcnMuaXNXaW5kb3cgPyB0YXJnZXRSZWN0LmJvdHRvbSArIHZhcnMuc2Nyb2xsT2Zmc2V0IC0gb3BzLm9mZnNldFxuICAgICAgICAgICAgICAgICA6IHZhcnMudGFyZ2V0c1tpbmRleCsxXSA/IHZhcnMudGFyZ2V0c1tpbmRleCsxXS5vZmZzZXRUb3AgLSBvcHMub2Zmc2V0XG4gICAgICAgICAgICAgICAgIDogZWxlbWVudC5zY3JvbGxIZWlnaHQsXG4gICAgICBpbnNpZGUgPSBhY3RpdmVTaWJsaW5nIHx8IHZhcnMuc2Nyb2xsT2Zmc2V0ID49IHRvcEVkZ2UgJiYgYm90dG9tRWRnZSA+IHZhcnMuc2Nyb2xsT2Zmc2V0O1xuICAgICBpZiAoICFpc0FjdGl2ZSAmJiBpbnNpZGUgKSB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgaWYgKGRyb3BMaW5rICYmICFkcm9wTGluay5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICkge1xuICAgICAgICBkcm9wTGluay5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBib290c3RyYXBDdXN0b21FdmVudCggJ2FjdGl2YXRlJywgJ3Njcm9sbHNweScsIHZhcnMuaXRlbXNbaW5kZXhdKSk7XG4gICAgfSBlbHNlIGlmICggaXNBY3RpdmUgJiYgIWluc2lkZSApIHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICBpZiAoZHJvcExpbmsgJiYgZHJvcExpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSAmJiAhaXRlbS5wYXJlbnROb2RlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLmxlbmd0aCApIHtcbiAgICAgICAgZHJvcExpbmsuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICggaXNBY3RpdmUgJiYgaW5zaWRlIHx8ICFpbnNpZGUgJiYgIWlzQWN0aXZlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVJdGVtcygpIHtcbiAgICB1cGRhdGVUYXJnZXRzKCk7XG4gICAgdmFycy5zY3JvbGxPZmZzZXQgPSB2YXJzLmlzV2luZG93ID8gZ2V0U2Nyb2xsKCkueSA6IGVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgIHZhcnMuaXRlbXMubWFwKGZ1bmN0aW9uIChsLGlkeCl7IHJldHVybiB1cGRhdGVJdGVtKGlkeCk7IH0pO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgc2Nyb2xsVGFyZ2V0W2FjdGlvbl0oJ3Njcm9sbCcsIHNlbGYucmVmcmVzaCwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYucmVmcmVzaCwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBzZWxmLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdXBkYXRlSXRlbXMoKTtcbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlNjcm9sbFNweTtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5TY3JvbGxTcHkgJiYgZWxlbWVudC5TY3JvbGxTcHkuZGlzcG9zZSgpO1xuICB0YXJnZXREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0Jyk7XG4gIG9mZnNldERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vZmZzZXQnKTtcbiAgc3B5VGFyZ2V0ID0gcXVlcnlFbGVtZW50KG9wdGlvbnMudGFyZ2V0IHx8IHRhcmdldERhdGEpO1xuICBzY3JvbGxUYXJnZXQgPSBlbGVtZW50Lm9mZnNldEhlaWdodCA8IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID8gZWxlbWVudCA6IHdpbmRvdztcbiAgaWYgKCFzcHlUYXJnZXQpIHsgcmV0dXJuIH1cbiAgb3BzLnRhcmdldCA9IHNweVRhcmdldDtcbiAgb3BzLm9mZnNldCA9IHBhcnNlSW50KG9wdGlvbnMub2Zmc2V0IHx8IG9mZnNldERhdGEpIHx8IDEwO1xuICB2YXJzID0ge307XG4gIHZhcnMubGVuZ3RoID0gMDtcbiAgdmFycy5pdGVtcyA9IFtdO1xuICB2YXJzLnRhcmdldHMgPSBbXTtcbiAgdmFycy5pc1dpbmRvdyA9IHNjcm9sbFRhcmdldCA9PT0gd2luZG93O1xuICBpZiAoICFlbGVtZW50LlNjcm9sbFNweSApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgc2VsZi5yZWZyZXNoKCk7XG4gIGVsZW1lbnQuU2Nyb2xsU3B5ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVGFiKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGhlaWdodERhdGEsXG4gICAgdGFicywgZHJvcGRvd24sXG4gICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgIG5leHQsXG4gICAgdGFic0NvbnRlbnRDb250YWluZXIgPSBmYWxzZSxcbiAgICBhY3RpdmVUYWIsXG4gICAgYWN0aXZlQ29udGVudCxcbiAgICBuZXh0Q29udGVudCxcbiAgICBjb250YWluZXJIZWlnaHQsXG4gICAgZXF1YWxDb250ZW50cyxcbiAgICBuZXh0SGVpZ2h0LFxuICAgIGFuaW1hdGVIZWlnaHQ7XG4gIGZ1bmN0aW9uIHRyaWdnZXJFbmQoKSB7XG4gICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgdGFic0NvbnRlbnRDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VyU2hvdygpIHtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIGlmICggZXF1YWxDb250ZW50cyApIHtcbiAgICAgICAgdHJpZ2dlckVuZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gbmV4dEhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICB0YWJzQ29udGVudENvbnRhaW5lci5vZmZzZXRXaWR0aDtcbiAgICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0YWJzQ29udGVudENvbnRhaW5lciwgdHJpZ2dlckVuZCk7XG4gICAgICAgIH0sNTApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0YWJzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgfVxuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAndGFiJywgYWN0aXZlVGFiKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobmV4dCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJpZ2dlckhpZGUoKSB7XG4gICAgaWYgKHRhYnNDb250ZW50Q29udGFpbmVyKSB7XG4gICAgICBhY3RpdmVDb250ZW50LnN0eWxlLmZsb2F0ID0gJ2xlZnQnO1xuICAgICAgbmV4dENvbnRlbnQuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XG4gICAgICBjb250YWluZXJIZWlnaHQgPSBhY3RpdmVDb250ZW50LnNjcm9sbEhlaWdodDtcbiAgICB9XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndGFiJywgYWN0aXZlVGFiKTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndGFiJywgbmV4dCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG5leHQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbmV4dENvbnRlbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIG5leHRIZWlnaHQgPSBuZXh0Q29udGVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICBlcXVhbENvbnRlbnRzID0gbmV4dEhlaWdodCA9PT0gY29udGFpbmVySGVpZ2h0O1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0ICsgXCJweFwiO1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgYWN0aXZlQ29udGVudC5zdHlsZS5mbG9hdCA9ICcnO1xuICAgICAgbmV4dENvbnRlbnQuc3R5bGUuZmxvYXQgPSAnJztcbiAgICB9XG4gICAgaWYgKCBuZXh0Q29udGVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSApIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBuZXh0Q29udGVudC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKG5leHRDb250ZW50LHRyaWdnZXJTaG93KTtcbiAgICAgIH0sMjApO1xuICAgIH0gZWxzZSB7IHRyaWdnZXJTaG93KCk7IH1cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoYWN0aXZlVGFiLCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKCkge1xuICAgIHZhciBhY3RpdmVUYWJzID0gdGFicy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKSwgYWN0aXZlVGFiO1xuICAgIGlmICggYWN0aXZlVGFicy5sZW5ndGggPT09IDEgJiYgIWFjdGl2ZVRhYnNbMF0ucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duJykgKSB7XG4gICAgICBhY3RpdmVUYWIgPSBhY3RpdmVUYWJzWzBdO1xuICAgIH0gZWxzZSBpZiAoIGFjdGl2ZVRhYnMubGVuZ3RoID4gMSApIHtcbiAgICAgIGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbYWN0aXZlVGFicy5sZW5ndGgtMV07XG4gICAgfVxuICAgIHJldHVybiBhY3RpdmVUYWI7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlQ29udGVudCgpIHsgcmV0dXJuIHF1ZXJ5RWxlbWVudChnZXRBY3RpdmVUYWIoKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBuZXh0ID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICF0YWJzLmlzQW5pbWF0aW5nICYmIHNlbGYuc2hvdygpO1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBuZXh0ID0gbmV4dCB8fCBlbGVtZW50O1xuICAgIGlmICghbmV4dC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgICBuZXh0Q29udGVudCA9IHF1ZXJ5RWxlbWVudChuZXh0LmdldEF0dHJpYnV0ZSgnaHJlZicpKTtcbiAgICAgIGFjdGl2ZVRhYiA9IGdldEFjdGl2ZVRhYigpO1xuICAgICAgYWN0aXZlQ29udGVudCA9IGdldEFjdGl2ZUNvbnRlbnQoKTtcbiAgICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnaGlkZScsICd0YWInLCBuZXh0KTtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhY3RpdmVUYWIsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgICBpZiAoaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICB0YWJzLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgIGFjdGl2ZVRhYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIGFjdGl2ZVRhYi5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCdmYWxzZScpO1xuICAgICAgbmV4dC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIG5leHQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywndHJ1ZScpO1xuICAgICAgaWYgKCBkcm9wZG93biApIHtcbiAgICAgICAgaWYgKCAhZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24tbWVudScpICkge1xuICAgICAgICAgIGlmIChkcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7IGRyb3Bkb3duLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpOyB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFkcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7IGRyb3Bkb3duLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChhY3RpdmVDb250ZW50LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpKSB7XG4gICAgICAgIGFjdGl2ZUNvbnRlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChhY3RpdmVDb250ZW50LCB0cmlnZ2VySGlkZSk7XG4gICAgICB9IGVsc2UgeyB0cmlnZ2VySGlkZSgpOyB9XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5UYWI7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuVGFiICYmIGVsZW1lbnQuVGFiLmRpc3Bvc2UoKTtcbiAgaGVpZ2h0RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpO1xuICB0YWJzID0gZWxlbWVudC5jbG9zZXN0KCcubmF2Jyk7XG4gIGRyb3Bkb3duID0gdGFicyAmJiBxdWVyeUVsZW1lbnQoJy5kcm9wZG93bi10b2dnbGUnLHRhYnMpO1xuICBhbmltYXRlSGVpZ2h0ID0gIXN1cHBvcnRUcmFuc2l0aW9uIHx8IChvcHRpb25zLmhlaWdodCA9PT0gZmFsc2UgfHwgaGVpZ2h0RGF0YSA9PT0gJ2ZhbHNlJykgPyBmYWxzZSA6IHRydWU7XG4gIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgaWYgKCAhZWxlbWVudC5UYWIgKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBpZiAoYW5pbWF0ZUhlaWdodCkgeyB0YWJzQ29udGVudENvbnRhaW5lciA9IGdldEFjdGl2ZUNvbnRlbnQoKS5wYXJlbnROb2RlOyB9XG4gIGVsZW1lbnQuVGFiID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVG9hc3QoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB0b2FzdCwgdGltZXIgPSAwLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIGF1dG9oaWRlRGF0YSxcbiAgICAgIGRlbGF5RGF0YSxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIG9wcyA9IHt9O1xuICBmdW5jdGlvbiBzaG93Q29tcGxldGUoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSggJ3Nob3dpbmcnICk7XG4gICAgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ3Nob3cnICk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIGlmIChvcHMuYXV0b2hpZGUpIHsgc2VsZi5oaWRlKCk7IH1cbiAgfVxuICBmdW5jdGlvbiBoaWRlQ29tcGxldGUoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ2hpZGUnICk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZSAoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycgKTtcbiAgICBvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9hc3QsIGhpZGVDb21wbGV0ZSkgOiBoaWRlQ29tcGxldGUoKTtcbiAgfVxuICBmdW5jdGlvbiBkaXNwb3NlQ29tcGxldGUoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLmhpZGUsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlRvYXN0O1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodG9hc3QgJiYgIXRvYXN0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3Qsc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgIGlmIChzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIG9wcy5hbmltYXRpb24gJiYgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ2ZhZGUnICk7XG4gICAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyApO1xuICAgICAgdG9hc3Qub2Zmc2V0V2lkdGg7XG4gICAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93aW5nJyApO1xuICAgICAgb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvYXN0LCBzaG93Q29tcGxldGUpIDogc2hvd0NvbXBsZXRlKCk7XG4gICAgfVxuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAobm9UaW1lcikge1xuICAgIGlmICh0b2FzdCAmJiB0b2FzdC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkge1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LGhpZGVDdXN0b21FdmVudCk7XG4gICAgICBpZihoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIG5vVGltZXIgPyBjbG9zZSgpIDogKHRpbWVyID0gc2V0VGltZW91dCggY2xvc2UsIG9wcy5kZWxheSkpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIG9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b2FzdCwgZGlzcG9zZUNvbXBsZXRlKSA6IGRpc3Bvc2VDb21wbGV0ZSgpO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlRvYXN0ICYmIGVsZW1lbnQuVG9hc3QuZGlzcG9zZSgpO1xuICB0b2FzdCA9IGVsZW1lbnQuY2xvc2VzdCgnLnRvYXN0Jyk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgYXV0b2hpZGVEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYXV0b2hpZGUnKTtcbiAgZGVsYXlEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVsYXknKTtcbiAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndG9hc3QnKTtcbiAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAndG9hc3QnKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0b2FzdCcpO1xuICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndG9hc3QnKTtcbiAgb3BzLmFuaW1hdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uID09PSBmYWxzZSB8fCBhbmltYXRpb25EYXRhID09PSAnZmFsc2UnID8gMCA6IDE7XG4gIG9wcy5hdXRvaGlkZSA9IG9wdGlvbnMuYXV0b2hpZGUgPT09IGZhbHNlIHx8IGF1dG9oaWRlRGF0YSA9PT0gJ2ZhbHNlJyA/IDAgOiAxO1xuICBvcHMuZGVsYXkgPSBwYXJzZUludChvcHRpb25zLmRlbGF5IHx8IGRlbGF5RGF0YSkgfHwgNTAwO1xuICBpZiAoICFlbGVtZW50LlRvYXN0ICkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYuaGlkZSxmYWxzZSk7XG4gIH1cbiAgZWxlbWVudC5Ub2FzdCA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIFRvb2x0aXAoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB0b29sdGlwID0gbnVsbCwgdGltZXIgPSAwLCB0aXRsZVN0cmluZyxcbiAgICAgIGFuaW1hdGlvbkRhdGEsXG4gICAgICBwbGFjZW1lbnREYXRhLFxuICAgICAgZGVsYXlEYXRhLFxuICAgICAgY29udGFpbmVyRGF0YSxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIGNvbnRhaW5lckVsZW1lbnQsXG4gICAgICBjb250YWluZXJEYXRhRWxlbWVudCxcbiAgICAgIG1vZGFsLFxuICAgICAgbmF2YmFyRml4ZWRUb3AsXG4gICAgICBuYXZiYXJGaXhlZEJvdHRvbSxcbiAgICAgIHBsYWNlbWVudENsYXNzLFxuICAgICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZSgndGl0bGUnKVxuICAgICAgICB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpXG4gICAgICAgIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJylcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVUb29sVGlwKCkge1xuICAgIG9wcy5jb250YWluZXIucmVtb3ZlQ2hpbGQodG9vbHRpcCk7XG4gICAgdG9vbHRpcCA9IG51bGw7IHRpbWVyID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb29sVGlwKCkge1xuICAgIHRpdGxlU3RyaW5nID0gZ2V0VGl0bGUoKTtcbiAgICBpZiAoIHRpdGxlU3RyaW5nICkge1xuICAgICAgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgaWYgKG9wcy50ZW1wbGF0ZSkge1xuICAgICAgICB2YXIgdG9vbHRpcE1hcmt1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b29sdGlwTWFya3VwLmlubmVySFRNTCA9IG9wcy50ZW1wbGF0ZS50cmltKCk7XG4gICAgICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gdG9vbHRpcE1hcmt1cC5maXJzdENoaWxkLmNsYXNzTmFtZTtcbiAgICAgICAgdG9vbHRpcC5pbm5lckhUTUwgPSB0b29sdGlwTWFya3VwLmZpcnN0Q2hpbGQuaW5uZXJIVE1MO1xuICAgICAgICBxdWVyeUVsZW1lbnQoJy50b29sdGlwLWlubmVyJyx0b29sdGlwKS5pbm5lckhUTUwgPSB0aXRsZVN0cmluZy50cmltKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdG9vbHRpcEFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2x0aXBBcnJvdy5jbGFzc0xpc3QuYWRkKCdhcnJvdycpO1xuICAgICAgICB0b29sdGlwLmFwcGVuZENoaWxkKHRvb2x0aXBBcnJvdyk7XG4gICAgICAgIHZhciB0b29sdGlwSW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbHRpcElubmVyLmNsYXNzTGlzdC5hZGQoJ3Rvb2x0aXAtaW5uZXInKTtcbiAgICAgICAgdG9vbHRpcC5hcHBlbmRDaGlsZCh0b29sdGlwSW5uZXIpO1xuICAgICAgICB0b29sdGlwSW5uZXIuaW5uZXJIVE1MID0gdGl0bGVTdHJpbmc7XG4gICAgICB9XG4gICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgICB0b29sdGlwLnN0eWxlLnRvcCA9ICcwJztcbiAgICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywndG9vbHRpcCcpO1xuICAgICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKCd0b29sdGlwJykgJiYgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCd0b29sdGlwJyk7XG4gICAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMob3BzLmFuaW1hdGlvbikgJiYgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKG9wcy5hbmltYXRpb24pO1xuICAgICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKHBsYWNlbWVudENsYXNzKSAmJiB0b29sdGlwLmNsYXNzTGlzdC5hZGQocGxhY2VtZW50Q2xhc3MpO1xuICAgICAgb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0b29sdGlwKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlVG9vbHRpcCgpIHtcbiAgICBzdHlsZVRpcChlbGVtZW50LCB0b29sdGlwLCBvcHMucGxhY2VtZW50LCBvcHMuY29udGFpbmVyKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93VG9vbHRpcCgpIHtcbiAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAoIHRvb2x0aXAuY2xhc3NMaXN0LmFkZCgnc2hvdycpICk7XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hIYW5kbGVyKGUpe1xuICAgIGlmICggdG9vbHRpcCAmJiB0b29sdGlwLmNvbnRhaW5zKGUudGFyZ2V0KSB8fCBlLnRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSkgOyBlbHNlIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVBY3Rpb24oYWN0aW9uKXtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCB0b3VjaEhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgd2luZG93W2FjdGlvbl0oICdyZXNpemUnLCBzZWxmLmhpZGUsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd0FjdGlvbigpIHtcbiAgICB0b2dnbGVBY3Rpb24oMSk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGhpZGVBY3Rpb24oKSB7XG4gICAgdG9nZ2xlQWN0aW9uKCk7XG4gICAgcmVtb3ZlVG9vbFRpcCgpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0obW91c2VDbGlja0V2ZW50cy5kb3duLCBzZWxmLnNob3csZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUhvdmVyRXZlbnRzWzBdLCBzZWxmLnNob3csZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUhvdmVyRXZlbnRzWzFdLCBzZWxmLmhpZGUsZmFsc2UpO1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRvb2x0aXAgPT09IG51bGwpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgICAgIGlmIChzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgICAgaWYoY3JlYXRlVG9vbFRpcCgpICE9PSBmYWxzZSkge1xuICAgICAgICAgIHVwZGF0ZVRvb2x0aXAoKTtcbiAgICAgICAgICBzaG93VG9vbHRpcCgpO1xuICAgICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvb2x0aXAsIHNob3dBY3Rpb24pIDogc2hvd0FjdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgMjAgKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodG9vbHRpcCAmJiB0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b29sdGlwLCBoaWRlQWN0aW9uKSA6IGhpZGVBY3Rpb24oKTtcbiAgICAgIH1cbiAgICB9LCBvcHMuZGVsYXkpO1xuICB9O1xuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRvb2x0aXApIHsgc2VsZi5zaG93KCk7IH1cbiAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIHNlbGYuaGlkZSgpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0aXRsZScsIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykpO1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJyk7XG4gICAgZGVsZXRlIGVsZW1lbnQuVG9vbHRpcDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5Ub29sdGlwICYmIGVsZW1lbnQuVG9vbHRpcC5kaXNwb3NlKCk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlbWVudCcpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBjb250YWluZXJEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGFpbmVyJyk7XG4gIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3Rvb2x0aXAnKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0b29sdGlwJyk7XG4gIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ3Rvb2x0aXAnKTtcbiAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3Rvb2x0aXAnKTtcbiAgY29udGFpbmVyRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLmNvbnRhaW5lcik7XG4gIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpO1xuICBtb2RhbCA9IGVsZW1lbnQuY2xvc2VzdCgnLm1vZGFsJyk7XG4gIG5hdmJhckZpeGVkVG9wID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtdG9wJyk7XG4gIG5hdmJhckZpeGVkQm90dG9tID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtYm90dG9tJyk7XG4gIG9wcy5hbmltYXRpb24gPSBvcHRpb25zLmFuaW1hdGlvbiAmJiBvcHRpb25zLmFuaW1hdGlvbiAhPT0gJ2ZhZGUnID8gb3B0aW9ucy5hbmltYXRpb24gOiBhbmltYXRpb25EYXRhIHx8ICdmYWRlJztcbiAgb3BzLnBsYWNlbWVudCA9IG9wdGlvbnMucGxhY2VtZW50ID8gb3B0aW9ucy5wbGFjZW1lbnQgOiBwbGFjZW1lbnREYXRhIHx8ICd0b3AnO1xuICBvcHMudGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlID8gb3B0aW9ucy50ZW1wbGF0ZSA6IG51bGw7XG4gIG9wcy5kZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuZGVsYXkgfHwgZGVsYXlEYXRhKSB8fCAyMDA7XG4gIG9wcy5jb250YWluZXIgPSBjb250YWluZXJFbGVtZW50ID8gY29udGFpbmVyRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGNvbnRhaW5lckRhdGFFbGVtZW50ID8gY29udGFpbmVyRGF0YUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZFRvcCA/IG5hdmJhckZpeGVkVG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRCb3R0b20gPyBuYXZiYXJGaXhlZEJvdHRvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG1vZGFsID8gbW9kYWwgOiBkb2N1bWVudC5ib2R5O1xuICBwbGFjZW1lbnRDbGFzcyA9IFwiYnMtdG9vbHRpcC1cIiArIChvcHMucGxhY2VtZW50KTtcbiAgdGl0bGVTdHJpbmcgPSBnZXRUaXRsZSgpO1xuICBpZiAoICF0aXRsZVN0cmluZyApIHsgcmV0dXJuOyB9XG4gIGlmICghZWxlbWVudC5Ub29sdGlwKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLHRpdGxlU3RyaW5nKTtcbiAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKTtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgZWxlbWVudC5Ub29sdGlwID0gc2VsZjtcbn1cblxudmFyIGNvbXBvbmVudHNJbml0ID0ge307XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVEYXRhQVBJKCBDb25zdHJ1Y3RvciwgY29sbGVjdGlvbiApe1xuICBBcnJheS5mcm9tKGNvbGxlY3Rpb24pLm1hcChmdW5jdGlvbiAoeCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IoeCk7IH0pO1xufVxuZnVuY3Rpb24gaW5pdENhbGxiYWNrKGxvb2tVcCl7XG4gIGxvb2tVcCA9IGxvb2tVcCB8fCBkb2N1bWVudDtcbiAgZm9yICh2YXIgY29tcG9uZW50IGluIGNvbXBvbmVudHNJbml0KSB7XG4gICAgaW5pdGlhbGl6ZURhdGFBUEkoIGNvbXBvbmVudHNJbml0W2NvbXBvbmVudF1bMF0sIGxvb2tVcC5xdWVyeVNlbGVjdG9yQWxsIChjb21wb25lbnRzSW5pdFtjb21wb25lbnRdWzFdKSApO1xuICB9XG59XG5cbmNvbXBvbmVudHNJbml0LkFsZXJ0ID0gWyBBbGVydCwgJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXSddO1xuY29tcG9uZW50c0luaXQuQnV0dG9uID0gWyBCdXR0b24sICdbZGF0YS10b2dnbGU9XCJidXR0b25zXCJdJyBdO1xuY29tcG9uZW50c0luaXQuQ2Fyb3VzZWwgPSBbIENhcm91c2VsLCAnW2RhdGEtcmlkZT1cImNhcm91c2VsXCJdJyBdO1xuY29tcG9uZW50c0luaXQuQ29sbGFwc2UgPSBbIENvbGxhcHNlLCAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Ecm9wZG93biA9IFsgRHJvcGRvd24sICdbZGF0YS10b2dnbGU9XCJkcm9wZG93blwiXSddO1xuY29tcG9uZW50c0luaXQuTW9kYWwgPSBbIE1vZGFsLCAnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Qb3BvdmVyID0gWyBQb3BvdmVyLCAnW2RhdGEtdG9nZ2xlPVwicG9wb3ZlclwiXSxbZGF0YS10aXA9XCJwb3BvdmVyXCJdJyBdO1xuY29tcG9uZW50c0luaXQuU2Nyb2xsU3B5ID0gWyBTY3JvbGxTcHksICdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5UYWIgPSBbIFRhYiwgJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRvYXN0ID0gWyBUb2FzdCwgJ1tkYXRhLWRpc21pc3M9XCJ0b2FzdFwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRvb2x0aXAgPSBbIFRvb2x0aXAsICdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdLFtkYXRhLXRpcD1cInRvb2x0aXBcIl0nIF07XG5kb2N1bWVudC5ib2R5ID8gaW5pdENhbGxiYWNrKCkgOiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIGluaXRXcmFwcGVyKCl7XG5cdGluaXRDYWxsYmFjaygpO1xuXHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJyxpbml0V3JhcHBlcixmYWxzZSk7XG59LCBmYWxzZSApO1xuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50RGF0YUFQSSggQ29uc3RydWN0b3JOYW1lLCBjb2xsZWN0aW9uICl7XG4gIEFycmF5LmZyb20oY29sbGVjdGlvbikubWFwKGZ1bmN0aW9uICh4KXsgcmV0dXJuIHhbQ29uc3RydWN0b3JOYW1lXS5kaXNwb3NlKCk7IH0pO1xufVxuZnVuY3Rpb24gcmVtb3ZlRGF0YUFQSShsb29rVXApIHtcbiAgbG9va1VwID0gbG9va1VwIHx8IGRvY3VtZW50O1xuICBmb3IgKHZhciBjb21wb25lbnQgaW4gY29tcG9uZW50c0luaXQpIHtcbiAgICByZW1vdmVFbGVtZW50RGF0YUFQSSggY29tcG9uZW50LCBsb29rVXAucXVlcnlTZWxlY3RvckFsbCAoY29tcG9uZW50c0luaXRbY29tcG9uZW50XVsxXSkgKTtcbiAgfVxufVxuXG52YXIgdmVyc2lvbiA9IFwiMy4wLjlcIjtcblxudmFyIGluZGV4ID0ge1xuICBBbGVydDogQWxlcnQsXG4gIEJ1dHRvbjogQnV0dG9uLFxuICBDYXJvdXNlbDogQ2Fyb3VzZWwsXG4gIENvbGxhcHNlOiBDb2xsYXBzZSxcbiAgRHJvcGRvd246IERyb3Bkb3duLFxuICBNb2RhbDogTW9kYWwsXG4gIFBvcG92ZXI6IFBvcG92ZXIsXG4gIFNjcm9sbFNweTogU2Nyb2xsU3B5LFxuICBUYWI6IFRhYixcbiAgVG9hc3Q6IFRvYXN0LFxuICBUb29sdGlwOiBUb29sdGlwLFxuICBpbml0Q2FsbGJhY2s6IGluaXRDYWxsYmFjayxcbiAgcmVtb3ZlRGF0YUFQSTogcmVtb3ZlRGF0YUFQSSxcbiAgY29tcG9uZW50c0luaXQ6IGNvbXBvbmVudHNJbml0LFxuICBWZXJzaW9uOiB2ZXJzaW9uXG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmRleDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgKHV0aWxzLmlzQmxvYihyZXF1ZXN0RGF0YSkgfHwgdXRpbHMuaXNGaWxlKHJlcXVlc3REYXRhKSkgJiZcbiAgICAgIHJlcXVlc3REYXRhLnR5cGVcbiAgICApIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSB8fCAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCJleHBvcnQgZnVuY3Rpb24gYXR0cmlidXRlVG9TdHJpbmcoYXR0cmlidXRlKSB7XHJcbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICBhdHRyaWJ1dGUgKz0gJyc7XHJcbiAgICBpZiAoYXR0cmlidXRlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBhdHRyaWJ1dGUgPSAnJztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGF0dHJpYnV0ZS50cmltKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVDbGFzcyhlbGVtLCBjbGFzc05hbWUpIHtcclxuICBlbGVtLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW0sIC4uLmNsYXNzTmFtZXMpIHtcclxuICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoLi4uY2xhc3NOYW1lcyk7XHJcbiAgcmV0dXJuIGVsZW07XHJcbn1cclxuIiwiaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcclxuaW1wb3J0IHsgYXR0cmlidXRlVG9TdHJpbmcgfSBmcm9tICcuL2hlbHBlcic7XHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChheGlvc0NvbmZpZywgLi4uYXJncykge1xyXG4gIGNvbnN0IGluc3RhbmNlID0gQXhpb3MuY3JlYXRlKGF4aW9zQ29uZmlnKTtcclxuICByZXR1cm4ge1xyXG4gICAgZ2V0Q2FydCgpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLmdldCgnL2NhcnQuanMnKTtcclxuICAgIH0sXHJcbiAgICBnZXRQcm9kdWN0KGhhbmRsZSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UuZ2V0KGAvcHJvZHVjdHMvJHtoYW5kbGV9LmpzYCk7XHJcbiAgICB9LFxyXG4gICAgY2xlYXJDYXJ0KCkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvY2xlYXIuanMnKTtcclxuICAgIH0sXHJcbiAgICB1cGRhdGVDYXJ0RnJvbUZvcm0oZm9ybSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvdXBkYXRlLmpzJywgbmV3IEZvcm1EYXRhKGZvcm0pKTtcclxuICAgIH0sXHJcbiAgICBjaGFuZ2VJdGVtQnlLZXlPcklkKGtleU9ySWQsIHF1YW50aXR5KSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9jaGFuZ2UuanMnLCB7XHJcbiAgICAgICAgcXVhbnRpdHk6IHF1YW50aXR5LFxyXG4gICAgICAgIGlkOiBrZXlPcklkLFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVJdGVtQnlLZXlPcklkKGtleU9ySWQpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHsgcXVhbnRpdHk6IDAsIGlkOiBrZXlPcklkIH0pO1xyXG4gICAgfSxcclxuICAgIGNoYW5nZUl0ZW1CeUxpbmUobGluZSwgcXVhbnRpdHkpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHsgcXVhbnRpdHksIGxpbmUgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlSXRlbUJ5TGluZShsaW5lKSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9jaGFuZ2UuanMnLCB7IHF1YW50aXR5OiAwLCBsaW5lIH0pO1xyXG4gICAgfSxcclxuICAgIGFkZEl0ZW0oaWQsIHF1YW50aXR5LCBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9hZGQuanMnLCB7XHJcbiAgICAgICAgaWQsXHJcbiAgICAgICAgcXVhbnRpdHksXHJcbiAgICAgICAgcHJvcGVydGllcyxcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWRkSXRlbUZyb21Gb3JtKGZvcm0pIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2FkZC5qcycsIG5ldyBGb3JtRGF0YShmb3JtKSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlQ2FydEF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xyXG4gICAgICBsZXQgZGF0YSA9ICcnO1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhdHRyaWJ1dGVzKSkge1xyXG4gICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBrZXkgPSBhdHRyaWJ1dGVUb1N0cmluZyhhdHRyaWJ1dGUua2V5KTtcclxuICAgICAgICAgIGlmIChrZXkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGRhdGEgKz1cclxuICAgICAgICAgICAgICAnYXR0cmlidXRlc1snICtcclxuICAgICAgICAgICAgICBrZXkgK1xyXG4gICAgICAgICAgICAgICddPScgK1xyXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZVRvU3RyaW5nKGF0dHJpYnV0ZS52YWx1ZSkgK1xyXG4gICAgICAgICAgICAgICcmJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXR0cmlidXRlcyA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcyAhPT0gbnVsbCkge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XHJcbiAgICAgICAgICBkYXRhICs9XHJcbiAgICAgICAgICAgICdhdHRyaWJ1dGVzWycgK1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVUb1N0cmluZyhrZXkpICtcclxuICAgICAgICAgICAgJ109JyArXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZVRvU3RyaW5nKHZhbHVlKSArXHJcbiAgICAgICAgICAgICcmJztcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvdXBkYXRlLmpzJywgZGF0YSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlQ2FydE5vdGUobm90ZSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdChcclxuICAgICAgICAnL2NhcnQvdXBkYXRlLmpzJyxcclxuICAgICAgICBgbm90ZT0ke2F0dHJpYnV0ZVRvU3RyaW5nKG5vdGUpfWBcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG4iLCIvLyBjb2RlIGZvciB0ZXN0aW1vbmlhbHNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgbmV3IEdsaWRlcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2xpZGVyJyksIHtcclxuICAgIC8vIE1vYmlsZS1maXJzdCBkZWZhdWx0c1xyXG4gICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICBzY3JvbGxMb2NrOiB0cnVlLFxyXG4gICAgZG90czogJyNyZXNwLWRvdHMnLFxyXG4gICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgYXJyb3dzOiB7XHJcbiAgICAgIHByZXY6ICcuZ2xpZGVyLXByZXYnLFxyXG4gICAgICBuZXh0OiAnLmdsaWRlci1uZXh0JyxcclxuICAgIH0sXHJcbiAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgIHtcclxuICAgICAgICAvLyBzY3JlZW5zIGdyZWF0ZXIgdGhhbiA+PSA3NzVweFxyXG4gICAgICAgIGJyZWFrcG9pbnQ6IDAsXHJcbiAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgIC8vIFNldCB0byBgYXV0b2AgYW5kIHByb3ZpZGUgaXRlbSB3aWR0aCB0byBhZGp1c3QgdG8gdmlld3BvcnRcclxuICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgaXRlbVdpZHRoOiAzMDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgLy8gc2NyZWVucyBncmVhdGVyIHRoYW4gPj0gMTAyNHB4XHJcbiAgICAgICAgYnJlYWtwb2ludDogNTQwLFxyXG4gICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICBzbGlkZXNUb1Nob3c6ICdhdXRvJyxcclxuICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAnYXV0bycsXHJcbiAgICAgICAgICBpdGVtV2lkdGg6IDMwMCxcclxuICAgICAgICAgIGR1cmF0aW9uOiAxLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0pO1xyXG59KTtcclxuIiwiaW1wb3J0IHsgdG9nZ2xlQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vaGVscGVyLmpzJztcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gIGlmICh0YXJnZXQuY2xvc2VzdCgnLmRyb3Bkb3duLW1lbnUnKSkge1xyXG4gICAgY29uc29sZS5sb2coJ3ByZXZlbnQgZHJvcGRvd24gbWVudSBmcm9tIGNsb3NpbmcnKTtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxuICAvLyBjbGFzcz1cIm5hdmJhci10b2dnbGVyXCIgZGF0YS10cmlnZ2VyPVwiI25hdmJhcl9tYWluXCJcclxuICBpZiAodGFyZ2V0LmNsb3Nlc3QoJy5uYXZiYXItdG9nZ2xlcltkYXRhLXRyaWdnZXJdJykpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGNvbnN0IG9mZmNhbnZhc19pZCA9IHRhcmdldFxyXG4gICAgICAuY2xvc2VzdCgnLm5hdmJhci10b2dnbGVyW2RhdGEtdHJpZ2dlcl0nKVxyXG4gICAgICAuZ2V0QXR0cmlidXRlKCdkYXRhLXRyaWdnZXInKTtcclxuICAgIGNvbnN0IG9mZmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob2ZmY2FudmFzX2lkKTtcclxuICAgIGlmIChvZmZjYW52YXMpIHtcclxuICAgICAgdG9nZ2xlQ2xhc3Mob2ZmY2FudmFzLCAnc2hvdycpO1xyXG4gICAgfVxyXG4gICAgdG9nZ2xlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ29mZmNhbnZhcy1hY3RpdmUnKTtcclxuICAgIGNvbnN0IHNjcmVlbl9vdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjcmVlbi1vdmVybGF5Jyk7XHJcbiAgICBpZiAoc2NyZWVuX292ZXJsYXkpIHtcclxuICAgICAgdG9nZ2xlQ2xhc3Moc2NyZWVuX292ZXJsYXksICdzaG93Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodGFyZ2V0LmNsb3Nlc3QoJy5idG4tY2xvc2UsIC5zY3JlZW4tb3ZlcmxheScpKSB7XHJcbiAgICBjb25zdCBzY3JlZW5fb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JlZW4tb3ZlcmxheScpO1xyXG4gICAgaWYgKHNjcmVlbl9vdmVybGF5KSB7XHJcbiAgICAgIHJlbW92ZUNsYXNzKHNjcmVlbl9vdmVybGF5LCAnc2hvdycpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbW9iaWxlX29mZmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtb2ZmY2FudmFzJyk7XHJcbiAgICBpZiAobW9iaWxlX29mZmNhbnZhcykge1xyXG4gICAgICByZW1vdmVDbGFzcyhtb2JpbGVfb2ZmY2FudmFzLCAnc2hvdycpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ29mZmNhbnZhcy1hY3RpdmUnKTtcclxuICB9XHJcbn0pO1xyXG4iLCJpbXBvcnQgQlNOIGZyb20gJ2Jvb3RzdHJhcC5uYXRpdmUnO1xyXG5pbXBvcnQgYWpheEFQSUNyZWF0b3IgZnJvbSAnLi9hamF4YXBpJztcclxuaW1wb3J0ICcuL3NlY3Rpb25zL3Rlc3RpbW9uaWFscyc7XHJcbmltcG9ydCAnLi9zZWN0aW9ucy9oZWFkZXInO1xyXG5cclxud2luZG93LmRhdG9tYXIgPSB7XHJcbiAgQlNOLFxyXG4gIGFwaTogYWpheEFQSUNyZWF0b3Ioe30pLFxyXG59O1xyXG4iXSwibmFtZXMiOlsidHJhbnNpdGlvbkVuZEV2ZW50IiwiZG9jdW1lbnQiLCJib2R5Iiwic3R5bGUiLCJzdXBwb3J0VHJhbnNpdGlvbiIsInRyYW5zaXRpb25EdXJhdGlvbiIsImdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24iLCJlbGVtZW50IiwiZHVyYXRpb24iLCJwYXJzZUZsb2F0IiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImlzTmFOIiwiZW11bGF0ZVRyYW5zaXRpb25FbmQiLCJoYW5kbGVyIiwiY2FsbGVkIiwiYWRkRXZlbnRMaXN0ZW5lciIsInRyYW5zaXRpb25FbmRXcmFwcGVyIiwiZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzZXRUaW1lb3V0IiwicXVlcnlFbGVtZW50Iiwic2VsZWN0b3IiLCJwYXJlbnQiLCJsb29rVXAiLCJFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImJvb3RzdHJhcEN1c3RvbUV2ZW50IiwiZXZlbnROYW1lIiwiY29tcG9uZW50TmFtZSIsInJlbGF0ZWQiLCJPcmlnaW5hbEN1c3RvbUV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJjYW5jZWxhYmxlIiwicmVsYXRlZFRhcmdldCIsImRpc3BhdGNoQ3VzdG9tRXZlbnQiLCJjdXN0b21FdmVudCIsImRpc3BhdGNoRXZlbnQiLCJBbGVydCIsInNlbGYiLCJhbGVydCIsImNsb3NlQ3VzdG9tRXZlbnQiLCJjbG9zZWRDdXN0b21FdmVudCIsInRyaWdnZXJIYW5kbGVyIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJ0cmFuc2l0aW9uRW5kSGFuZGxlciIsInRvZ2dsZUV2ZW50cyIsImFjdGlvbiIsImNsaWNrSGFuZGxlciIsInRhcmdldCIsImNsb3Nlc3QiLCJjbG9zZSIsInBhcmVudE5vZGUiLCJyZW1vdmVDaGlsZCIsImNhbGwiLCJkZWZhdWx0UHJldmVudGVkIiwiZGlzcG9zZSIsInJlbW92ZSIsIkJ1dHRvbiIsImxhYmVscyIsImNoYW5nZUN1c3RvbUV2ZW50IiwidG9nZ2xlIiwiaW5wdXQiLCJsYWJlbCIsInRhZ05hbWUiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInR5cGUiLCJjaGVja2VkIiwiYWRkIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwidG9nZ2xlZCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiQXJyYXkiLCJmcm9tIiwibWFwIiwib3RoZXJMYWJlbCIsIm90aGVySW5wdXQiLCJrZXlIYW5kbGVyIiwia2V5Iiwid2hpY2giLCJrZXlDb2RlIiwiYWN0aXZlRWxlbWVudCIsInByZXZlbnRTY3JvbGwiLCJwcmV2ZW50RGVmYXVsdCIsImZvY3VzVG9nZ2xlIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsImxlbmd0aCIsImJ0biIsIm1vdXNlSG92ZXJFdmVudHMiLCJzdXBwb3J0UGFzc2l2ZSIsInJlc3VsdCIsIm9wdHMiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsIndyYXAiLCJwYXNzaXZlSGFuZGxlciIsInBhc3NpdmUiLCJpc0VsZW1lbnRJblNjcm9sbFJhbmdlIiwiYmNyIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0Iiwidmlld3BvcnRIZWlnaHQiLCJ3aW5kb3ciLCJpbm5lckhlaWdodCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudEhlaWdodCIsInRvcCIsImJvdHRvbSIsIkNhcm91c2VsIiwib3B0aW9ucyIsInZhcnMiLCJvcHMiLCJzbGlkZUN1c3RvbUV2ZW50Iiwic2xpZEN1c3RvbUV2ZW50Iiwic2xpZGVzIiwibGVmdEFycm93IiwicmlnaHRBcnJvdyIsImluZGljYXRvciIsImluZGljYXRvcnMiLCJwYXVzZUhhbmRsZXIiLCJpbnRlcnZhbCIsImlzU2xpZGluZyIsImNsZWFySW50ZXJ2YWwiLCJ0aW1lciIsInJlc3VtZUhhbmRsZXIiLCJjeWNsZSIsImluZGljYXRvckhhbmRsZXIiLCJldmVudFRhcmdldCIsImluZGV4IiwicGFyc2VJbnQiLCJzbGlkZVRvIiwiY29udHJvbHNIYW5kbGVyIiwiY3VycmVudFRhcmdldCIsInNyY0VsZW1lbnQiLCJyZWYiLCJwYXVzZSIsInRvdWNoIiwidG91Y2hEb3duSGFuZGxlciIsImtleWJvYXJkIiwidG9nZ2xlVG91Y2hFdmVudHMiLCJ0b3VjaE1vdmVIYW5kbGVyIiwidG91Y2hFbmRIYW5kbGVyIiwiaXNUb3VjaCIsInRvdWNoUG9zaXRpb24iLCJzdGFydFgiLCJjaGFuZ2VkVG91Y2hlcyIsInBhZ2VYIiwiY3VycmVudFgiLCJlbmRYIiwiTWF0aCIsImFicyIsInNldEFjdGl2ZVBhZ2UiLCJwYWdlSW5kZXgiLCJ4IiwibmV4dCIsInRpbWVvdXQiLCJlbGFwc2VkVGltZSIsImFjdGl2ZUl0ZW0iLCJnZXRBY3RpdmVJbmRleCIsIm9yaWVudGF0aW9uIiwiZGlyZWN0aW9uIiwiaGlkZGVuIiwic2V0SW50ZXJ2YWwiLCJpZHgiLCJvZmZzZXRXaWR0aCIsImluZGV4T2YiLCJpdGVtQ2xhc3NlcyIsInNsaWRlIiwiY2xzIiwiaW50ZXJ2YWxBdHRyaWJ1dGUiLCJpbnRlcnZhbERhdGEiLCJ0b3VjaERhdGEiLCJwYXVzZURhdGEiLCJrZXlib2FyZERhdGEiLCJpbnRlcnZhbE9wdGlvbiIsInRvdWNoT3B0aW9uIiwiQ29sbGFwc2UiLCJhY2NvcmRpb24iLCJjb2xsYXBzZSIsImFjdGl2ZUNvbGxhcHNlIiwic2hvd0N1c3RvbUV2ZW50Iiwic2hvd25DdXN0b21FdmVudCIsImhpZGVDdXN0b21FdmVudCIsImhpZGRlbkN1c3RvbUV2ZW50Iiwib3BlbkFjdGlvbiIsImNvbGxhcHNlRWxlbWVudCIsImlzQW5pbWF0aW5nIiwiaGVpZ2h0Iiwic2Nyb2xsSGVpZ2h0IiwiY2xvc2VBY3Rpb24iLCJzaG93IiwiaGlkZSIsImlkIiwiYWNjb3JkaW9uRGF0YSIsInNldEZvY3VzIiwiZm9jdXMiLCJzZXRBY3RpdmUiLCJEcm9wZG93biIsIm9wdGlvbiIsIm1lbnUiLCJtZW51SXRlbXMiLCJwZXJzaXN0IiwicHJldmVudEVtcHR5QW5jaG9yIiwiYW5jaG9yIiwiaHJlZiIsInNsaWNlIiwidG9nZ2xlRGlzbWlzcyIsIm9wZW4iLCJkaXNtaXNzSGFuZGxlciIsImhhc0RhdGEiLCJpc1NhbWVFbGVtZW50IiwiaXNJbnNpZGVNZW51IiwiaXNNZW51SXRlbSIsImNoaWxkcmVuIiwiY2hpbGQiLCJwdXNoIiwiTW9kYWwiLCJtb2RhbCIsInNjcm9sbEJhcldpZHRoIiwib3ZlcmxheSIsIm92ZXJsYXlEZWxheSIsImZpeGVkSXRlbXMiLCJzZXRTY3JvbGxiYXIiLCJvcGVuTW9kYWwiLCJib2R5UGFkIiwicGFkZGluZ1JpZ2h0IiwiYm9keU92ZXJmbG93IiwibW9kYWxPdmVyZmxvdyIsIm1lYXN1cmVTY3JvbGxiYXIiLCJmaXhlZCIsIml0ZW1QYWQiLCJyZXNldFNjcm9sbGJhciIsInNjcm9sbERpdiIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aFZhbHVlIiwiY2xhc3NOYW1lIiwiYXBwZW5kQ2hpbGQiLCJjbGllbnRXaWR0aCIsImNyZWF0ZU92ZXJsYXkiLCJuZXdPdmVybGF5IiwiYW5pbWF0aW9uIiwicmVtb3ZlT3ZlcmxheSIsInVwZGF0ZSIsImJlZm9yZVNob3ciLCJkaXNwbGF5IiwidHJpZ2dlclNob3ciLCJ0cmlnZ2VySGlkZSIsImZvcmNlIiwiY2xpY2tUYXJnZXQiLCJtb2RhbElEIiwidGFyZ2V0QXR0clZhbHVlIiwiZWxlbUF0dHJWYWx1ZSIsIm1vZGFsVHJpZ2dlciIsInBhcmVudFdpdGhEYXRhIiwiYmFja2Ryb3AiLCJjdXJyZW50T3BlbiIsInNldENvbnRlbnQiLCJjb250ZW50IiwiaW5uZXJIVE1MIiwiY2hlY2tNb2RhbCIsImNvbmNhdCIsInRyaW0iLCJtb3VzZUNsaWNrRXZlbnRzIiwiZG93biIsInVwIiwiZ2V0U2Nyb2xsIiwieSIsInBhZ2VZT2Zmc2V0Iiwic2Nyb2xsVG9wIiwicGFnZVhPZmZzZXQiLCJzY3JvbGxMZWZ0Iiwic3R5bGVUaXAiLCJsaW5rIiwicG9zaXRpb24iLCJ0aXBQb3NpdGlvbnMiLCJlbGVtZW50RGltZW5zaW9ucyIsInciLCJoIiwib2Zmc2V0SGVpZ2h0Iiwid2luZG93V2lkdGgiLCJ3aW5kb3dIZWlnaHQiLCJyZWN0Iiwic2Nyb2xsIiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsImxpbmtEaW1lbnNpb25zIiwicmlnaHQiLCJsZWZ0IiwiaXNQb3BvdmVyIiwiYXJyb3ciLCJoYWxmVG9wRXhjZWVkIiwiaGFsZkxlZnRFeGNlZWQiLCJoYWxmUmlnaHRFeGNlZWQiLCJoYWxmQm90dG9tRXhjZWVkIiwidG9wRXhjZWVkIiwibGVmdEV4Y2VlZCIsImJvdHRvbUV4Y2VlZCIsInJpZ2h0RXhjZWVkIiwidG9wUG9zaXRpb24iLCJsZWZ0UG9zaXRpb24iLCJhcnJvd1RvcCIsImFycm93TGVmdCIsImFycm93V2lkdGgiLCJhcnJvd0hlaWdodCIsInJlcGxhY2UiLCJQb3BvdmVyIiwicG9wb3ZlciIsImlzSXBob25lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInRpdGxlU3RyaW5nIiwiY29udGVudFN0cmluZyIsInRyaWdnZXJEYXRhIiwiYW5pbWF0aW9uRGF0YSIsInBsYWNlbWVudERhdGEiLCJkaXNtaXNzaWJsZURhdGEiLCJkZWxheURhdGEiLCJjb250YWluZXJEYXRhIiwiY2xvc2VCdG4iLCJjb250YWluZXJFbGVtZW50IiwiY29udGFpbmVyRGF0YUVsZW1lbnQiLCJuYXZiYXJGaXhlZFRvcCIsIm5hdmJhckZpeGVkQm90dG9tIiwicGxhY2VtZW50Q2xhc3MiLCJkaXNtaXNzaWJsZUhhbmRsZXIiLCJnZXRDb250ZW50cyIsInRpdGxlIiwicmVtb3ZlUG9wb3ZlciIsImNvbnRhaW5lciIsImNyZWF0ZVBvcG92ZXIiLCJwb3BvdmVyQXJyb3ciLCJ0ZW1wbGF0ZSIsInBvcG92ZXJUaXRsZSIsImRpc21pc3NpYmxlIiwicG9wb3ZlckJvZHlNYXJrdXAiLCJwb3BvdmVyVGVtcGxhdGUiLCJmaXJzdENoaWxkIiwicG9wb3ZlckhlYWRlciIsInBvcG92ZXJCb2R5Iiwic2hvd1BvcG92ZXIiLCJ1cGRhdGVQb3BvdmVyIiwicGxhY2VtZW50IiwiZm9yY2VGb2N1cyIsInRyaWdnZXIiLCJ0b3VjaEhhbmRsZXIiLCJkaXNtaXNzSGFuZGxlclRvZ2dsZSIsInNob3dUcmlnZ2VyIiwiaGlkZVRyaWdnZXIiLCJjbGVhclRpbWVvdXQiLCJkZWxheSIsInBvcG92ZXJDb250ZW50cyIsIlNjcm9sbFNweSIsInRhcmdldERhdGEiLCJvZmZzZXREYXRhIiwic3B5VGFyZ2V0Iiwic2Nyb2xsVGFyZ2V0IiwidXBkYXRlVGFyZ2V0cyIsImxpbmtzIiwiaXRlbXMiLCJ0YXJnZXRzIiwidGFyZ2V0SXRlbSIsImNoYXJBdCIsInVwZGF0ZUl0ZW0iLCJpdGVtIiwiZHJvcG1lbnUiLCJkcm9wTGluayIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciLCJuZXh0U2libGluZyIsIm5leHRFbGVtZW50U2libGluZyIsImFjdGl2ZVNpYmxpbmciLCJ0YXJnZXRSZWN0IiwiaXNXaW5kb3ciLCJpc0FjdGl2ZSIsInRvcEVkZ2UiLCJzY3JvbGxPZmZzZXQiLCJvZmZzZXQiLCJib3R0b21FZGdlIiwiaW5zaWRlIiwidXBkYXRlSXRlbXMiLCJsIiwicmVmcmVzaCIsIlRhYiIsImhlaWdodERhdGEiLCJ0YWJzIiwiZHJvcGRvd24iLCJ0YWJzQ29udGVudENvbnRhaW5lciIsImFjdGl2ZVRhYiIsImFjdGl2ZUNvbnRlbnQiLCJuZXh0Q29udGVudCIsImNvbnRhaW5lckhlaWdodCIsImVxdWFsQ29udGVudHMiLCJuZXh0SGVpZ2h0IiwiYW5pbWF0ZUhlaWdodCIsInRyaWdnZXJFbmQiLCJnZXRBY3RpdmVUYWIiLCJhY3RpdmVUYWJzIiwiZ2V0QWN0aXZlQ29udGVudCIsIlRvYXN0IiwidG9hc3QiLCJhdXRvaGlkZURhdGEiLCJzaG93Q29tcGxldGUiLCJhdXRvaGlkZSIsImhpZGVDb21wbGV0ZSIsImRpc3Bvc2VDb21wbGV0ZSIsIm5vVGltZXIiLCJUb29sdGlwIiwidG9vbHRpcCIsImdldFRpdGxlIiwicmVtb3ZlVG9vbFRpcCIsImNyZWF0ZVRvb2xUaXAiLCJ0b29sdGlwTWFya3VwIiwidG9vbHRpcEFycm93IiwidG9vbHRpcElubmVyIiwidXBkYXRlVG9vbHRpcCIsInNob3dUb29sdGlwIiwidG9nZ2xlQWN0aW9uIiwic2hvd0FjdGlvbiIsImhpZGVBY3Rpb24iLCJjb21wb25lbnRzSW5pdCIsImluaXRpYWxpemVEYXRhQVBJIiwiQ29uc3RydWN0b3IiLCJjb2xsZWN0aW9uIiwiaW5pdENhbGxiYWNrIiwiY29tcG9uZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImluaXRXcmFwcGVyIiwicmVtb3ZlRWxlbWVudERhdGFBUEkiLCJDb25zdHJ1Y3Rvck5hbWUiLCJyZW1vdmVEYXRhQVBJIiwidmVyc2lvbiIsIlZlcnNpb24iLCJiaW5kIiwiZm4iLCJ0aGlzQXJnIiwiYXJncyIsImFyZ3VtZW50cyIsImkiLCJhcHBseSIsInRvU3RyaW5nIiwicHJvdG90eXBlIiwiaXNBcnJheSIsInZhbCIsImlzVW5kZWZpbmVkIiwiaXNCdWZmZXIiLCJjb25zdHJ1Y3RvciIsImlzQXJyYXlCdWZmZXIiLCJpc0Zvcm1EYXRhIiwiRm9ybURhdGEiLCJpc0FycmF5QnVmZmVyVmlldyIsIkFycmF5QnVmZmVyIiwiaXNWaWV3IiwiYnVmZmVyIiwiaXNTdHJpbmciLCJpc051bWJlciIsImlzT2JqZWN0IiwiaXNQbGFpbk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwiaXNEYXRlIiwiaXNGaWxlIiwiaXNCbG9iIiwiaXNGdW5jdGlvbiIsImlzU3RyZWFtIiwicGlwZSIsImlzVVJMU2VhcmNoUGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwic3RyIiwiaXNTdGFuZGFyZEJyb3dzZXJFbnYiLCJwcm9kdWN0IiwiZm9yRWFjaCIsIm9iaiIsImhhc093blByb3BlcnR5IiwibWVyZ2UiLCJhc3NpZ25WYWx1ZSIsImV4dGVuZCIsImEiLCJiIiwic3RyaXBCT00iLCJjaGFyQ29kZUF0IiwiZW5jb2RlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiYnVpbGRVUkwiLCJ1cmwiLCJwYXJhbXMiLCJwYXJhbXNTZXJpYWxpemVyIiwic2VyaWFsaXplZFBhcmFtcyIsInV0aWxzIiwicGFydHMiLCJzZXJpYWxpemUiLCJwYXJzZVZhbHVlIiwidiIsInRvSVNPU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImpvaW4iLCJoYXNobWFya0luZGV4IiwiSW50ZXJjZXB0b3JNYW5hZ2VyIiwiaGFuZGxlcnMiLCJ1c2UiLCJmdWxmaWxsZWQiLCJyZWplY3RlZCIsImVqZWN0IiwiZm9yRWFjaEhhbmRsZXIiLCJ0cmFuc2Zvcm1EYXRhIiwiZGF0YSIsImhlYWRlcnMiLCJmbnMiLCJ0cmFuc2Zvcm0iLCJpc0NhbmNlbCIsInZhbHVlIiwiX19DQU5DRUxfXyIsIm5vcm1hbGl6ZUhlYWRlck5hbWUiLCJub3JtYWxpemVkTmFtZSIsInByb2Nlc3NIZWFkZXIiLCJuYW1lIiwidG9VcHBlckNhc2UiLCJlbmhhbmNlRXJyb3IiLCJlcnJvciIsImNvbmZpZyIsImNvZGUiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJpc0F4aW9zRXJyb3IiLCJ0b0pTT04iLCJtZXNzYWdlIiwiZGVzY3JpcHRpb24iLCJudW1iZXIiLCJmaWxlTmFtZSIsImxpbmVOdW1iZXIiLCJjb2x1bW5OdW1iZXIiLCJzdGFjayIsImNyZWF0ZUVycm9yIiwiRXJyb3IiLCJzZXR0bGUiLCJyZXNvbHZlIiwicmVqZWN0IiwidmFsaWRhdGVTdGF0dXMiLCJzdGF0dXMiLCJzdGFuZGFyZEJyb3dzZXJFbnYiLCJ3cml0ZSIsImV4cGlyZXMiLCJwYXRoIiwiZG9tYWluIiwic2VjdXJlIiwiY29va2llIiwiRGF0ZSIsInRvR01UU3RyaW5nIiwicmVhZCIsIm1hdGNoIiwiUmVnRXhwIiwiZGVjb2RlVVJJQ29tcG9uZW50Iiwibm93Iiwibm9uU3RhbmRhcmRCcm93c2VyRW52IiwiaXNBYnNvbHV0ZVVSTCIsImNvbWJpbmVVUkxzIiwiYmFzZVVSTCIsInJlbGF0aXZlVVJMIiwiYnVpbGRGdWxsUGF0aCIsInJlcXVlc3RlZFVSTCIsImlnbm9yZUR1cGxpY2F0ZU9mIiwicGFyc2VIZWFkZXJzIiwicGFyc2VkIiwic3BsaXQiLCJwYXJzZXIiLCJsaW5lIiwic3Vic3RyIiwidG9Mb3dlckNhc2UiLCJtc2llIiwidXJsUGFyc2luZ05vZGUiLCJvcmlnaW5VUkwiLCJyZXNvbHZlVVJMIiwicHJvdG9jb2wiLCJob3N0Iiwic2VhcmNoIiwiaGFzaCIsImhvc3RuYW1lIiwicG9ydCIsInBhdGhuYW1lIiwibG9jYXRpb24iLCJpc1VSTFNhbWVPcmlnaW4iLCJyZXF1ZXN0VVJMIiwieGhyQWRhcHRlciIsIlByb21pc2UiLCJkaXNwYXRjaFhoclJlcXVlc3QiLCJyZXF1ZXN0RGF0YSIsInJlcXVlc3RIZWFkZXJzIiwiWE1MSHR0cFJlcXVlc3QiLCJhdXRoIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInVuZXNjYXBlIiwiQXV0aG9yaXphdGlvbiIsImJ0b2EiLCJmdWxsUGF0aCIsIm1ldGhvZCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsImhhbmRsZUxvYWQiLCJyZWFkeVN0YXRlIiwicmVzcG9uc2VVUkwiLCJyZXNwb25zZUhlYWRlcnMiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJyZXNwb25zZURhdGEiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJzdGF0dXNUZXh0Iiwib25hYm9ydCIsImhhbmRsZUFib3J0Iiwib25lcnJvciIsImhhbmRsZUVycm9yIiwib250aW1lb3V0IiwiaGFuZGxlVGltZW91dCIsInRpbWVvdXRFcnJvck1lc3NhZ2UiLCJ4c3JmVmFsdWUiLCJ3aXRoQ3JlZGVudGlhbHMiLCJ4c3JmQ29va2llTmFtZSIsImNvb2tpZXMiLCJ1bmRlZmluZWQiLCJ4c3JmSGVhZGVyTmFtZSIsInNldFJlcXVlc3RIZWFkZXIiLCJvbkRvd25sb2FkUHJvZ3Jlc3MiLCJvblVwbG9hZFByb2dyZXNzIiwidXBsb2FkIiwiY2FuY2VsVG9rZW4iLCJwcm9taXNlIiwidGhlbiIsIm9uQ2FuY2VsZWQiLCJjYW5jZWwiLCJhYm9ydCIsInNlbmQiLCJERUZBVUxUX0NPTlRFTlRfVFlQRSIsInNldENvbnRlbnRUeXBlSWZVbnNldCIsImdldERlZmF1bHRBZGFwdGVyIiwiYWRhcHRlciIsInJlcXVpcmUkJDAiLCJwcm9jZXNzIiwicmVxdWlyZSQkMSIsImRlZmF1bHRzIiwidHJhbnNmb3JtUmVxdWVzdCIsInRyYW5zZm9ybVJlc3BvbnNlIiwicGFyc2UiLCJtYXhDb250ZW50TGVuZ3RoIiwibWF4Qm9keUxlbmd0aCIsImNvbW1vbiIsImZvckVhY2hNZXRob2ROb0RhdGEiLCJmb3JFYWNoTWV0aG9kV2l0aERhdGEiLCJ0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkIiwidGhyb3dJZlJlcXVlc3RlZCIsImRpc3BhdGNoUmVxdWVzdCIsImNsZWFuSGVhZGVyQ29uZmlnIiwib25BZGFwdGVyUmVzb2x1dGlvbiIsIm9uQWRhcHRlclJlamVjdGlvbiIsInJlYXNvbiIsIm1lcmdlQ29uZmlnIiwiY29uZmlnMSIsImNvbmZpZzIiLCJ2YWx1ZUZyb21Db25maWcyS2V5cyIsIm1lcmdlRGVlcFByb3BlcnRpZXNLZXlzIiwiZGVmYXVsdFRvQ29uZmlnMktleXMiLCJkaXJlY3RNZXJnZUtleXMiLCJnZXRNZXJnZWRWYWx1ZSIsInNvdXJjZSIsIm1lcmdlRGVlcFByb3BlcnRpZXMiLCJwcm9wIiwidmFsdWVGcm9tQ29uZmlnMiIsImRlZmF1bHRUb0NvbmZpZzIiLCJheGlvc0tleXMiLCJvdGhlcktleXMiLCJrZXlzIiwiZmlsdGVyIiwiZmlsdGVyQXhpb3NLZXlzIiwiQXhpb3MiLCJpbnN0YW5jZUNvbmZpZyIsImludGVyY2VwdG9ycyIsImNoYWluIiwidW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMiLCJpbnRlcmNlcHRvciIsInVuc2hpZnQiLCJwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMiLCJzaGlmdCIsImdldFVyaSIsIkNhbmNlbCIsIkNhbmNlbFRva2VuIiwiZXhlY3V0b3IiLCJUeXBlRXJyb3IiLCJyZXNvbHZlUHJvbWlzZSIsInByb21pc2VFeGVjdXRvciIsInRva2VuIiwiYyIsInNwcmVhZCIsImNhbGxiYWNrIiwiYXJyIiwiY3JlYXRlSW5zdGFuY2UiLCJkZWZhdWx0Q29uZmlnIiwiY29udGV4dCIsImluc3RhbmNlIiwiYXhpb3MiLCJjcmVhdGUiLCJyZXF1aXJlJCQyIiwiYWxsIiwicHJvbWlzZXMiLCJyZXF1aXJlJCQzIiwiYXR0cmlidXRlVG9TdHJpbmciLCJhdHRyaWJ1dGUiLCJ0b2dnbGVDbGFzcyIsImVsZW0iLCJyZW1vdmVDbGFzcyIsImNsYXNzTmFtZXMiLCJheGlvc0NvbmZpZyIsImdldENhcnQiLCJnZXRQcm9kdWN0IiwiaGFuZGxlIiwiY2xlYXJDYXJ0IiwicG9zdCIsInVwZGF0ZUNhcnRGcm9tRm9ybSIsImZvcm0iLCJjaGFuZ2VJdGVtQnlLZXlPcklkIiwia2V5T3JJZCIsInF1YW50aXR5IiwicmVtb3ZlSXRlbUJ5S2V5T3JJZCIsImNoYW5nZUl0ZW1CeUxpbmUiLCJyZW1vdmVJdGVtQnlMaW5lIiwiYWRkSXRlbSIsInByb3BlcnRpZXMiLCJhZGRJdGVtRnJvbUZvcm0iLCJ1cGRhdGVDYXJ0QXR0cmlidXRlcyIsImF0dHJpYnV0ZXMiLCJ1cGRhdGVDYXJ0Tm90ZSIsIm5vdGUiLCJHbGlkZXIiLCJzbGlkZXNUb1Nob3ciLCJzbGlkZXNUb1Njcm9sbCIsInNjcm9sbExvY2siLCJkb3RzIiwiZHJhZ2dhYmxlIiwiYXJyb3dzIiwicHJldiIsInJlc3BvbnNpdmUiLCJicmVha3BvaW50Iiwic2V0dGluZ3MiLCJpdGVtV2lkdGgiLCJldmVudCIsImNvbnNvbGUiLCJsb2ciLCJzdG9wUHJvcGFnYXRpb24iLCJvZmZjYW52YXNfaWQiLCJvZmZjYW52YXMiLCJzY3JlZW5fb3ZlcmxheSIsIm1vYmlsZV9vZmZjYW52YXMiLCJkYXRvbWFyIiwiQlNOIiwiYXBpIiwiYWpheEFQSUNyZWF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0VBQUE7Ozs7O0VBS0EsSUFBSUEsa0JBQWtCLEdBQUcsc0JBQXNCQyxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBcEMsR0FBNEMscUJBQTVDLEdBQW9FLGVBQTdGO0VBRUEsSUFBSUMsaUJBQWlCLEdBQUcsc0JBQXNCSCxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBcEMsSUFBNkMsZ0JBQWdCRixRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBbkc7RUFFQSxJQUFJRSxrQkFBa0IsR0FBRyxzQkFBc0JKLFFBQVEsQ0FBQ0MsSUFBVCxDQUFjQyxLQUFwQyxHQUE0QywwQkFBNUMsR0FBeUUsb0JBQWxHOztFQUVBLFNBQVNHLDRCQUFULENBQXNDQyxPQUF0QyxFQUErQztFQUM3QyxNQUFJQyxRQUFRLEdBQUdKLGlCQUFpQixHQUFHSyxVQUFVLENBQUNDLGdCQUFnQixDQUFDSCxPQUFELENBQWhCLENBQTBCRixrQkFB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
