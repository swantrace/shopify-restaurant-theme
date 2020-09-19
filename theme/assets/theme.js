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

  var macyInstance = macy({
    container: '.index-section--masonry .images-wrapper',
    columns: 3,
    breakAt: {
      520: 2,
      400: 1
    }
  });

  window.datomar = {
    BSN: index,
    api: ajaxAPICreator({})
  };

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ib290c3RyYXAubmF0aXZlL2Rpc3QvYm9vdHN0cmFwLW5hdGl2ZS5lc20uanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvaGVscGVyLmpzIiwic3JjL3NjcmlwdHMvYWpheGFwaS5qcyIsInNyYy9zY3JpcHRzL3NlY3Rpb25zL3Rlc3RpbW9uaWFscy5qcyIsInNyYy9zY3JpcHRzL3NlY3Rpb25zL2hlYWRlci5qcyIsIm5vZGVfbW9kdWxlcy9tYWN5L2Rpc3QvbWFjeS5qcyIsInNyYy9zY3JpcHRzL3NlY3Rpb25zL21hc29ucnktZ2FsbGVyeS5qcyIsInNyYy9zY3JpcHRzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICAqIE5hdGl2ZSBKYXZhU2NyaXB0IGZvciBCb290c3RyYXAgdjMuMC45IChodHRwczovL3RoZWRucC5naXRodWIuaW8vYm9vdHN0cmFwLm5hdGl2ZS8pXG4gICogQ29weXJpZ2h0IDIwMTUtMjAyMCDCqSBbb2JqZWN0IE9iamVjdF1cbiAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90aGVkbnAvYm9vdHN0cmFwLm5hdGl2ZS9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICAqL1xudmFyIHRyYW5zaXRpb25FbmRFdmVudCA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID8gJ3dlYmtpdFRyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnO1xuXG52YXIgc3VwcG9ydFRyYW5zaXRpb24gPSAnd2Via2l0VHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAndHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxudmFyIHRyYW5zaXRpb25EdXJhdGlvbiA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID8gJ3dlYmtpdFRyYW5zaXRpb25EdXJhdGlvbicgOiAndHJhbnNpdGlvbkR1cmF0aW9uJztcblxuZnVuY3Rpb24gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihlbGVtZW50KSB7XG4gIHZhciBkdXJhdGlvbiA9IHN1cHBvcnRUcmFuc2l0aW9uID8gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpW3RyYW5zaXRpb25EdXJhdGlvbl0pIDogMDtcbiAgZHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmICFpc05hTihkdXJhdGlvbikgPyBkdXJhdGlvbiAqIDEwMDAgOiAwO1xuICByZXR1cm4gZHVyYXRpb247XG59XG5cbmZ1bmN0aW9uIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGVsZW1lbnQsaGFuZGxlcil7XG4gIHZhciBjYWxsZWQgPSAwLCBkdXJhdGlvbiA9IGdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24oZWxlbWVudCk7XG4gIGR1cmF0aW9uID8gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCB0cmFuc2l0aW9uRW5kRXZlbnQsIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRXcmFwcGVyKGUpe1xuICAgICAgICAgICAgICAhY2FsbGVkICYmIGhhbmRsZXIoZSksIGNhbGxlZCA9IDE7XG4gICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHJhbnNpdGlvbkVuZEV2ZW50LCB0cmFuc2l0aW9uRW5kV3JhcHBlcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICA6IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICFjYWxsZWQgJiYgaGFuZGxlcigpLCBjYWxsZWQgPSAxOyB9LCAxNyk7XG59XG5cbmZ1bmN0aW9uIHF1ZXJ5RWxlbWVudChzZWxlY3RvciwgcGFyZW50KSB7XG4gIHZhciBsb29rVXAgPSBwYXJlbnQgJiYgcGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IGRvY3VtZW50O1xuICByZXR1cm4gc2VsZWN0b3IgaW5zdGFuY2VvZiBFbGVtZW50ID8gc2VsZWN0b3IgOiBsb29rVXAucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgY29tcG9uZW50TmFtZSwgcmVsYXRlZCkge1xuICB2YXIgT3JpZ2luYWxDdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCggZXZlbnROYW1lICsgJy5icy4nICsgY29tcG9uZW50TmFtZSwge2NhbmNlbGFibGU6IHRydWV9KTtcbiAgT3JpZ2luYWxDdXN0b21FdmVudC5yZWxhdGVkVGFyZ2V0ID0gcmVsYXRlZDtcbiAgcmV0dXJuIE9yaWdpbmFsQ3VzdG9tRXZlbnQ7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ3VzdG9tRXZlbnQoY3VzdG9tRXZlbnQpe1xuICB0aGlzICYmIHRoaXMuZGlzcGF0Y2hFdmVudChjdXN0b21FdmVudCk7XG59XG5cbmZ1bmN0aW9uIEFsZXJ0KGVsZW1lbnQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGFsZXJ0LFxuICAgIGNsb3NlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnY2xvc2UnLCdhbGVydCcpLFxuICAgIGNsb3NlZEN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2Nsb3NlZCcsJ2FsZXJ0Jyk7XG4gIGZ1bmN0aW9uIHRyaWdnZXJIYW5kbGVyKCkge1xuICAgIGFsZXJ0LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gZW11bGF0ZVRyYW5zaXRpb25FbmQoYWxlcnQsdHJhbnNpdGlvbkVuZEhhbmRsZXIpIDogdHJhbnNpdGlvbkVuZEhhbmRsZXIoKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKXtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGFsZXJ0ID0gZSAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLmFsZXJ0XCIpO1xuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXScsYWxlcnQpO1xuICAgIGVsZW1lbnQgJiYgYWxlcnQgJiYgKGVsZW1lbnQgPT09IGUudGFyZ2V0IHx8IGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpKSAmJiBzZWxmLmNsb3NlKCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZEhhbmRsZXIoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgYWxlcnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChhbGVydCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFsZXJ0LGNsb3NlZEN1c3RvbUV2ZW50KTtcbiAgfVxuICBzZWxmLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggYWxlcnQgJiYgZWxlbWVudCAmJiBhbGVydC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhbGVydCxjbG9zZUN1c3RvbUV2ZW50KTtcbiAgICAgIGlmICggY2xvc2VDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgIHNlbGYuZGlzcG9zZSgpO1xuICAgICAgYWxlcnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgdHJpZ2dlckhhbmRsZXIoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5BbGVydDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgYWxlcnQgPSBlbGVtZW50LmNsb3Nlc3QoJy5hbGVydCcpO1xuICBlbGVtZW50LkFsZXJ0ICYmIGVsZW1lbnQuQWxlcnQuZGlzcG9zZSgpO1xuICBpZiAoICFlbGVtZW50LkFsZXJ0ICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBzZWxmLmVsZW1lbnQgPSBlbGVtZW50O1xuICBlbGVtZW50LkFsZXJ0ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gQnV0dG9uKGVsZW1lbnQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLCBsYWJlbHMsXG4gICAgICBjaGFuZ2VDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdjaGFuZ2UnLCAnYnV0dG9uJyk7XG4gIGZ1bmN0aW9uIHRvZ2dsZShlKSB7XG4gICAgdmFyIGlucHV0LFxuICAgICAgICBsYWJlbCA9IGUudGFyZ2V0LnRhZ05hbWUgPT09ICdMQUJFTCcgPyBlLnRhcmdldFxuICAgICAgICAgICAgICA6IGUudGFyZ2V0LmNsb3Nlc3QoJ0xBQkVMJykgPyBlLnRhcmdldC5jbG9zZXN0KCdMQUJFTCcpIDogbnVsbDtcbiAgICBpbnB1dCA9IGxhYmVsICYmIGxhYmVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdO1xuICAgIGlmICggIWlucHV0ICkgeyByZXR1cm47IH1cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoaW5wdXQsIGNoYW5nZUN1c3RvbUV2ZW50KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgY2hhbmdlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaW5wdXQudHlwZSA9PT0gJ2NoZWNrYm94JyApIHtcbiAgICAgIGlmICggY2hhbmdlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICBpZiAoICFpbnB1dC5jaGVja2VkICkge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIWVsZW1lbnQudG9nZ2xlZCkge1xuICAgICAgICBlbGVtZW50LnRvZ2dsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIGlucHV0LnR5cGUgPT09ICdyYWRpbycgJiYgIWVsZW1lbnQudG9nZ2xlZCApIHtcbiAgICAgIGlmICggY2hhbmdlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICBpZiAoICFpbnB1dC5jaGVja2VkIHx8IChlLnNjcmVlblggPT09IDAgJiYgZS5zY3JlZW5ZID09IDApICkge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZm9jdXMnKTtcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKCdjaGVja2VkJywnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgZWxlbWVudC50b2dnbGVkID0gdHJ1ZTtcbiAgICAgICAgQXJyYXkuZnJvbShsYWJlbHMpLm1hcChmdW5jdGlvbiAob3RoZXJMYWJlbCl7XG4gICAgICAgICAgdmFyIG90aGVySW5wdXQgPSBvdGhlckxhYmVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdO1xuICAgICAgICAgIGlmICggb3RoZXJMYWJlbCAhPT0gbGFiZWwgJiYgb3RoZXJMYWJlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICkgIHtcbiAgICAgICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChvdGhlcklucHV0LCBjaGFuZ2VDdXN0b21FdmVudCk7XG4gICAgICAgICAgICBvdGhlckxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgb3RoZXJJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgIG90aGVySW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHsgZWxlbWVudC50b2dnbGVkID0gZmFsc2U7IH0sIDUwICk7XG4gIH1cbiAgZnVuY3Rpb24ga2V5SGFuZGxlcihlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGtleSA9PT0gMzIgJiYgZS50YXJnZXQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgdG9nZ2xlKGUpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRTY3JvbGwoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBrZXkgPT09IDMyICYmIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBmdW5jdGlvbiBmb2N1c1RvZ2dsZShlKSB7XG4gICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdJTlBVVCcgKSB7XG4gICAgICB2YXIgYWN0aW9uID0gZS50eXBlID09PSAnZm9jdXNpbicgPyAnYWRkJyA6ICdyZW1vdmUnO1xuICAgICAgZS50YXJnZXQuY2xvc2VzdCgnLmJ0bicpLmNsYXNzTGlzdFthY3Rpb25dKCdmb2N1cycpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgnY2xpY2snLHRvZ2dsZSxmYWxzZSApO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgna2V5dXAnLGtleUhhbmRsZXIsZmFsc2UpLCBlbGVtZW50W2FjdGlvbl0oJ2tleWRvd24nLHByZXZlbnRTY3JvbGwsZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgnZm9jdXNpbicsZm9jdXNUb2dnbGUsZmFsc2UpLCBlbGVtZW50W2FjdGlvbl0oJ2ZvY3Vzb3V0Jyxmb2N1c1RvZ2dsZSxmYWxzZSk7XG4gIH1cbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkJ1dHRvbjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5CdXR0b24gJiYgZWxlbWVudC5CdXR0b24uZGlzcG9zZSgpO1xuICBsYWJlbHMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2J0bicpO1xuICBpZiAoIWxhYmVscy5sZW5ndGgpIHsgcmV0dXJuOyB9XG4gIGlmICggIWVsZW1lbnQuQnV0dG9uICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBlbGVtZW50LnRvZ2dsZWQgPSBmYWxzZTtcbiAgZWxlbWVudC5CdXR0b24gPSBzZWxmO1xuICBBcnJheS5mcm9tKGxhYmVscykubWFwKGZ1bmN0aW9uIChidG4pe1xuICAgICFidG4uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKVxuICAgICAgJiYgcXVlcnlFbGVtZW50KCdpbnB1dDpjaGVja2VkJyxidG4pXG4gICAgICAmJiBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYnRuLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJylcbiAgICAgICYmICFxdWVyeUVsZW1lbnQoJ2lucHV0OmNoZWNrZWQnLGJ0bilcbiAgICAgICYmIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgfSk7XG59XG5cbnZhciBtb3VzZUhvdmVyRXZlbnRzID0gKCdvbm1vdXNlbGVhdmUnIGluIGRvY3VtZW50KSA/IFsgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddIDogWyAnbW91c2VvdmVyJywgJ21vdXNlb3V0JyBdO1xuXG52YXIgc3VwcG9ydFBhc3NpdmUgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gd3JhcCgpe1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHdyYXAsIG9wdHMpO1xuICAgIH0sIG9wdHMpO1xuICB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4gcmVzdWx0O1xufSkoKTtcblxudmFyIHBhc3NpdmVIYW5kbGVyID0gc3VwcG9ydFBhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnRJblNjcm9sbFJhbmdlKGVsZW1lbnQpIHtcbiAgdmFyIGJjciA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB2aWV3cG9ydEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZXR1cm4gYmNyLnRvcCA8PSB2aWV3cG9ydEhlaWdodCAmJiBiY3IuYm90dG9tID49IDA7XG59XG5cbmZ1bmN0aW9uIENhcm91c2VsIChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICB2YXJzLCBvcHMsXG4gICAgc2xpZGVDdXN0b21FdmVudCwgc2xpZEN1c3RvbUV2ZW50LFxuICAgIHNsaWRlcywgbGVmdEFycm93LCByaWdodEFycm93LCBpbmRpY2F0b3IsIGluZGljYXRvcnM7XG4gIGZ1bmN0aW9uIHBhdXNlSGFuZGxlcigpIHtcbiAgICBpZiAoIG9wcy5pbnRlcnZhbCAhPT1mYWxzZSAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BhdXNlZCcpICkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKTtcbiAgICAgICF2YXJzLmlzU2xpZGluZyAmJiAoIGNsZWFySW50ZXJ2YWwodmFycy50aW1lciksIHZhcnMudGltZXIgPSBudWxsICk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlc3VtZUhhbmRsZXIoKSB7XG4gICAgaWYgKCBvcHMuaW50ZXJ2YWwgIT09IGZhbHNlICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncGF1c2VkJyk7XG4gICAgICAhdmFycy5pc1NsaWRpbmcgJiYgKCBjbGVhckludGVydmFsKHZhcnMudGltZXIpLCB2YXJzLnRpbWVyID0gbnVsbCApO1xuICAgICAgIXZhcnMuaXNTbGlkaW5nICYmIHNlbGYuY3ljbGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gaW5kaWNhdG9ySGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICB2YXIgZXZlbnRUYXJnZXQgPSBlLnRhcmdldDtcbiAgICBpZiAoIGV2ZW50VGFyZ2V0ICYmICFldmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmIGV2ZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zbGlkZS10bycpICkge1xuICAgICAgdmFycy5pbmRleCA9IHBhcnNlSW50KCBldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xpZGUtdG8nKSk7XG4gICAgfSBlbHNlIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgc2VsZi5zbGlkZVRvKCB2YXJzLmluZGV4ICk7XG4gIH1cbiAgZnVuY3Rpb24gY29udHJvbHNIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHZhciBldmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYgKCBldmVudFRhcmdldCA9PT0gcmlnaHRBcnJvdyApIHtcbiAgICAgIHZhcnMuaW5kZXgrKztcbiAgICB9IGVsc2UgaWYgKCBldmVudFRhcmdldCA9PT0gbGVmdEFycm93ICkge1xuICAgICAgdmFycy5pbmRleC0tO1xuICAgIH1cbiAgICBzZWxmLnNsaWRlVG8oIHZhcnMuaW5kZXggKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKHJlZikge1xuICAgIHZhciB3aGljaCA9IHJlZi53aGljaDtcbiAgICBpZiAodmFycy5pc1NsaWRpbmcpIHsgcmV0dXJuOyB9XG4gICAgc3dpdGNoICh3aGljaCkge1xuICAgICAgY2FzZSAzOTpcbiAgICAgICAgdmFycy5pbmRleCsrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzc6XG4gICAgICAgIHZhcnMuaW5kZXgtLTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuc2xpZGVUbyggdmFycy5pbmRleCApO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKCBvcHMucGF1c2UgJiYgb3BzLmludGVydmFsICkge1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzBdLCBwYXVzZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMV0sIHJlc3VtZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaHN0YXJ0JywgcGF1c2VIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2hlbmQnLCByZXN1bWVIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIH1cbiAgICBvcHMudG91Y2ggJiYgc2xpZGVzLmxlbmd0aCA+IDEgJiYgZWxlbWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHRvdWNoRG93bkhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgcmlnaHRBcnJvdyAmJiByaWdodEFycm93W2FjdGlvbl0oICdjbGljaycsIGNvbnRyb2xzSGFuZGxlcixmYWxzZSApO1xuICAgIGxlZnRBcnJvdyAmJiBsZWZ0QXJyb3dbYWN0aW9uXSggJ2NsaWNrJywgY29udHJvbHNIYW5kbGVyLGZhbHNlICk7XG4gICAgaW5kaWNhdG9yICYmIGluZGljYXRvclthY3Rpb25dKCAnY2xpY2snLCBpbmRpY2F0b3JIYW5kbGVyLGZhbHNlICk7XG4gICAgb3BzLmtleWJvYXJkICYmIHdpbmRvd1thY3Rpb25dKCAna2V5ZG93bicsIGtleUhhbmRsZXIsZmFsc2UgKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVUb3VjaEV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2htb3ZlJywgdG91Y2hNb3ZlSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaGVuZCcsIHRvdWNoRW5kSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBmdW5jdGlvbiB0b3VjaERvd25IYW5kbGVyKGUpIHtcbiAgICBpZiAoIHZhcnMuaXNUb3VjaCApIHsgcmV0dXJuOyB9XG4gICAgdmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSApIHtcbiAgICAgIHZhcnMuaXNUb3VjaCA9IHRydWU7XG4gICAgICB0b2dnbGVUb3VjaEV2ZW50cygxKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hNb3ZlSGFuZGxlcihlKSB7XG4gICAgaWYgKCAhdmFycy5pc1RvdWNoICkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHJldHVybjsgfVxuICAgIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCBlLnR5cGUgPT09ICd0b3VjaG1vdmUnICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID4gMSApIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hFbmRIYW5kbGVyIChlKSB7XG4gICAgaWYgKCAhdmFycy5pc1RvdWNoIHx8IHZhcnMuaXNTbGlkaW5nICkgeyByZXR1cm4gfVxuICAgIHZhcnMudG91Y2hQb3NpdGlvbi5lbmRYID0gdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYIHx8IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCB2YXJzLmlzVG91Y2ggKSB7XG4gICAgICBpZiAoICghZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkgfHwgIWVsZW1lbnQuY29udGFpbnMoZS5yZWxhdGVkVGFyZ2V0KSApXG4gICAgICAgICAgJiYgTWF0aC5hYnModmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCAtIHZhcnMudG91Y2hQb3NpdGlvbi5lbmRYKSA8IDc1ICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA8IHZhcnMudG91Y2hQb3NpdGlvbi5zdGFydFggKSB7XG4gICAgICAgICAgdmFycy5pbmRleCsrO1xuICAgICAgICB9IGVsc2UgaWYgKCB2YXJzLnRvdWNoUG9zaXRpb24uY3VycmVudFggPiB2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYICkge1xuICAgICAgICAgIHZhcnMuaW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgICB2YXJzLmlzVG91Y2ggPSBmYWxzZTtcbiAgICAgICAgc2VsZi5zbGlkZVRvKHZhcnMuaW5kZXgpO1xuICAgICAgfVxuICAgICAgdG9nZ2xlVG91Y2hFdmVudHMoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2V0QWN0aXZlUGFnZShwYWdlSW5kZXgpIHtcbiAgICBBcnJheS5mcm9tKGluZGljYXRvcnMpLm1hcChmdW5jdGlvbiAoeCl7eC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTt9KTtcbiAgICBpbmRpY2F0b3JzW3BhZ2VJbmRleF0gJiYgaW5kaWNhdG9yc1twYWdlSW5kZXhdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICB9XG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRIYW5kbGVyKGUpe1xuICAgIGlmICh2YXJzLnRvdWNoUG9zaXRpb24pe1xuICAgICAgdmFyIG5leHQgPSB2YXJzLmluZGV4LFxuICAgICAgICAgIHRpbWVvdXQgPSBlICYmIGUudGFyZ2V0ICE9PSBzbGlkZXNbbmV4dF0gPyBlLmVsYXBzZWRUaW1lKjEwMDArMTAwIDogMjAsXG4gICAgICAgICAgYWN0aXZlSXRlbSA9IHNlbGYuZ2V0QWN0aXZlSW5kZXgoKSxcbiAgICAgICAgICBvcmllbnRhdGlvbiA9IHZhcnMuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAnbmV4dCcgOiAncHJldic7XG4gICAgICB2YXJzLmlzU2xpZGluZyAmJiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHZhcnMudG91Y2hQb3NpdGlvbil7XG4gICAgICAgICAgdmFycy5pc1NsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyBvcmllbnRhdGlvbikpO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZEN1c3RvbUV2ZW50KTtcbiAgICAgICAgICBpZiAoICFkb2N1bWVudC5oaWRkZW4gJiYgb3BzLmludGVydmFsICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICAgICAgICBzZWxmLmN5Y2xlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG4gIH1cbiAgc2VsZi5jeWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodmFycy50aW1lcikge1xuICAgICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICAgIHZhcnMudGltZXIgPSBudWxsO1xuICAgIH1cbiAgICB2YXJzLnRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGlkeCA9IHZhcnMuaW5kZXggfHwgc2VsZi5nZXRBY3RpdmVJbmRleCgpO1xuICAgICAgaXNFbGVtZW50SW5TY3JvbGxSYW5nZShlbGVtZW50KSAmJiAoaWR4KyssIHNlbGYuc2xpZGVUbyggaWR4ICkgKTtcbiAgICB9LCBvcHMuaW50ZXJ2YWwpO1xuICB9O1xuICBzZWxmLnNsaWRlVG8gPSBmdW5jdGlvbiAobmV4dCkge1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICB2YXIgYWN0aXZlSXRlbSA9IHNlbGYuZ2V0QWN0aXZlSW5kZXgoKSwgb3JpZW50YXRpb247XG4gICAgaWYgKCBhY3RpdmVJdGVtID09PSBuZXh0ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAgKCAoYWN0aXZlSXRlbSA8IG5leHQgKSB8fCAoYWN0aXZlSXRlbSA9PT0gMCAmJiBuZXh0ID09PSBzbGlkZXMubGVuZ3RoIC0xICkgKSB7XG4gICAgICB2YXJzLmRpcmVjdGlvbiA9ICdsZWZ0JztcbiAgICB9IGVsc2UgaWYgICggKGFjdGl2ZUl0ZW0gPiBuZXh0KSB8fCAoYWN0aXZlSXRlbSA9PT0gc2xpZGVzLmxlbmd0aCAtIDEgJiYgbmV4dCA9PT0gMCApICkge1xuICAgICAgdmFycy5kaXJlY3Rpb24gPSAncmlnaHQnO1xuICAgIH1cbiAgICBpZiAoIG5leHQgPCAwICkgeyBuZXh0ID0gc2xpZGVzLmxlbmd0aCAtIDE7IH1cbiAgICBlbHNlIGlmICggbmV4dCA+PSBzbGlkZXMubGVuZ3RoICl7IG5leHQgPSAwOyB9XG4gICAgb3JpZW50YXRpb24gPSB2YXJzLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ25leHQnIDogJ3ByZXYnO1xuICAgIHNsaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2xpZGUnLCAnY2Fyb3VzZWwnLCBzbGlkZXNbbmV4dF0pO1xuICAgIHNsaWRDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzbGlkJywgJ2Nhcm91c2VsJywgc2xpZGVzW25leHRdKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKHNsaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICB2YXJzLmluZGV4ID0gbmV4dDtcbiAgICB2YXJzLmlzU2xpZGluZyA9IHRydWU7XG4gICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICB2YXJzLnRpbWVyID0gbnVsbDtcbiAgICBzZXRBY3RpdmVQYWdlKCBuZXh0ICk7XG4gICAgaWYgKCBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKHNsaWRlc1tuZXh0XSkgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3NsaWRlJykgKSB7XG4gICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgoXCJjYXJvdXNlbC1pdGVtLVwiICsgb3JpZW50YXRpb24pKTtcbiAgICAgIHNsaWRlc1tuZXh0XS5vZmZzZXRXaWR0aDtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LmFkZCgoXCJjYXJvdXNlbC1pdGVtLVwiICsgKHZhcnMuZGlyZWN0aW9uKSkpO1xuICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoc2xpZGVzW25leHRdLCB0cmFuc2l0aW9uRW5kSGFuZGxlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIHNsaWRlc1tuZXh0XS5vZmZzZXRXaWR0aDtcbiAgICAgIHNsaWRlc1thY3RpdmVJdGVtXS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXJzLmlzU2xpZGluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoIG9wcy5pbnRlcnZhbCAmJiBlbGVtZW50ICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICAgICAgc2VsZi5jeWNsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkQ3VzdG9tRXZlbnQpO1xuICAgICAgfSwgMTAwICk7XG4gICAgfVxuICB9O1xuICBzZWxmLmdldEFjdGl2ZUluZGV4ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gQXJyYXkuZnJvbShzbGlkZXMpLmluZGV4T2YoZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1pdGVtIGFjdGl2ZScpWzBdKSB8fCAwOyB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGl0ZW1DbGFzc2VzID0gWydsZWZ0JywncmlnaHQnLCdwcmV2JywnbmV4dCddO1xuICAgIEFycmF5LmZyb20oc2xpZGVzKS5tYXAoZnVuY3Rpb24gKHNsaWRlLGlkeCkge1xuICAgICAgc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSAmJiBzZXRBY3RpdmVQYWdlKCBpZHggKTtcbiAgICAgIGl0ZW1DbGFzc2VzLm1hcChmdW5jdGlvbiAoY2xzKSB7IHJldHVybiBzbGlkZS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyBjbHMpKTsgfSk7XG4gICAgfSk7XG4gICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICB2YXJzID0ge307XG4gICAgb3BzID0ge307XG4gICAgZGVsZXRlIGVsZW1lbnQuQ2Fyb3VzZWw7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoIGVsZW1lbnQgKTtcbiAgZWxlbWVudC5DYXJvdXNlbCAmJiBlbGVtZW50LkNhcm91c2VsLmRpc3Bvc2UoKTtcbiAgc2xpZGVzID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1pdGVtJyk7XG4gIGxlZnRBcnJvdyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtY29udHJvbC1wcmV2JylbMF07XG4gIHJpZ2h0QXJyb3cgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWNvbnRyb2wtbmV4dCcpWzBdO1xuICBpbmRpY2F0b3IgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWluZGljYXRvcnMnKVswXTtcbiAgaW5kaWNhdG9ycyA9IGluZGljYXRvciAmJiBpbmRpY2F0b3IuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIFwiTElcIiApIHx8IFtdO1xuICBpZiAoc2xpZGVzLmxlbmd0aCA8IDIpIHsgcmV0dXJuIH1cbiAgdmFyXG4gICAgaW50ZXJ2YWxBdHRyaWJ1dGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnRlcnZhbCcpLFxuICAgIGludGVydmFsRGF0YSA9IGludGVydmFsQXR0cmlidXRlID09PSAnZmFsc2UnID8gMCA6IHBhcnNlSW50KGludGVydmFsQXR0cmlidXRlKSxcbiAgICB0b3VjaERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10b3VjaCcpID09PSAnZmFsc2UnID8gMCA6IDEsXG4gICAgcGF1c2VEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF1c2UnKSA9PT0gJ2hvdmVyJyB8fCBmYWxzZSxcbiAgICBrZXlib2FyZERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1rZXlib2FyZCcpID09PSAndHJ1ZScgfHwgZmFsc2UsXG4gICAgaW50ZXJ2YWxPcHRpb24gPSBvcHRpb25zLmludGVydmFsLFxuICAgIHRvdWNoT3B0aW9uID0gb3B0aW9ucy50b3VjaDtcbiAgb3BzID0ge307XG4gIG9wcy5rZXlib2FyZCA9IG9wdGlvbnMua2V5Ym9hcmQgPT09IHRydWUgfHwga2V5Ym9hcmREYXRhO1xuICBvcHMucGF1c2UgPSAob3B0aW9ucy5wYXVzZSA9PT0gJ2hvdmVyJyB8fCBwYXVzZURhdGEpID8gJ2hvdmVyJyA6IGZhbHNlO1xuICBvcHMudG91Y2ggPSB0b3VjaE9wdGlvbiB8fCB0b3VjaERhdGE7XG4gIG9wcy5pbnRlcnZhbCA9IHR5cGVvZiBpbnRlcnZhbE9wdGlvbiA9PT0gJ251bWJlcicgPyBpbnRlcnZhbE9wdGlvblxuICAgICAgICAgICAgICA6IGludGVydmFsT3B0aW9uID09PSBmYWxzZSB8fCBpbnRlcnZhbERhdGEgPT09IDAgfHwgaW50ZXJ2YWxEYXRhID09PSBmYWxzZSA/IDBcbiAgICAgICAgICAgICAgOiBpc05hTihpbnRlcnZhbERhdGEpID8gNTAwMFxuICAgICAgICAgICAgICA6IGludGVydmFsRGF0YTtcbiAgaWYgKHNlbGYuZ2V0QWN0aXZlSW5kZXgoKTwwKSB7XG4gICAgc2xpZGVzLmxlbmd0aCAmJiBzbGlkZXNbMF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgaW5kaWNhdG9ycy5sZW5ndGggJiYgc2V0QWN0aXZlUGFnZSgwKTtcbiAgfVxuICB2YXJzID0ge307XG4gIHZhcnMuZGlyZWN0aW9uID0gJ2xlZnQnO1xuICB2YXJzLmluZGV4ID0gMDtcbiAgdmFycy50aW1lciA9IG51bGw7XG4gIHZhcnMuaXNTbGlkaW5nID0gZmFsc2U7XG4gIHZhcnMuaXNUb3VjaCA9IGZhbHNlO1xuICB2YXJzLnRvdWNoUG9zaXRpb24gPSB7XG4gICAgc3RhcnRYIDogMCxcbiAgICBjdXJyZW50WCA6IDAsXG4gICAgZW5kWCA6IDBcbiAgfTtcbiAgdG9nZ2xlRXZlbnRzKDEpO1xuICBpZiAoIG9wcy5pbnRlcnZhbCApeyBzZWxmLmN5Y2xlKCk7IH1cbiAgZWxlbWVudC5DYXJvdXNlbCA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIENvbGxhcHNlKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgYWNjb3JkaW9uID0gbnVsbCxcbiAgICAgIGNvbGxhcHNlID0gbnVsbCxcbiAgICAgIGFjdGl2ZUNvbGxhcHNlLFxuICAgICAgYWN0aXZlRWxlbWVudCxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudDtcbiAgZnVuY3Rpb24gb3BlbkFjdGlvbihjb2xsYXBzZUVsZW1lbnQsIHRvZ2dsZSkge1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgY29sbGFwc2VFbGVtZW50LmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzZScpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29sbGFwc2VFbGVtZW50LnNjcm9sbEhlaWdodCkgKyBcInB4XCI7XG4gICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoY29sbGFwc2VFbGVtZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCd0cnVlJyk7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywndHJ1ZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNpbmcnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlQWN0aW9uKGNvbGxhcHNlRWxlbWVudCwgdG9nZ2xlKSB7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29sbGFwc2VFbGVtZW50LnNjcm9sbEhlaWdodCkgKyBcInB4XCI7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlJyk7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzBweCc7XG4gICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoY29sbGFwc2VFbGVtZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCdmYWxzZScpO1xuICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ2ZhbHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gICAgfSk7XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlICYmIGUudGFyZ2V0LnRhZ05hbWUgPT09ICdBJyB8fCBlbGVtZW50LnRhZ05hbWUgPT09ICdBJykge2UucHJldmVudERlZmF1bHQoKTt9XG4gICAgaWYgKGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpIHx8IGUudGFyZ2V0ID09PSBlbGVtZW50KSB7XG4gICAgICBpZiAoIWNvbGxhcHNlLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7IHNlbGYuc2hvdygpOyB9XG4gICAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgICB9XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIGNvbGxhcHNlLmlzQW5pbWF0aW5nICkgeyByZXR1cm47IH1cbiAgICBjbG9zZUFjdGlvbihjb2xsYXBzZSxlbGVtZW50KTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICB9O1xuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBhY2NvcmRpb24gKSB7XG4gICAgICBhY3RpdmVDb2xsYXBzZSA9IGFjY29yZGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY29sbGFwc2Ugc2hvd1wiKVswXTtcbiAgICAgIGFjdGl2ZUVsZW1lbnQgPSBhY3RpdmVDb2xsYXBzZSAmJiAocXVlcnlFbGVtZW50KChcIltkYXRhLXRhcmdldD1cXFwiI1wiICsgKGFjdGl2ZUNvbGxhcHNlLmlkKSArIFwiXFxcIl1cIiksYWNjb3JkaW9uKVxuICAgICAgICAgICAgICAgICAgICB8fCBxdWVyeUVsZW1lbnQoKFwiW2hyZWY9XFxcIiNcIiArIChhY3RpdmVDb2xsYXBzZS5pZCkgKyBcIlxcXCJdXCIpLGFjY29yZGlvbikgKTtcbiAgICB9XG4gICAgaWYgKCAhY29sbGFwc2UuaXNBbmltYXRpbmcgKSB7XG4gICAgICBpZiAoIGFjdGl2ZUVsZW1lbnQgJiYgYWN0aXZlQ29sbGFwc2UgIT09IGNvbGxhcHNlICkge1xuICAgICAgICBjbG9zZUFjdGlvbihhY3RpdmVDb2xsYXBzZSxhY3RpdmVFbGVtZW50KTtcbiAgICAgICAgYWN0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZWQnKTtcbiAgICAgIH1cbiAgICAgIG9wZW5BY3Rpb24oY29sbGFwc2UsZWxlbWVudCk7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlZCcpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYudG9nZ2xlLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5Db2xsYXBzZTtcbiAgfTtcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICAgIGVsZW1lbnQuQ29sbGFwc2UgJiYgZWxlbWVudC5Db2xsYXBzZS5kaXNwb3NlKCk7XG4gICAgdmFyIGFjY29yZGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQnKTtcbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdjb2xsYXBzZScpO1xuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAnY29sbGFwc2UnKTtcbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICdjb2xsYXBzZScpO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdjb2xsYXBzZScpO1xuICAgIGNvbGxhcHNlID0gcXVlcnlFbGVtZW50KG9wdGlvbnMudGFyZ2V0IHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuICAgIGNvbGxhcHNlLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgYWNjb3JkaW9uID0gZWxlbWVudC5jbG9zZXN0KG9wdGlvbnMucGFyZW50IHx8IGFjY29yZGlvbkRhdGEpO1xuICAgIGlmICggIWVsZW1lbnQuQ29sbGFwc2UgKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLnRvZ2dsZSxmYWxzZSk7XG4gICAgfVxuICAgIGVsZW1lbnQuQ29sbGFwc2UgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBzZXRGb2N1cyAoZWxlbWVudCl7XG4gIGVsZW1lbnQuZm9jdXMgPyBlbGVtZW50LmZvY3VzKCkgOiBlbGVtZW50LnNldEFjdGl2ZSgpO1xufVxuXG5mdW5jdGlvbiBEcm9wZG93bihlbGVtZW50LG9wdGlvbikge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbCxcbiAgICAgIHBhcmVudCwgbWVudSwgbWVudUl0ZW1zID0gW10sXG4gICAgICBwZXJzaXN0O1xuICBmdW5jdGlvbiBwcmV2ZW50RW1wdHlBbmNob3IoYW5jaG9yKSB7XG4gICAgKGFuY2hvci5ocmVmICYmIGFuY2hvci5ocmVmLnNsaWNlKC0xKSA9PT0gJyMnIHx8IGFuY2hvci5wYXJlbnROb2RlICYmIGFuY2hvci5wYXJlbnROb2RlLmhyZWZcbiAgICAgICYmIGFuY2hvci5wYXJlbnROb2RlLmhyZWYuc2xpY2UoLTEpID09PSAnIycpICYmIHRoaXMucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVEaXNtaXNzKCkge1xuICAgIHZhciBhY3Rpb24gPSBlbGVtZW50Lm9wZW4gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgnY2xpY2snLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdrZXlkb3duJyxwcmV2ZW50U2Nyb2xsLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdrZXl1cCcsa2V5SGFuZGxlcixmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgnZm9jdXMnLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBkaXNtaXNzSGFuZGxlcihlKSB7XG4gICAgdmFyIGV2ZW50VGFyZ2V0ID0gZS50YXJnZXQsXG4gICAgICAgICAgaGFzRGF0YSA9IGV2ZW50VGFyZ2V0ICYmIChldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgZXZlbnRUYXJnZXQucGFyZW50Tm9kZSAmJiBldmVudFRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBldmVudFRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKSk7XG4gICAgaWYgKCBlLnR5cGUgPT09ICdmb2N1cycgJiYgKGV2ZW50VGFyZ2V0ID09PSBlbGVtZW50IHx8IGV2ZW50VGFyZ2V0ID09PSBtZW51IHx8IG1lbnUuY29udGFpbnMoZXZlbnRUYXJnZXQpICkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICggKGV2ZW50VGFyZ2V0ID09PSBtZW51IHx8IG1lbnUuY29udGFpbnMoZXZlbnRUYXJnZXQpKSAmJiAocGVyc2lzdCB8fCBoYXNEYXRhKSApIHsgcmV0dXJuOyB9XG4gICAgZWxzZSB7XG4gICAgICByZWxhdGVkVGFyZ2V0ID0gZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQgfHwgZWxlbWVudC5jb250YWlucyhldmVudFRhcmdldCkgPyBlbGVtZW50IDogbnVsbDtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgICBwcmV2ZW50RW1wdHlBbmNob3IuY2FsbChlLGV2ZW50VGFyZ2V0KTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgIHNlbGYuc2hvdygpO1xuICAgIHByZXZlbnRFbXB0eUFuY2hvci5jYWxsKGUsZS50YXJnZXQpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRTY3JvbGwoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBpZigga2V5ID09PSAzOCB8fCBrZXkgPT09IDQwICkgeyBlLnByZXZlbnREZWZhdWx0KCk7IH1cbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKGUpIHtcbiAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGUsXG4gICAgICAgIGFjdGl2ZUl0ZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50LFxuICAgICAgICBpc1NhbWVFbGVtZW50ID0gYWN0aXZlSXRlbSA9PT0gZWxlbWVudCxcbiAgICAgICAgaXNJbnNpZGVNZW51ID0gbWVudS5jb250YWlucyhhY3RpdmVJdGVtKSxcbiAgICAgICAgaXNNZW51SXRlbSA9IGFjdGl2ZUl0ZW0ucGFyZW50Tm9kZSA9PT0gbWVudSB8fCBhY3RpdmVJdGVtLnBhcmVudE5vZGUucGFyZW50Tm9kZSA9PT0gbWVudSxcbiAgICAgICAgaWR4ID0gbWVudUl0ZW1zLmluZGV4T2YoYWN0aXZlSXRlbSk7XG4gICAgaWYgKCBpc01lbnVJdGVtICkge1xuICAgICAgaWR4ID0gaXNTYW1lRWxlbWVudCA/IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBrZXkgPT09IDM4ID8gKGlkeD4xP2lkeC0xOjApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5ID09PSA0MCA/IChpZHg8bWVudUl0ZW1zLmxlbmd0aC0xP2lkeCsxOmlkeCkgOiBpZHg7XG4gICAgICBtZW51SXRlbXNbaWR4XSAmJiBzZXRGb2N1cyhtZW51SXRlbXNbaWR4XSk7XG4gICAgfVxuICAgIGlmICggKG1lbnVJdGVtcy5sZW5ndGggJiYgaXNNZW51SXRlbVxuICAgICAgICAgIHx8ICFtZW51SXRlbXMubGVuZ3RoICYmIChpc0luc2lkZU1lbnUgfHwgaXNTYW1lRWxlbWVudClcbiAgICAgICAgICB8fCAhaXNJbnNpZGVNZW51IClcbiAgICAgICAgICAmJiBlbGVtZW50Lm9wZW4gJiYga2V5ID09PSAyN1xuICAgICkge1xuICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgIH1cbiAgfVxuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1lbnUuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIHBhcmVudC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLHRydWUpO1xuICAgIGVsZW1lbnQub3BlbiA9IHRydWU7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldEZvY3VzKCBtZW51LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdIHx8IGVsZW1lbnQgKTtcbiAgICAgIHRvZ2dsZURpc21pc3MoKTtcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCggJ3Nob3duJywgJ2Ryb3Bkb3duJywgcmVsYXRlZFRhcmdldCk7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgICB9LDEpO1xuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1lbnUuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIHBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLGZhbHNlKTtcbiAgICBlbGVtZW50Lm9wZW4gPSBmYWxzZTtcbiAgICB0b2dnbGVEaXNtaXNzKCk7XG4gICAgc2V0Rm9jdXMoZWxlbWVudCk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBlbGVtZW50LkRyb3Bkb3duICYmIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgfSwxKTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH07XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgZWxlbWVudC5vcGVuKSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgZWxzZSB7IHNlbGYuc2hvdygpOyB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmIGVsZW1lbnQub3BlbikgeyBzZWxmLmhpZGUoKTsgfVxuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgZGVsZXRlIGVsZW1lbnQuRHJvcGRvd247XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuRHJvcGRvd24gJiYgZWxlbWVudC5Ecm9wZG93bi5kaXNwb3NlKCk7XG4gIHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgbWVudSA9IHF1ZXJ5RWxlbWVudCgnLmRyb3Bkb3duLW1lbnUnLCBwYXJlbnQpO1xuICBBcnJheS5mcm9tKG1lbnUuY2hpbGRyZW4pLm1hcChmdW5jdGlvbiAoY2hpbGQpe1xuICAgIGNoaWxkLmNoaWxkcmVuLmxlbmd0aCAmJiAoY2hpbGQuY2hpbGRyZW5bMF0udGFnTmFtZSA9PT0gJ0EnICYmIG1lbnVJdGVtcy5wdXNoKGNoaWxkLmNoaWxkcmVuWzBdKSk7XG4gICAgY2hpbGQudGFnTmFtZSA9PT0gJ0EnICYmIG1lbnVJdGVtcy5wdXNoKGNoaWxkKTtcbiAgfSk7XG4gIGlmICggIWVsZW1lbnQuRHJvcGRvd24gKSB7XG4gICAgISgndGFiaW5kZXgnIGluIG1lbnUpICYmIG1lbnUuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBwZXJzaXN0ID0gb3B0aW9uID09PSB0cnVlIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBlcnNpc3QnKSA9PT0gJ3RydWUnIHx8IGZhbHNlO1xuICBlbGVtZW50Lm9wZW4gPSBmYWxzZTtcbiAgZWxlbWVudC5Ecm9wZG93biA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIE1vZGFsKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLCBtb2RhbCxcbiAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgc2hvd25DdXN0b21FdmVudCxcbiAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgcmVsYXRlZFRhcmdldCA9IG51bGwsXG4gICAgc2Nyb2xsQmFyV2lkdGgsXG4gICAgb3ZlcmxheSxcbiAgICBvdmVybGF5RGVsYXksXG4gICAgZml4ZWRJdGVtcyxcbiAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gc2V0U2Nyb2xsYmFyKCkge1xuICAgIHZhciBvcGVuTW9kYWwgPSBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygnbW9kYWwtb3BlbicpLFxuICAgICAgICBib2R5UGFkID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5wYWRkaW5nUmlnaHQpLFxuICAgICAgICBib2R5T3ZlcmZsb3cgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICE9PSBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCxcbiAgICAgICAgbW9kYWxPdmVyZmxvdyA9IG1vZGFsLmNsaWVudEhlaWdodCAhPT0gbW9kYWwuc2Nyb2xsSGVpZ2h0O1xuICAgIHNjcm9sbEJhcldpZHRoID0gbWVhc3VyZVNjcm9sbGJhcigpO1xuICAgIG1vZGFsLnN0eWxlLnBhZGRpbmdSaWdodCA9ICFtb2RhbE92ZXJmbG93ICYmIHNjcm9sbEJhcldpZHRoID8gKHNjcm9sbEJhcldpZHRoICsgXCJweFwiKSA6ICcnO1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gbW9kYWxPdmVyZmxvdyB8fCBib2R5T3ZlcmZsb3cgPyAoKGJvZHlQYWQgKyAob3Blbk1vZGFsID8gMDpzY3JvbGxCYXJXaWR0aCkpICsgXCJweFwiKSA6ICcnO1xuICAgIGZpeGVkSXRlbXMubGVuZ3RoICYmIGZpeGVkSXRlbXMubWFwKGZ1bmN0aW9uIChmaXhlZCl7XG4gICAgICB2YXIgaXRlbVBhZCA9IGdldENvbXB1dGVkU3R5bGUoZml4ZWQpLnBhZGRpbmdSaWdodDtcbiAgICAgIGZpeGVkLnN0eWxlLnBhZGRpbmdSaWdodCA9IG1vZGFsT3ZlcmZsb3cgfHwgYm9keU92ZXJmbG93ID8gKChwYXJzZUludChpdGVtUGFkKSArIChvcGVuTW9kYWw/MDpzY3JvbGxCYXJXaWR0aCkpICsgXCJweFwiKSA6ICgocGFyc2VJbnQoaXRlbVBhZCkpICsgXCJweFwiKTtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiByZXNldFNjcm9sbGJhcigpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIG1vZGFsLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIGZpeGVkSXRlbXMubGVuZ3RoICYmIGZpeGVkSXRlbXMubWFwKGZ1bmN0aW9uIChmaXhlZCl7XG4gICAgICBmaXhlZC5zdHlsZS5wYWRkaW5nUmlnaHQgPSAnJztcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBtZWFzdXJlU2Nyb2xsYmFyKCkge1xuICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwgd2lkdGhWYWx1ZTtcbiAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gJ21vZGFsLXNjcm9sbGJhci1tZWFzdXJlJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbERpdik7XG4gICAgd2lkdGhWYWx1ZSA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aDtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcm9sbERpdik7XG4gICAgcmV0dXJuIHdpZHRoVmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlT3ZlcmxheSgpIHtcbiAgICB2YXIgbmV3T3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy5tb2RhbC1iYWNrZHJvcCcpO1xuICAgIGlmICggb3ZlcmxheSA9PT0gbnVsbCApIHtcbiAgICAgIG5ld092ZXJsYXkuc2V0QXR0cmlidXRlKCdjbGFzcycsICdtb2RhbC1iYWNrZHJvcCcgKyAob3BzLmFuaW1hdGlvbiA/ICcgZmFkZScgOiAnJykpO1xuICAgICAgb3ZlcmxheSA9IG5ld092ZXJsYXk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXkpO1xuICAgIH1cbiAgICByZXR1cm4gb3ZlcmxheTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVPdmVybGF5ICgpIHtcbiAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcubW9kYWwtYmFja2Ryb3AnKTtcbiAgICBpZiAoIG92ZXJsYXkgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXSApIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3ZlcmxheSk7IG92ZXJsYXkgPSBudWxsO1xuICAgIH1cbiAgICBvdmVybGF5ID09PSBudWxsICYmIChkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLW9wZW4nKSwgcmVzZXRTY3JvbGxiYXIoKSk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYudXBkYXRlLCBwYXNzaXZlSGFuZGxlcik7XG4gICAgbW9kYWxbYWN0aW9uXSggJ2NsaWNrJyxkaXNtaXNzSGFuZGxlcixmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSggJ2tleWRvd24nLGtleUhhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGJlZm9yZVNob3coKSB7XG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgc2V0U2Nyb2xsYmFyKCk7XG4gICAgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXSAmJiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLW9wZW4nKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKG1vZGFsLCB0cmlnZ2VyU2hvdykgOiB0cmlnZ2VyU2hvdygpO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJTaG93KCkge1xuICAgIHNldEZvY3VzKG1vZGFsKTtcbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ21vZGFsJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VySGlkZShmb3JjZSkge1xuICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICBlbGVtZW50ICYmIChzZXRGb2N1cyhlbGVtZW50KSk7XG4gICAgb3ZlcmxheSA9IHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWJhY2tkcm9wJyk7XG4gICAgaWYgKGZvcmNlICE9PSAxICYmIG92ZXJsYXkgJiYgb3ZlcmxheS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdKSB7XG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKG92ZXJsYXkscmVtb3ZlT3ZlcmxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZU92ZXJsYXkoKTtcbiAgICB9XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAnbW9kYWwnKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGlmICggbW9kYWwuaXNBbmltYXRpbmcgKSB7IHJldHVybjsgfVxuICAgIHZhciBjbGlja1RhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICBtb2RhbElEID0gXCIjXCIgKyAobW9kYWwuZ2V0QXR0cmlidXRlKCdpZCcpKSxcbiAgICAgICAgdGFyZ2V0QXR0clZhbHVlID0gY2xpY2tUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGNsaWNrVGFyZ2V0LmdldEF0dHJpYnV0ZSgnaHJlZicpLFxuICAgICAgICBlbGVtQXR0clZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoICFtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKVxuICAgICAgICAmJiAoY2xpY2tUYXJnZXQgPT09IGVsZW1lbnQgJiYgdGFyZ2V0QXR0clZhbHVlID09PSBtb2RhbElEXG4gICAgICAgIHx8IGVsZW1lbnQuY29udGFpbnMoY2xpY2tUYXJnZXQpICYmIGVsZW1BdHRyVmFsdWUgPT09IG1vZGFsSUQpICkge1xuICAgICAgbW9kYWwubW9kYWxUcmlnZ2VyID0gZWxlbWVudDtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgICAgc2VsZi5zaG93KCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIocmVmKSB7XG4gICAgdmFyIHdoaWNoID0gcmVmLndoaWNoO1xuICAgIGlmICghbW9kYWwuaXNBbmltYXRpbmcgJiYgb3BzLmtleWJvYXJkICYmIHdoaWNoID09IDI3ICYmIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGRpc21pc3NIYW5kbGVyKGUpIHtcbiAgICBpZiAoIG1vZGFsLmlzQW5pbWF0aW5nICkgeyByZXR1cm47IH1cbiAgICB2YXIgY2xpY2tUYXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgaGFzRGF0YSA9IGNsaWNrVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kaXNtaXNzJykgPT09ICdtb2RhbCcsXG4gICAgICAgIHBhcmVudFdpdGhEYXRhID0gY2xpY2tUYXJnZXQuY2xvc2VzdCgnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJyk7XG4gICAgaWYgKCBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAoIHBhcmVudFdpdGhEYXRhIHx8IGhhc0RhdGFcbiAgICAgICAgfHwgY2xpY2tUYXJnZXQgPT09IG1vZGFsICYmIG9wcy5iYWNrZHJvcCAhPT0gJ3N0YXRpYycgKSApIHtcbiAgICAgIHNlbGYuaGlkZSgpOyByZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtzZWxmLmhpZGUoKTt9IGVsc2Uge3NlbGYuc2hvdygpO31cbiAgfTtcbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAhIW1vZGFsLmlzQW5pbWF0aW5nICkge3JldHVybn1cbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdtb2RhbCcsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRPcGVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdO1xuICAgIGlmIChjdXJyZW50T3BlbiAmJiBjdXJyZW50T3BlbiAhPT0gbW9kYWwpIHtcbiAgICAgIGN1cnJlbnRPcGVuLm1vZGFsVHJpZ2dlciAmJiBjdXJyZW50T3Blbi5tb2RhbFRyaWdnZXIuTW9kYWwuaGlkZSgpO1xuICAgICAgY3VycmVudE9wZW4uTW9kYWwgJiYgY3VycmVudE9wZW4uTW9kYWwuaGlkZSgpO1xuICAgIH1cbiAgICBpZiAoIG9wcy5iYWNrZHJvcCApIHtcbiAgICAgIG92ZXJsYXkgPSBjcmVhdGVPdmVybGF5KCk7XG4gICAgfVxuICAgIGlmICggb3ZlcmxheSAmJiAhY3VycmVudE9wZW4gJiYgIW92ZXJsYXkuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7XG4gICAgICBvdmVybGF5Lm9mZnNldFdpZHRoO1xuICAgICAgb3ZlcmxheURlbGF5ID0gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihvdmVybGF5KTtcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cbiAgICAhY3VycmVudE9wZW4gPyBzZXRUaW1lb3V0KCBiZWZvcmVTaG93LCBvdmVybGF5ICYmIG92ZXJsYXlEZWxheSA/IG92ZXJsYXlEZWxheTowICkgOiBiZWZvcmVTaG93KCk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uIChmb3JjZSkge1xuICAgIGlmICggIW1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge3JldHVybn1cbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCggJ2hpZGUnLCAnbW9kYWwnKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKCBoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgJiYgZm9yY2UgIT09IDEgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChtb2RhbCwgdHJpZ2dlckhpZGUpIDogdHJpZ2dlckhpZGUoKTtcbiAgfTtcbiAgc2VsZi5zZXRDb250ZW50ID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICBxdWVyeUVsZW1lbnQoJy5tb2RhbC1jb250ZW50Jyxtb2RhbCkuaW5uZXJIVE1MID0gY29udGVudDtcbiAgfTtcbiAgc2VsZi51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBzZXRTY3JvbGxiYXIoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLmhpZGUoMSk7XG4gICAgaWYgKGVsZW1lbnQpIHtlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpOyBkZWxldGUgZWxlbWVudC5Nb2RhbDsgfVxuICAgIGVsc2Uge2RlbGV0ZSBtb2RhbC5Nb2RhbDt9XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIHZhciBjaGVja01vZGFsID0gcXVlcnlFbGVtZW50KCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpICk7XG4gIG1vZGFsID0gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGFsJykgPyBlbGVtZW50IDogY2hlY2tNb2RhbDtcbiAgZml4ZWRJdGVtcyA9IEFycmF5LmZyb20oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZml4ZWQtdG9wJykpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaXhlZC1ib3R0b20nKSkpO1xuICBpZiAoIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2RhbCcpICkgeyBlbGVtZW50ID0gbnVsbDsgfVxuICBlbGVtZW50ICYmIGVsZW1lbnQuTW9kYWwgJiYgZWxlbWVudC5Nb2RhbC5kaXNwb3NlKCk7XG4gIG1vZGFsICYmIG1vZGFsLk1vZGFsICYmIG1vZGFsLk1vZGFsLmRpc3Bvc2UoKTtcbiAgb3BzLmtleWJvYXJkID0gb3B0aW9ucy5rZXlib2FyZCA9PT0gZmFsc2UgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWtleWJvYXJkJykgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG4gIG9wcy5iYWNrZHJvcCA9IG9wdGlvbnMuYmFja2Ryb3AgPT09ICdzdGF0aWMnIHx8IG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1iYWNrZHJvcCcpID09PSAnc3RhdGljJyA/ICdzdGF0aWMnIDogdHJ1ZTtcbiAgb3BzLmJhY2tkcm9wID0gb3B0aW9ucy5iYWNrZHJvcCA9PT0gZmFsc2UgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJhY2tkcm9wJykgPT09ICdmYWxzZScgPyBmYWxzZSA6IG9wcy5iYWNrZHJvcDtcbiAgb3BzLmFuaW1hdGlvbiA9IG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gdHJ1ZSA6IGZhbHNlO1xuICBvcHMuY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcbiAgbW9kYWwuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgaWYgKCBlbGVtZW50ICYmICFlbGVtZW50Lk1vZGFsICkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgaWYgKCBvcHMuY29udGVudCApIHtcbiAgICBzZWxmLnNldENvbnRlbnQoIG9wcy5jb250ZW50LnRyaW0oKSApO1xuICB9XG4gIGlmIChlbGVtZW50KSB7XG4gICAgbW9kYWwubW9kYWxUcmlnZ2VyID0gZWxlbWVudDtcbiAgICBlbGVtZW50Lk1vZGFsID0gc2VsZjtcbiAgfSBlbHNlIHtcbiAgICBtb2RhbC5Nb2RhbCA9IHNlbGY7XG4gIH1cbn1cblxudmFyIG1vdXNlQ2xpY2tFdmVudHMgPSB7IGRvd246ICdtb3VzZWRvd24nLCB1cDogJ21vdXNldXAnIH07XG5cbmZ1bmN0aW9uIGdldFNjcm9sbCgpIHtcbiAgcmV0dXJuIHtcbiAgICB5IDogd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AsXG4gICAgeCA6IHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdFxuICB9XG59XG5cbmZ1bmN0aW9uIHN0eWxlVGlwKGxpbmssZWxlbWVudCxwb3NpdGlvbixwYXJlbnQpIHtcbiAgdmFyIHRpcFBvc2l0aW9ucyA9IC9cXGIodG9wfGJvdHRvbXxsZWZ0fHJpZ2h0KSsvLFxuICAgICAgZWxlbWVudERpbWVuc2lvbnMgPSB7IHcgOiBlbGVtZW50Lm9mZnNldFdpZHRoLCBoOiBlbGVtZW50Lm9mZnNldEhlaWdodCB9LFxuICAgICAgd2luZG93V2lkdGggPSAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgpLFxuICAgICAgd2luZG93SGVpZ2h0ID0gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQpLFxuICAgICAgcmVjdCA9IGxpbmsuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBzY3JvbGwgPSBwYXJlbnQgPT09IGRvY3VtZW50LmJvZHkgPyBnZXRTY3JvbGwoKSA6IHsgeDogcGFyZW50Lm9mZnNldExlZnQgKyBwYXJlbnQuc2Nyb2xsTGVmdCwgeTogcGFyZW50Lm9mZnNldFRvcCArIHBhcmVudC5zY3JvbGxUb3AgfSxcbiAgICAgIGxpbmtEaW1lbnNpb25zID0geyB3OiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LCBoOiByZWN0LmJvdHRvbSAtIHJlY3QudG9wIH0sXG4gICAgICBpc1BvcG92ZXIgPSBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncG9wb3ZlcicpLFxuICAgICAgYXJyb3cgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Fycm93JylbMF0sXG4gICAgICBoYWxmVG9wRXhjZWVkID0gcmVjdC50b3AgKyBsaW5rRGltZW5zaW9ucy5oLzIgLSBlbGVtZW50RGltZW5zaW9ucy5oLzIgPCAwLFxuICAgICAgaGFsZkxlZnRFeGNlZWQgPSByZWN0LmxlZnQgKyBsaW5rRGltZW5zaW9ucy53LzIgLSBlbGVtZW50RGltZW5zaW9ucy53LzIgPCAwLFxuICAgICAgaGFsZlJpZ2h0RXhjZWVkID0gcmVjdC5sZWZ0ICsgZWxlbWVudERpbWVuc2lvbnMudy8yICsgbGlua0RpbWVuc2lvbnMudy8yID49IHdpbmRvd1dpZHRoLFxuICAgICAgaGFsZkJvdHRvbUV4Y2VlZCA9IHJlY3QudG9wICsgZWxlbWVudERpbWVuc2lvbnMuaC8yICsgbGlua0RpbWVuc2lvbnMuaC8yID49IHdpbmRvd0hlaWdodCxcbiAgICAgIHRvcEV4Y2VlZCA9IHJlY3QudG9wIC0gZWxlbWVudERpbWVuc2lvbnMuaCA8IDAsXG4gICAgICBsZWZ0RXhjZWVkID0gcmVjdC5sZWZ0IC0gZWxlbWVudERpbWVuc2lvbnMudyA8IDAsXG4gICAgICBib3R0b21FeGNlZWQgPSByZWN0LnRvcCArIGVsZW1lbnREaW1lbnNpb25zLmggKyBsaW5rRGltZW5zaW9ucy5oID49IHdpbmRvd0hlaWdodCxcbiAgICAgIHJpZ2h0RXhjZWVkID0gcmVjdC5sZWZ0ICsgZWxlbWVudERpbWVuc2lvbnMudyArIGxpbmtEaW1lbnNpb25zLncgPj0gd2luZG93V2lkdGg7XG4gIHBvc2l0aW9uID0gKHBvc2l0aW9uID09PSAnbGVmdCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcpICYmIGxlZnRFeGNlZWQgJiYgcmlnaHRFeGNlZWQgPyAndG9wJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAndG9wJyAmJiB0b3BFeGNlZWQgPyAnYm90dG9tJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBib3R0b21FeGNlZWQgPyAndG9wJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbGVmdEV4Y2VlZCA/ICdyaWdodCcgOiBwb3NpdGlvbjtcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiByaWdodEV4Y2VlZCA/ICdsZWZ0JyA6IHBvc2l0aW9uO1xuICB2YXIgdG9wUG9zaXRpb24sXG4gICAgbGVmdFBvc2l0aW9uLFxuICAgIGFycm93VG9wLFxuICAgIGFycm93TGVmdCxcbiAgICBhcnJvd1dpZHRoLFxuICAgIGFycm93SGVpZ2h0O1xuICBlbGVtZW50LmNsYXNzTmFtZS5pbmRleE9mKHBvc2l0aW9uKSA9PT0gLTEgJiYgKGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZSh0aXBQb3NpdGlvbnMscG9zaXRpb24pKTtcbiAgYXJyb3dXaWR0aCA9IGFycm93Lm9mZnNldFdpZHRoOyBhcnJvd0hlaWdodCA9IGFycm93Lm9mZnNldEhlaWdodDtcbiAgaWYgKCBwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnICkge1xuICAgIGlmICggcG9zaXRpb24gPT09ICdsZWZ0JyApIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3QubGVmdCArIHNjcm9sbC54IC0gZWxlbWVudERpbWVuc2lvbnMudyAtICggaXNQb3BvdmVyID8gYXJyb3dXaWR0aCA6IDAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdC5sZWZ0ICsgc2Nyb2xsLnggKyBsaW5rRGltZW5zaW9ucy53O1xuICAgIH1cbiAgICBpZiAoaGFsZlRvcEV4Y2VlZCkge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55O1xuICAgICAgYXJyb3dUb3AgPSBsaW5rRGltZW5zaW9ucy5oLzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSBpZiAoaGFsZkJvdHRvbUV4Y2VlZCkge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55IC0gZWxlbWVudERpbWVuc2lvbnMuaCArIGxpbmtEaW1lbnNpb25zLmg7XG4gICAgICBhcnJvd1RvcCA9IGVsZW1lbnREaW1lbnNpb25zLmggLSBsaW5rRGltZW5zaW9ucy5oLzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oLzIgKyBsaW5rRGltZW5zaW9ucy5oLzI7XG4gICAgICBhcnJvd1RvcCA9IGVsZW1lbnREaW1lbnNpb25zLmgvMiAtIChpc1BvcG92ZXIgPyBhcnJvd0hlaWdodCowLjkgOiBhcnJvd0hlaWdodC8yKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgKSB7XG4gICAgaWYgKCBwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gIHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oIC0gKCBpc1BvcG92ZXIgPyBhcnJvd0hlaWdodCA6IDAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55ICsgbGlua0RpbWVuc2lvbnMuaDtcbiAgICB9XG4gICAgaWYgKGhhbGZMZWZ0RXhjZWVkKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSAwO1xuICAgICAgYXJyb3dMZWZ0ID0gcmVjdC5sZWZ0ICsgbGlua0RpbWVuc2lvbnMudy8yIC0gYXJyb3dXaWR0aDtcbiAgICB9IGVsc2UgaWYgKGhhbGZSaWdodEV4Y2VlZCkge1xuICAgICAgbGVmdFBvc2l0aW9uID0gd2luZG93V2lkdGggLSBlbGVtZW50RGltZW5zaW9ucy53KjEuMDE7XG4gICAgICBhcnJvd0xlZnQgPSBlbGVtZW50RGltZW5zaW9ucy53IC0gKCB3aW5kb3dXaWR0aCAtIHJlY3QubGVmdCApICsgbGlua0RpbWVuc2lvbnMudy8yIC0gYXJyb3dXaWR0aC8yO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSByZWN0LmxlZnQgKyBzY3JvbGwueCAtIGVsZW1lbnREaW1lbnNpb25zLncvMiArIGxpbmtEaW1lbnNpb25zLncvMjtcbiAgICAgIGFycm93TGVmdCA9IGVsZW1lbnREaW1lbnNpb25zLncvMiAtICggaXNQb3BvdmVyID8gYXJyb3dXaWR0aCA6IGFycm93V2lkdGgvMiApO1xuICAgIH1cbiAgfVxuICBlbGVtZW50LnN0eWxlLnRvcCA9IHRvcFBvc2l0aW9uICsgJ3B4JztcbiAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbGVmdFBvc2l0aW9uICsgJ3B4JztcbiAgYXJyb3dUb3AgJiYgKGFycm93LnN0eWxlLnRvcCA9IGFycm93VG9wICsgJ3B4Jyk7XG4gIGFycm93TGVmdCAmJiAoYXJyb3cuc3R5bGUubGVmdCA9IGFycm93TGVmdCArICdweCcpO1xufVxuXG5mdW5jdGlvbiBQb3BvdmVyKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgcG9wb3ZlciA9IG51bGwsXG4gICAgICB0aW1lciA9IDAsXG4gICAgICBpc0lwaG9uZSA9IC8oaVBob25lfGlQb2R8aVBhZCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgICB0aXRsZVN0cmluZyxcbiAgICAgIGNvbnRlbnRTdHJpbmcsXG4gICAgICBvcHMgPSB7fTtcbiAgdmFyIHRyaWdnZXJEYXRhLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIHBsYWNlbWVudERhdGEsXG4gICAgICBkaXNtaXNzaWJsZURhdGEsXG4gICAgICBkZWxheURhdGEsXG4gICAgICBjb250YWluZXJEYXRhLFxuICAgICAgY2xvc2VCdG4sXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICBjb250YWluZXJFbGVtZW50LFxuICAgICAgY29udGFpbmVyRGF0YUVsZW1lbnQsXG4gICAgICBtb2RhbCxcbiAgICAgIG5hdmJhckZpeGVkVG9wLFxuICAgICAgbmF2YmFyRml4ZWRCb3R0b20sXG4gICAgICBwbGFjZW1lbnRDbGFzcztcbiAgZnVuY3Rpb24gZGlzbWlzc2libGVIYW5kbGVyKGUpIHtcbiAgICBpZiAocG9wb3ZlciAhPT0gbnVsbCAmJiBlLnRhcmdldCA9PT0gcXVlcnlFbGVtZW50KCcuY2xvc2UnLHBvcG92ZXIpKSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZ2V0Q29udGVudHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIDAgOiBvcHRpb25zLnRpdGxlIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJykgfHwgbnVsbCxcbiAgICAgIDEgOiBvcHRpb25zLmNvbnRlbnQgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGVudCcpIHx8IG51bGxcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlUG9wb3ZlcigpIHtcbiAgICBvcHMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHBvcG92ZXIpO1xuICAgIHRpbWVyID0gbnVsbDsgcG9wb3ZlciA9IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlUG9wb3ZlcigpIHtcbiAgICB0aXRsZVN0cmluZyA9IGdldENvbnRlbnRzKClbMF0gfHwgbnVsbDtcbiAgICBjb250ZW50U3RyaW5nID0gZ2V0Q29udGVudHMoKVsxXTtcbiAgICBjb250ZW50U3RyaW5nID0gISFjb250ZW50U3RyaW5nID8gY29udGVudFN0cmluZy50cmltKCkgOiBudWxsO1xuICAgIHBvcG92ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgcG9wb3ZlckFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcG9wb3ZlckFycm93LmNsYXNzTGlzdC5hZGQoJ2Fycm93Jyk7XG4gICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyQXJyb3cpO1xuICAgIGlmICggY29udGVudFN0cmluZyAhPT0gbnVsbCAmJiBvcHMudGVtcGxhdGUgPT09IG51bGwgKSB7XG4gICAgICBwb3BvdmVyLnNldEF0dHJpYnV0ZSgncm9sZScsJ3Rvb2x0aXAnKTtcbiAgICAgIGlmICh0aXRsZVN0cmluZyAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgcG9wb3ZlclRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgcG9wb3ZlclRpdGxlLmNsYXNzTGlzdC5hZGQoJ3BvcG92ZXItaGVhZGVyJyk7XG4gICAgICAgIHBvcG92ZXJUaXRsZS5pbm5lckhUTUwgPSBvcHMuZGlzbWlzc2libGUgPyB0aXRsZVN0cmluZyArIGNsb3NlQnRuIDogdGl0bGVTdHJpbmc7XG4gICAgICAgIHBvcG92ZXIuYXBwZW5kQ2hpbGQocG9wb3ZlclRpdGxlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwb3BvdmVyQm9keU1hcmt1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgcG9wb3ZlckJvZHlNYXJrdXAuY2xhc3NMaXN0LmFkZCgncG9wb3Zlci1ib2R5Jyk7XG4gICAgICBwb3BvdmVyQm9keU1hcmt1cC5pbm5lckhUTUwgPSBvcHMuZGlzbWlzc2libGUgJiYgdGl0bGVTdHJpbmcgPT09IG51bGwgPyBjb250ZW50U3RyaW5nICsgY2xvc2VCdG4gOiBjb250ZW50U3RyaW5nO1xuICAgICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyQm9keU1hcmt1cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwb3BvdmVyVGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHBvcG92ZXJUZW1wbGF0ZS5pbm5lckhUTUwgPSBvcHMudGVtcGxhdGUudHJpbSgpO1xuICAgICAgcG9wb3Zlci5jbGFzc05hbWUgPSBwb3BvdmVyVGVtcGxhdGUuZmlyc3RDaGlsZC5jbGFzc05hbWU7XG4gICAgICBwb3BvdmVyLmlubmVySFRNTCA9IHBvcG92ZXJUZW1wbGF0ZS5maXJzdENoaWxkLmlubmVySFRNTDtcbiAgICAgIHZhciBwb3BvdmVySGVhZGVyID0gcXVlcnlFbGVtZW50KCcucG9wb3Zlci1oZWFkZXInLHBvcG92ZXIpLFxuICAgICAgICAgIHBvcG92ZXJCb2R5ID0gcXVlcnlFbGVtZW50KCcucG9wb3Zlci1ib2R5Jyxwb3BvdmVyKTtcbiAgICAgIHRpdGxlU3RyaW5nICYmIHBvcG92ZXJIZWFkZXIgJiYgKHBvcG92ZXJIZWFkZXIuaW5uZXJIVE1MID0gdGl0bGVTdHJpbmcudHJpbSgpKTtcbiAgICAgIGNvbnRlbnRTdHJpbmcgJiYgcG9wb3ZlckJvZHkgJiYgKHBvcG92ZXJCb2R5LmlubmVySFRNTCA9IGNvbnRlbnRTdHJpbmcudHJpbSgpKTtcbiAgICB9XG4gICAgb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChwb3BvdmVyKTtcbiAgICBwb3BvdmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucyggJ3BvcG92ZXInKSAmJiBwb3BvdmVyLmNsYXNzTGlzdC5hZGQoJ3BvcG92ZXInKTtcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoIG9wcy5hbmltYXRpb24pICYmIHBvcG92ZXIuY2xhc3NMaXN0LmFkZChvcHMuYW5pbWF0aW9uKTtcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoIHBsYWNlbWVudENsYXNzKSAmJiBwb3BvdmVyLmNsYXNzTGlzdC5hZGQocGxhY2VtZW50Q2xhc3MpO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dQb3BvdmVyKCkge1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICggcG9wb3Zlci5jbGFzc0xpc3QuYWRkKCdzaG93JykgKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVQb3BvdmVyKCkge1xuICAgIHN0eWxlVGlwKGVsZW1lbnQsIHBvcG92ZXIsIG9wcy5wbGFjZW1lbnQsIG9wcy5jb250YWluZXIpO1xuICB9XG4gIGZ1bmN0aW9uIGZvcmNlRm9jdXMgKCkge1xuICAgIGlmIChwb3BvdmVyID09PSBudWxsKSB7IGVsZW1lbnQuZm9jdXMoKTsgfVxuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKG9wcy50cmlnZ2VyID09PSAnaG92ZXInKSB7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlQ2xpY2tFdmVudHMuZG93biwgc2VsZi5zaG93ICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMF0sIHNlbGYuc2hvdyApO1xuICAgICAgaWYgKCFvcHMuZGlzbWlzc2libGUpIHsgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzFdLCBzZWxmLmhpZGUgKTsgfVxuICAgIH0gZWxzZSBpZiAoJ2NsaWNrJyA9PSBvcHMudHJpZ2dlcikge1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBvcHMudHJpZ2dlciwgc2VsZi50b2dnbGUgKTtcbiAgICB9IGVsc2UgaWYgKCdmb2N1cycgPT0gb3BzLnRyaWdnZXIpIHtcbiAgICAgIGlzSXBob25lICYmIGVsZW1lbnRbYWN0aW9uXSggJ2NsaWNrJywgZm9yY2VGb2N1cywgZmFsc2UgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggb3BzLnRyaWdnZXIsIHNlbGYudG9nZ2xlICk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvdWNoSGFuZGxlcihlKXtcbiAgICBpZiAoIHBvcG92ZXIgJiYgcG9wb3Zlci5jb250YWlucyhlLnRhcmdldCkgfHwgZS50YXJnZXQgPT09IGVsZW1lbnQgfHwgZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkpIDsgZWxzZSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZGlzbWlzc0hhbmRsZXJUb2dnbGUoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGlmIChvcHMuZGlzbWlzc2libGUpIHtcbiAgICAgIGRvY3VtZW50W2FjdGlvbl0oJ2NsaWNrJywgZGlzbWlzc2libGVIYW5kbGVyLCBmYWxzZSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAnZm9jdXMnID09IG9wcy50cmlnZ2VyICYmIGVsZW1lbnRbYWN0aW9uXSggJ2JsdXInLCBzZWxmLmhpZGUgKTtcbiAgICAgICdob3ZlcicgPT0gb3BzLnRyaWdnZXIgJiYgZG9jdW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCB0b3VjaEhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgfVxuICAgIHdpbmRvd1thY3Rpb25dKCdyZXNpemUnLCBzZWxmLmhpZGUsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd1RyaWdnZXIoKSB7XG4gICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUoMSk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGhpZGVUcmlnZ2VyKCkge1xuICAgIGRpc21pc3NIYW5kbGVyVG9nZ2xlKCk7XG4gICAgcmVtb3ZlUG9wb3ZlcigpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHBvcG92ZXIgPT09IG51bGwpIHsgc2VsZi5zaG93KCk7IH1cbiAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgfTtcbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkge1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICAgIGNyZWF0ZVBvcG92ZXIoKTtcbiAgICAgICAgdXBkYXRlUG9wb3ZlcigpO1xuICAgICAgICBzaG93UG9wb3ZlcigpO1xuICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChwb3BvdmVyLCBzaG93VHJpZ2dlcikgOiBzaG93VHJpZ2dlcigpO1xuICAgICAgfVxuICAgIH0sIDIwICk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHBvcG92ZXIgJiYgcG9wb3ZlciAhPT0gbnVsbCAmJiBwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgICAgcG9wb3Zlci5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHBvcG92ZXIsIGhpZGVUcmlnZ2VyKSA6IGhpZGVUcmlnZ2VyKCk7XG4gICAgICB9XG4gICAgfSwgb3BzLmRlbGF5ICk7XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLmhpZGUoKTtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5Qb3BvdmVyO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlBvcG92ZXIgJiYgZWxlbWVudC5Qb3BvdmVyLmRpc3Bvc2UoKTtcbiAgdHJpZ2dlckRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10cmlnZ2VyJyk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlbWVudCcpO1xuICBkaXNtaXNzaWJsZURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kaXNtaXNzaWJsZScpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBjb250YWluZXJEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGFpbmVyJyk7XG4gIGNsb3NlQnRuID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIj7DlzwvYnV0dG9uPic7XG4gIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3BvcG92ZXInKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICdwb3BvdmVyJyk7XG4gIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ3BvcG92ZXInKTtcbiAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3BvcG92ZXInKTtcbiAgY29udGFpbmVyRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLmNvbnRhaW5lcik7XG4gIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpO1xuICBtb2RhbCA9IGVsZW1lbnQuY2xvc2VzdCgnLm1vZGFsJyk7XG4gIG5hdmJhckZpeGVkVG9wID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtdG9wJyk7XG4gIG5hdmJhckZpeGVkQm90dG9tID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtYm90dG9tJyk7XG4gIG9wcy50ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogbnVsbDtcbiAgb3BzLnRyaWdnZXIgPSBvcHRpb25zLnRyaWdnZXIgPyBvcHRpb25zLnRyaWdnZXIgOiB0cmlnZ2VyRGF0YSB8fCAnaG92ZXInO1xuICBvcHMuYW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRpb24gJiYgb3B0aW9ucy5hbmltYXRpb24gIT09ICdmYWRlJyA/IG9wdGlvbnMuYW5pbWF0aW9uIDogYW5pbWF0aW9uRGF0YSB8fCAnZmFkZSc7XG4gIG9wcy5wbGFjZW1lbnQgPSBvcHRpb25zLnBsYWNlbWVudCA/IG9wdGlvbnMucGxhY2VtZW50IDogcGxhY2VtZW50RGF0YSB8fCAndG9wJztcbiAgb3BzLmRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5kZWxheSB8fCBkZWxheURhdGEpIHx8IDIwMDtcbiAgb3BzLmRpc21pc3NpYmxlID0gb3B0aW9ucy5kaXNtaXNzaWJsZSB8fCBkaXNtaXNzaWJsZURhdGEgPT09ICd0cnVlJyA/IHRydWUgOiBmYWxzZTtcbiAgb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lckVsZW1lbnQgPyBjb250YWluZXJFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogY29udGFpbmVyRGF0YUVsZW1lbnQgPyBjb250YWluZXJEYXRhRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkVG9wID8gbmF2YmFyRml4ZWRUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZEJvdHRvbSA/IG5hdmJhckZpeGVkQm90dG9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbW9kYWwgPyBtb2RhbCA6IGRvY3VtZW50LmJvZHk7XG4gIHBsYWNlbWVudENsYXNzID0gXCJicy1wb3BvdmVyLVwiICsgKG9wcy5wbGFjZW1lbnQpO1xuICB2YXIgcG9wb3ZlckNvbnRlbnRzID0gZ2V0Q29udGVudHMoKTtcbiAgdGl0bGVTdHJpbmcgPSBwb3BvdmVyQ29udGVudHNbMF07XG4gIGNvbnRlbnRTdHJpbmcgPSBwb3BvdmVyQ29udGVudHNbMV07XG4gIGlmICggIWNvbnRlbnRTdHJpbmcgJiYgIW9wcy50ZW1wbGF0ZSApIHsgcmV0dXJuOyB9XG4gIGlmICggIWVsZW1lbnQuUG9wb3ZlciApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgZWxlbWVudC5Qb3BvdmVyID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gU2Nyb2xsU3B5KGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIHZhcnMsXG4gICAgdGFyZ2V0RGF0YSxcbiAgICBvZmZzZXREYXRhLFxuICAgIHNweVRhcmdldCxcbiAgICBzY3JvbGxUYXJnZXQsXG4gICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIHVwZGF0ZVRhcmdldHMoKXtcbiAgICB2YXIgbGlua3MgPSBzcHlUYXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0EnKTtcbiAgICBpZiAodmFycy5sZW5ndGggIT09IGxpbmtzLmxlbmd0aCkge1xuICAgICAgdmFycy5pdGVtcyA9IFtdO1xuICAgICAgdmFycy50YXJnZXRzID0gW107XG4gICAgICBBcnJheS5mcm9tKGxpbmtzKS5tYXAoZnVuY3Rpb24gKGxpbmspe1xuICAgICAgICB2YXIgaHJlZiA9IGxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJyksXG4gICAgICAgICAgdGFyZ2V0SXRlbSA9IGhyZWYgJiYgaHJlZi5jaGFyQXQoMCkgPT09ICcjJyAmJiBocmVmLnNsaWNlKC0xKSAhPT0gJyMnICYmIHF1ZXJ5RWxlbWVudChocmVmKTtcbiAgICAgICAgaWYgKCB0YXJnZXRJdGVtICkge1xuICAgICAgICAgIHZhcnMuaXRlbXMucHVzaChsaW5rKTtcbiAgICAgICAgICB2YXJzLnRhcmdldHMucHVzaCh0YXJnZXRJdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXJzLmxlbmd0aCA9IGxpbmtzLmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlSXRlbShpbmRleCkge1xuICAgIHZhciBpdGVtID0gdmFycy5pdGVtc1tpbmRleF0sXG4gICAgICB0YXJnZXRJdGVtID0gdmFycy50YXJnZXRzW2luZGV4XSxcbiAgICAgIGRyb3BtZW51ID0gaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duLWl0ZW0nKSAmJiBpdGVtLmNsb3Nlc3QoJy5kcm9wZG93bi1tZW51JyksXG4gICAgICBkcm9wTGluayA9IGRyb3BtZW51ICYmIGRyb3BtZW51LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsXG4gICAgICBuZXh0U2libGluZyA9IGl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nLFxuICAgICAgYWN0aXZlU2libGluZyA9IG5leHRTaWJsaW5nICYmIG5leHRTaWJsaW5nLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLmxlbmd0aCxcbiAgICAgIHRhcmdldFJlY3QgPSB2YXJzLmlzV2luZG93ICYmIHRhcmdldEl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBpc0FjdGl2ZSA9IGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSB8fCBmYWxzZSxcbiAgICAgIHRvcEVkZ2UgPSAodmFycy5pc1dpbmRvdyA/IHRhcmdldFJlY3QudG9wICsgdmFycy5zY3JvbGxPZmZzZXQgOiB0YXJnZXRJdGVtLm9mZnNldFRvcCkgLSBvcHMub2Zmc2V0LFxuICAgICAgYm90dG9tRWRnZSA9IHZhcnMuaXNXaW5kb3cgPyB0YXJnZXRSZWN0LmJvdHRvbSArIHZhcnMuc2Nyb2xsT2Zmc2V0IC0gb3BzLm9mZnNldFxuICAgICAgICAgICAgICAgICA6IHZhcnMudGFyZ2V0c1tpbmRleCsxXSA/IHZhcnMudGFyZ2V0c1tpbmRleCsxXS5vZmZzZXRUb3AgLSBvcHMub2Zmc2V0XG4gICAgICAgICAgICAgICAgIDogZWxlbWVudC5zY3JvbGxIZWlnaHQsXG4gICAgICBpbnNpZGUgPSBhY3RpdmVTaWJsaW5nIHx8IHZhcnMuc2Nyb2xsT2Zmc2V0ID49IHRvcEVkZ2UgJiYgYm90dG9tRWRnZSA+IHZhcnMuc2Nyb2xsT2Zmc2V0O1xuICAgICBpZiAoICFpc0FjdGl2ZSAmJiBpbnNpZGUgKSB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgaWYgKGRyb3BMaW5rICYmICFkcm9wTGluay5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICkge1xuICAgICAgICBkcm9wTGluay5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBib290c3RyYXBDdXN0b21FdmVudCggJ2FjdGl2YXRlJywgJ3Njcm9sbHNweScsIHZhcnMuaXRlbXNbaW5kZXhdKSk7XG4gICAgfSBlbHNlIGlmICggaXNBY3RpdmUgJiYgIWluc2lkZSApIHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICBpZiAoZHJvcExpbmsgJiYgZHJvcExpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSAmJiAhaXRlbS5wYXJlbnROb2RlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLmxlbmd0aCApIHtcbiAgICAgICAgZHJvcExpbmsuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICggaXNBY3RpdmUgJiYgaW5zaWRlIHx8ICFpbnNpZGUgJiYgIWlzQWN0aXZlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVJdGVtcygpIHtcbiAgICB1cGRhdGVUYXJnZXRzKCk7XG4gICAgdmFycy5zY3JvbGxPZmZzZXQgPSB2YXJzLmlzV2luZG93ID8gZ2V0U2Nyb2xsKCkueSA6IGVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgIHZhcnMuaXRlbXMubWFwKGZ1bmN0aW9uIChsLGlkeCl7IHJldHVybiB1cGRhdGVJdGVtKGlkeCk7IH0pO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgc2Nyb2xsVGFyZ2V0W2FjdGlvbl0oJ3Njcm9sbCcsIHNlbGYucmVmcmVzaCwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYucmVmcmVzaCwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBzZWxmLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdXBkYXRlSXRlbXMoKTtcbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlNjcm9sbFNweTtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5TY3JvbGxTcHkgJiYgZWxlbWVudC5TY3JvbGxTcHkuZGlzcG9zZSgpO1xuICB0YXJnZXREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0Jyk7XG4gIG9mZnNldERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vZmZzZXQnKTtcbiAgc3B5VGFyZ2V0ID0gcXVlcnlFbGVtZW50KG9wdGlvbnMudGFyZ2V0IHx8IHRhcmdldERhdGEpO1xuICBzY3JvbGxUYXJnZXQgPSBlbGVtZW50Lm9mZnNldEhlaWdodCA8IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID8gZWxlbWVudCA6IHdpbmRvdztcbiAgaWYgKCFzcHlUYXJnZXQpIHsgcmV0dXJuIH1cbiAgb3BzLnRhcmdldCA9IHNweVRhcmdldDtcbiAgb3BzLm9mZnNldCA9IHBhcnNlSW50KG9wdGlvbnMub2Zmc2V0IHx8IG9mZnNldERhdGEpIHx8IDEwO1xuICB2YXJzID0ge307XG4gIHZhcnMubGVuZ3RoID0gMDtcbiAgdmFycy5pdGVtcyA9IFtdO1xuICB2YXJzLnRhcmdldHMgPSBbXTtcbiAgdmFycy5pc1dpbmRvdyA9IHNjcm9sbFRhcmdldCA9PT0gd2luZG93O1xuICBpZiAoICFlbGVtZW50LlNjcm9sbFNweSApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgc2VsZi5yZWZyZXNoKCk7XG4gIGVsZW1lbnQuU2Nyb2xsU3B5ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVGFiKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGhlaWdodERhdGEsXG4gICAgdGFicywgZHJvcGRvd24sXG4gICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgIG5leHQsXG4gICAgdGFic0NvbnRlbnRDb250YWluZXIgPSBmYWxzZSxcbiAgICBhY3RpdmVUYWIsXG4gICAgYWN0aXZlQ29udGVudCxcbiAgICBuZXh0Q29udGVudCxcbiAgICBjb250YWluZXJIZWlnaHQsXG4gICAgZXF1YWxDb250ZW50cyxcbiAgICBuZXh0SGVpZ2h0LFxuICAgIGFuaW1hdGVIZWlnaHQ7XG4gIGZ1bmN0aW9uIHRyaWdnZXJFbmQoKSB7XG4gICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgdGFic0NvbnRlbnRDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VyU2hvdygpIHtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIGlmICggZXF1YWxDb250ZW50cyApIHtcbiAgICAgICAgdHJpZ2dlckVuZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gbmV4dEhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICB0YWJzQ29udGVudENvbnRhaW5lci5vZmZzZXRXaWR0aDtcbiAgICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0YWJzQ29udGVudENvbnRhaW5lciwgdHJpZ2dlckVuZCk7XG4gICAgICAgIH0sNTApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0YWJzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgfVxuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAndGFiJywgYWN0aXZlVGFiKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobmV4dCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJpZ2dlckhpZGUoKSB7XG4gICAgaWYgKHRhYnNDb250ZW50Q29udGFpbmVyKSB7XG4gICAgICBhY3RpdmVDb250ZW50LnN0eWxlLmZsb2F0ID0gJ2xlZnQnO1xuICAgICAgbmV4dENvbnRlbnQuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XG4gICAgICBjb250YWluZXJIZWlnaHQgPSBhY3RpdmVDb250ZW50LnNjcm9sbEhlaWdodDtcbiAgICB9XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndGFiJywgYWN0aXZlVGFiKTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndGFiJywgbmV4dCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG5leHQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbmV4dENvbnRlbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIG5leHRIZWlnaHQgPSBuZXh0Q29udGVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICBlcXVhbENvbnRlbnRzID0gbmV4dEhlaWdodCA9PT0gY29udGFpbmVySGVpZ2h0O1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0ICsgXCJweFwiO1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgYWN0aXZlQ29udGVudC5zdHlsZS5mbG9hdCA9ICcnO1xuICAgICAgbmV4dENvbnRlbnQuc3R5bGUuZmxvYXQgPSAnJztcbiAgICB9XG4gICAgaWYgKCBuZXh0Q29udGVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSApIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBuZXh0Q29udGVudC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKG5leHRDb250ZW50LHRyaWdnZXJTaG93KTtcbiAgICAgIH0sMjApO1xuICAgIH0gZWxzZSB7IHRyaWdnZXJTaG93KCk7IH1cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoYWN0aXZlVGFiLCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKCkge1xuICAgIHZhciBhY3RpdmVUYWJzID0gdGFicy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKSwgYWN0aXZlVGFiO1xuICAgIGlmICggYWN0aXZlVGFicy5sZW5ndGggPT09IDEgJiYgIWFjdGl2ZVRhYnNbMF0ucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duJykgKSB7XG4gICAgICBhY3RpdmVUYWIgPSBhY3RpdmVUYWJzWzBdO1xuICAgIH0gZWxzZSBpZiAoIGFjdGl2ZVRhYnMubGVuZ3RoID4gMSApIHtcbiAgICAgIGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbYWN0aXZlVGFicy5sZW5ndGgtMV07XG4gICAgfVxuICAgIHJldHVybiBhY3RpdmVUYWI7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlQ29udGVudCgpIHsgcmV0dXJuIHF1ZXJ5RWxlbWVudChnZXRBY3RpdmVUYWIoKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBuZXh0ID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICF0YWJzLmlzQW5pbWF0aW5nICYmIHNlbGYuc2hvdygpO1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBuZXh0ID0gbmV4dCB8fCBlbGVtZW50O1xuICAgIGlmICghbmV4dC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgICBuZXh0Q29udGVudCA9IHF1ZXJ5RWxlbWVudChuZXh0LmdldEF0dHJpYnV0ZSgnaHJlZicpKTtcbiAgICAgIGFjdGl2ZVRhYiA9IGdldEFjdGl2ZVRhYigpO1xuICAgICAgYWN0aXZlQ29udGVudCA9IGdldEFjdGl2ZUNvbnRlbnQoKTtcbiAgICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnaGlkZScsICd0YWInLCBuZXh0KTtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhY3RpdmVUYWIsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgICBpZiAoaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICB0YWJzLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgIGFjdGl2ZVRhYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIGFjdGl2ZVRhYi5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCdmYWxzZScpO1xuICAgICAgbmV4dC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIG5leHQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywndHJ1ZScpO1xuICAgICAgaWYgKCBkcm9wZG93biApIHtcbiAgICAgICAgaWYgKCAhZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24tbWVudScpICkge1xuICAgICAgICAgIGlmIChkcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7IGRyb3Bkb3duLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpOyB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFkcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7IGRyb3Bkb3duLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChhY3RpdmVDb250ZW50LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpKSB7XG4gICAgICAgIGFjdGl2ZUNvbnRlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChhY3RpdmVDb250ZW50LCB0cmlnZ2VySGlkZSk7XG4gICAgICB9IGVsc2UgeyB0cmlnZ2VySGlkZSgpOyB9XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5UYWI7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuVGFiICYmIGVsZW1lbnQuVGFiLmRpc3Bvc2UoKTtcbiAgaGVpZ2h0RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpO1xuICB0YWJzID0gZWxlbWVudC5jbG9zZXN0KCcubmF2Jyk7XG4gIGRyb3Bkb3duID0gdGFicyAmJiBxdWVyeUVsZW1lbnQoJy5kcm9wZG93bi10b2dnbGUnLHRhYnMpO1xuICBhbmltYXRlSGVpZ2h0ID0gIXN1cHBvcnRUcmFuc2l0aW9uIHx8IChvcHRpb25zLmhlaWdodCA9PT0gZmFsc2UgfHwgaGVpZ2h0RGF0YSA9PT0gJ2ZhbHNlJykgPyBmYWxzZSA6IHRydWU7XG4gIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgaWYgKCAhZWxlbWVudC5UYWIgKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBpZiAoYW5pbWF0ZUhlaWdodCkgeyB0YWJzQ29udGVudENvbnRhaW5lciA9IGdldEFjdGl2ZUNvbnRlbnQoKS5wYXJlbnROb2RlOyB9XG4gIGVsZW1lbnQuVGFiID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVG9hc3QoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB0b2FzdCwgdGltZXIgPSAwLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIGF1dG9oaWRlRGF0YSxcbiAgICAgIGRlbGF5RGF0YSxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIG9wcyA9IHt9O1xuICBmdW5jdGlvbiBzaG93Q29tcGxldGUoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSggJ3Nob3dpbmcnICk7XG4gICAgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ3Nob3cnICk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIGlmIChvcHMuYXV0b2hpZGUpIHsgc2VsZi5oaWRlKCk7IH1cbiAgfVxuICBmdW5jdGlvbiBoaWRlQ29tcGxldGUoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ2hpZGUnICk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZSAoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycgKTtcbiAgICBvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9hc3QsIGhpZGVDb21wbGV0ZSkgOiBoaWRlQ29tcGxldGUoKTtcbiAgfVxuICBmdW5jdGlvbiBkaXNwb3NlQ29tcGxldGUoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLmhpZGUsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlRvYXN0O1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodG9hc3QgJiYgIXRvYXN0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3Qsc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgIGlmIChzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIG9wcy5hbmltYXRpb24gJiYgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ2ZhZGUnICk7XG4gICAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyApO1xuICAgICAgdG9hc3Qub2Zmc2V0V2lkdGg7XG4gICAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93aW5nJyApO1xuICAgICAgb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvYXN0LCBzaG93Q29tcGxldGUpIDogc2hvd0NvbXBsZXRlKCk7XG4gICAgfVxuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAobm9UaW1lcikge1xuICAgIGlmICh0b2FzdCAmJiB0b2FzdC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkge1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LGhpZGVDdXN0b21FdmVudCk7XG4gICAgICBpZihoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIG5vVGltZXIgPyBjbG9zZSgpIDogKHRpbWVyID0gc2V0VGltZW91dCggY2xvc2UsIG9wcy5kZWxheSkpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIG9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b2FzdCwgZGlzcG9zZUNvbXBsZXRlKSA6IGRpc3Bvc2VDb21wbGV0ZSgpO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlRvYXN0ICYmIGVsZW1lbnQuVG9hc3QuZGlzcG9zZSgpO1xuICB0b2FzdCA9IGVsZW1lbnQuY2xvc2VzdCgnLnRvYXN0Jyk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgYXV0b2hpZGVEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYXV0b2hpZGUnKTtcbiAgZGVsYXlEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVsYXknKTtcbiAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndG9hc3QnKTtcbiAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAndG9hc3QnKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0b2FzdCcpO1xuICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndG9hc3QnKTtcbiAgb3BzLmFuaW1hdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uID09PSBmYWxzZSB8fCBhbmltYXRpb25EYXRhID09PSAnZmFsc2UnID8gMCA6IDE7XG4gIG9wcy5hdXRvaGlkZSA9IG9wdGlvbnMuYXV0b2hpZGUgPT09IGZhbHNlIHx8IGF1dG9oaWRlRGF0YSA9PT0gJ2ZhbHNlJyA/IDAgOiAxO1xuICBvcHMuZGVsYXkgPSBwYXJzZUludChvcHRpb25zLmRlbGF5IHx8IGRlbGF5RGF0YSkgfHwgNTAwO1xuICBpZiAoICFlbGVtZW50LlRvYXN0ICkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYuaGlkZSxmYWxzZSk7XG4gIH1cbiAgZWxlbWVudC5Ub2FzdCA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIFRvb2x0aXAoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB0b29sdGlwID0gbnVsbCwgdGltZXIgPSAwLCB0aXRsZVN0cmluZyxcbiAgICAgIGFuaW1hdGlvbkRhdGEsXG4gICAgICBwbGFjZW1lbnREYXRhLFxuICAgICAgZGVsYXlEYXRhLFxuICAgICAgY29udGFpbmVyRGF0YSxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIGNvbnRhaW5lckVsZW1lbnQsXG4gICAgICBjb250YWluZXJEYXRhRWxlbWVudCxcbiAgICAgIG1vZGFsLFxuICAgICAgbmF2YmFyRml4ZWRUb3AsXG4gICAgICBuYXZiYXJGaXhlZEJvdHRvbSxcbiAgICAgIHBsYWNlbWVudENsYXNzLFxuICAgICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZSgndGl0bGUnKVxuICAgICAgICB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpXG4gICAgICAgIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJylcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVUb29sVGlwKCkge1xuICAgIG9wcy5jb250YWluZXIucmVtb3ZlQ2hpbGQodG9vbHRpcCk7XG4gICAgdG9vbHRpcCA9IG51bGw7IHRpbWVyID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb29sVGlwKCkge1xuICAgIHRpdGxlU3RyaW5nID0gZ2V0VGl0bGUoKTtcbiAgICBpZiAoIHRpdGxlU3RyaW5nICkge1xuICAgICAgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgaWYgKG9wcy50ZW1wbGF0ZSkge1xuICAgICAgICB2YXIgdG9vbHRpcE1hcmt1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b29sdGlwTWFya3VwLmlubmVySFRNTCA9IG9wcy50ZW1wbGF0ZS50cmltKCk7XG4gICAgICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gdG9vbHRpcE1hcmt1cC5maXJzdENoaWxkLmNsYXNzTmFtZTtcbiAgICAgICAgdG9vbHRpcC5pbm5lckhUTUwgPSB0b29sdGlwTWFya3VwLmZpcnN0Q2hpbGQuaW5uZXJIVE1MO1xuICAgICAgICBxdWVyeUVsZW1lbnQoJy50b29sdGlwLWlubmVyJyx0b29sdGlwKS5pbm5lckhUTUwgPSB0aXRsZVN0cmluZy50cmltKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdG9vbHRpcEFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2x0aXBBcnJvdy5jbGFzc0xpc3QuYWRkKCdhcnJvdycpO1xuICAgICAgICB0b29sdGlwLmFwcGVuZENoaWxkKHRvb2x0aXBBcnJvdyk7XG4gICAgICAgIHZhciB0b29sdGlwSW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbHRpcElubmVyLmNsYXNzTGlzdC5hZGQoJ3Rvb2x0aXAtaW5uZXInKTtcbiAgICAgICAgdG9vbHRpcC5hcHBlbmRDaGlsZCh0b29sdGlwSW5uZXIpO1xuICAgICAgICB0b29sdGlwSW5uZXIuaW5uZXJIVE1MID0gdGl0bGVTdHJpbmc7XG4gICAgICB9XG4gICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgICB0b29sdGlwLnN0eWxlLnRvcCA9ICcwJztcbiAgICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywndG9vbHRpcCcpO1xuICAgICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKCd0b29sdGlwJykgJiYgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCd0b29sdGlwJyk7XG4gICAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMob3BzLmFuaW1hdGlvbikgJiYgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKG9wcy5hbmltYXRpb24pO1xuICAgICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKHBsYWNlbWVudENsYXNzKSAmJiB0b29sdGlwLmNsYXNzTGlzdC5hZGQocGxhY2VtZW50Q2xhc3MpO1xuICAgICAgb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0b29sdGlwKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlVG9vbHRpcCgpIHtcbiAgICBzdHlsZVRpcChlbGVtZW50LCB0b29sdGlwLCBvcHMucGxhY2VtZW50LCBvcHMuY29udGFpbmVyKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93VG9vbHRpcCgpIHtcbiAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAoIHRvb2x0aXAuY2xhc3NMaXN0LmFkZCgnc2hvdycpICk7XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hIYW5kbGVyKGUpe1xuICAgIGlmICggdG9vbHRpcCAmJiB0b29sdGlwLmNvbnRhaW5zKGUudGFyZ2V0KSB8fCBlLnRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSkgOyBlbHNlIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVBY3Rpb24oYWN0aW9uKXtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCB0b3VjaEhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgd2luZG93W2FjdGlvbl0oICdyZXNpemUnLCBzZWxmLmhpZGUsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd0FjdGlvbigpIHtcbiAgICB0b2dnbGVBY3Rpb24oMSk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGhpZGVBY3Rpb24oKSB7XG4gICAgdG9nZ2xlQWN0aW9uKCk7XG4gICAgcmVtb3ZlVG9vbFRpcCgpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0obW91c2VDbGlja0V2ZW50cy5kb3duLCBzZWxmLnNob3csZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUhvdmVyRXZlbnRzWzBdLCBzZWxmLnNob3csZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUhvdmVyRXZlbnRzWzFdLCBzZWxmLmhpZGUsZmFsc2UpO1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRvb2x0aXAgPT09IG51bGwpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgICAgIGlmIChzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgICAgaWYoY3JlYXRlVG9vbFRpcCgpICE9PSBmYWxzZSkge1xuICAgICAgICAgIHVwZGF0ZVRvb2x0aXAoKTtcbiAgICAgICAgICBzaG93VG9vbHRpcCgpO1xuICAgICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvb2x0aXAsIHNob3dBY3Rpb24pIDogc2hvd0FjdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgMjAgKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodG9vbHRpcCAmJiB0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b29sdGlwLCBoaWRlQWN0aW9uKSA6IGhpZGVBY3Rpb24oKTtcbiAgICAgIH1cbiAgICB9LCBvcHMuZGVsYXkpO1xuICB9O1xuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRvb2x0aXApIHsgc2VsZi5zaG93KCk7IH1cbiAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIHNlbGYuaGlkZSgpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0aXRsZScsIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykpO1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJyk7XG4gICAgZGVsZXRlIGVsZW1lbnQuVG9vbHRpcDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5Ub29sdGlwICYmIGVsZW1lbnQuVG9vbHRpcC5kaXNwb3NlKCk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlbWVudCcpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBjb250YWluZXJEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGFpbmVyJyk7XG4gIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3Rvb2x0aXAnKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0b29sdGlwJyk7XG4gIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ3Rvb2x0aXAnKTtcbiAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3Rvb2x0aXAnKTtcbiAgY29udGFpbmVyRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLmNvbnRhaW5lcik7XG4gIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpO1xuICBtb2RhbCA9IGVsZW1lbnQuY2xvc2VzdCgnLm1vZGFsJyk7XG4gIG5hdmJhckZpeGVkVG9wID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtdG9wJyk7XG4gIG5hdmJhckZpeGVkQm90dG9tID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtYm90dG9tJyk7XG4gIG9wcy5hbmltYXRpb24gPSBvcHRpb25zLmFuaW1hdGlvbiAmJiBvcHRpb25zLmFuaW1hdGlvbiAhPT0gJ2ZhZGUnID8gb3B0aW9ucy5hbmltYXRpb24gOiBhbmltYXRpb25EYXRhIHx8ICdmYWRlJztcbiAgb3BzLnBsYWNlbWVudCA9IG9wdGlvbnMucGxhY2VtZW50ID8gb3B0aW9ucy5wbGFjZW1lbnQgOiBwbGFjZW1lbnREYXRhIHx8ICd0b3AnO1xuICBvcHMudGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlID8gb3B0aW9ucy50ZW1wbGF0ZSA6IG51bGw7XG4gIG9wcy5kZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuZGVsYXkgfHwgZGVsYXlEYXRhKSB8fCAyMDA7XG4gIG9wcy5jb250YWluZXIgPSBjb250YWluZXJFbGVtZW50ID8gY29udGFpbmVyRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGNvbnRhaW5lckRhdGFFbGVtZW50ID8gY29udGFpbmVyRGF0YUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZFRvcCA/IG5hdmJhckZpeGVkVG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRCb3R0b20gPyBuYXZiYXJGaXhlZEJvdHRvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG1vZGFsID8gbW9kYWwgOiBkb2N1bWVudC5ib2R5O1xuICBwbGFjZW1lbnRDbGFzcyA9IFwiYnMtdG9vbHRpcC1cIiArIChvcHMucGxhY2VtZW50KTtcbiAgdGl0bGVTdHJpbmcgPSBnZXRUaXRsZSgpO1xuICBpZiAoICF0aXRsZVN0cmluZyApIHsgcmV0dXJuOyB9XG4gIGlmICghZWxlbWVudC5Ub29sdGlwKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLHRpdGxlU3RyaW5nKTtcbiAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKTtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgZWxlbWVudC5Ub29sdGlwID0gc2VsZjtcbn1cblxudmFyIGNvbXBvbmVudHNJbml0ID0ge307XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVEYXRhQVBJKCBDb25zdHJ1Y3RvciwgY29sbGVjdGlvbiApe1xuICBBcnJheS5mcm9tKGNvbGxlY3Rpb24pLm1hcChmdW5jdGlvbiAoeCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IoeCk7IH0pO1xufVxuZnVuY3Rpb24gaW5pdENhbGxiYWNrKGxvb2tVcCl7XG4gIGxvb2tVcCA9IGxvb2tVcCB8fCBkb2N1bWVudDtcbiAgZm9yICh2YXIgY29tcG9uZW50IGluIGNvbXBvbmVudHNJbml0KSB7XG4gICAgaW5pdGlhbGl6ZURhdGFBUEkoIGNvbXBvbmVudHNJbml0W2NvbXBvbmVudF1bMF0sIGxvb2tVcC5xdWVyeVNlbGVjdG9yQWxsIChjb21wb25lbnRzSW5pdFtjb21wb25lbnRdWzFdKSApO1xuICB9XG59XG5cbmNvbXBvbmVudHNJbml0LkFsZXJ0ID0gWyBBbGVydCwgJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXSddO1xuY29tcG9uZW50c0luaXQuQnV0dG9uID0gWyBCdXR0b24sICdbZGF0YS10b2dnbGU9XCJidXR0b25zXCJdJyBdO1xuY29tcG9uZW50c0luaXQuQ2Fyb3VzZWwgPSBbIENhcm91c2VsLCAnW2RhdGEtcmlkZT1cImNhcm91c2VsXCJdJyBdO1xuY29tcG9uZW50c0luaXQuQ29sbGFwc2UgPSBbIENvbGxhcHNlLCAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Ecm9wZG93biA9IFsgRHJvcGRvd24sICdbZGF0YS10b2dnbGU9XCJkcm9wZG93blwiXSddO1xuY29tcG9uZW50c0luaXQuTW9kYWwgPSBbIE1vZGFsLCAnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Qb3BvdmVyID0gWyBQb3BvdmVyLCAnW2RhdGEtdG9nZ2xlPVwicG9wb3ZlclwiXSxbZGF0YS10aXA9XCJwb3BvdmVyXCJdJyBdO1xuY29tcG9uZW50c0luaXQuU2Nyb2xsU3B5ID0gWyBTY3JvbGxTcHksICdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5UYWIgPSBbIFRhYiwgJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRvYXN0ID0gWyBUb2FzdCwgJ1tkYXRhLWRpc21pc3M9XCJ0b2FzdFwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRvb2x0aXAgPSBbIFRvb2x0aXAsICdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdLFtkYXRhLXRpcD1cInRvb2x0aXBcIl0nIF07XG5kb2N1bWVudC5ib2R5ID8gaW5pdENhbGxiYWNrKCkgOiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIGluaXRXcmFwcGVyKCl7XG5cdGluaXRDYWxsYmFjaygpO1xuXHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJyxpbml0V3JhcHBlcixmYWxzZSk7XG59LCBmYWxzZSApO1xuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50RGF0YUFQSSggQ29uc3RydWN0b3JOYW1lLCBjb2xsZWN0aW9uICl7XG4gIEFycmF5LmZyb20oY29sbGVjdGlvbikubWFwKGZ1bmN0aW9uICh4KXsgcmV0dXJuIHhbQ29uc3RydWN0b3JOYW1lXS5kaXNwb3NlKCk7IH0pO1xufVxuZnVuY3Rpb24gcmVtb3ZlRGF0YUFQSShsb29rVXApIHtcbiAgbG9va1VwID0gbG9va1VwIHx8IGRvY3VtZW50O1xuICBmb3IgKHZhciBjb21wb25lbnQgaW4gY29tcG9uZW50c0luaXQpIHtcbiAgICByZW1vdmVFbGVtZW50RGF0YUFQSSggY29tcG9uZW50LCBsb29rVXAucXVlcnlTZWxlY3RvckFsbCAoY29tcG9uZW50c0luaXRbY29tcG9uZW50XVsxXSkgKTtcbiAgfVxufVxuXG52YXIgdmVyc2lvbiA9IFwiMy4wLjlcIjtcblxudmFyIGluZGV4ID0ge1xuICBBbGVydDogQWxlcnQsXG4gIEJ1dHRvbjogQnV0dG9uLFxuICBDYXJvdXNlbDogQ2Fyb3VzZWwsXG4gIENvbGxhcHNlOiBDb2xsYXBzZSxcbiAgRHJvcGRvd246IERyb3Bkb3duLFxuICBNb2RhbDogTW9kYWwsXG4gIFBvcG92ZXI6IFBvcG92ZXIsXG4gIFNjcm9sbFNweTogU2Nyb2xsU3B5LFxuICBUYWI6IFRhYixcbiAgVG9hc3Q6IFRvYXN0LFxuICBUb29sdGlwOiBUb29sdGlwLFxuICBpbml0Q2FsbGJhY2s6IGluaXRDYWxsYmFjayxcbiAgcmVtb3ZlRGF0YUFQSTogcmVtb3ZlRGF0YUFQSSxcbiAgY29tcG9uZW50c0luaXQ6IGNvbXBvbmVudHNJbml0LFxuICBWZXJzaW9uOiB2ZXJzaW9uXG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmRleDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgKHV0aWxzLmlzQmxvYihyZXF1ZXN0RGF0YSkgfHwgdXRpbHMuaXNGaWxlKHJlcXVlc3REYXRhKSkgJiZcbiAgICAgIHJlcXVlc3REYXRhLnR5cGVcbiAgICApIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSB8fCAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCJleHBvcnQgZnVuY3Rpb24gYXR0cmlidXRlVG9TdHJpbmcoYXR0cmlidXRlKSB7XHJcbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICBhdHRyaWJ1dGUgKz0gJyc7XHJcbiAgICBpZiAoYXR0cmlidXRlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBhdHRyaWJ1dGUgPSAnJztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGF0dHJpYnV0ZS50cmltKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVDbGFzcyhlbGVtLCBjbGFzc05hbWUpIHtcclxuICBlbGVtLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW0sIC4uLmNsYXNzTmFtZXMpIHtcclxuICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoLi4uY2xhc3NOYW1lcyk7XHJcbiAgcmV0dXJuIGVsZW07XHJcbn1cclxuIiwiaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcclxuaW1wb3J0IHsgYXR0cmlidXRlVG9TdHJpbmcgfSBmcm9tICcuL2hlbHBlcic7XHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChheGlvc0NvbmZpZywgLi4uYXJncykge1xyXG4gIGNvbnN0IGluc3RhbmNlID0gQXhpb3MuY3JlYXRlKGF4aW9zQ29uZmlnKTtcclxuICByZXR1cm4ge1xyXG4gICAgZ2V0Q2FydCgpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLmdldCgnL2NhcnQuanMnKTtcclxuICAgIH0sXHJcbiAgICBnZXRQcm9kdWN0KGhhbmRsZSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UuZ2V0KGAvcHJvZHVjdHMvJHtoYW5kbGV9LmpzYCk7XHJcbiAgICB9LFxyXG4gICAgY2xlYXJDYXJ0KCkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvY2xlYXIuanMnKTtcclxuICAgIH0sXHJcbiAgICB1cGRhdGVDYXJ0RnJvbUZvcm0oZm9ybSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvdXBkYXRlLmpzJywgbmV3IEZvcm1EYXRhKGZvcm0pKTtcclxuICAgIH0sXHJcbiAgICBjaGFuZ2VJdGVtQnlLZXlPcklkKGtleU9ySWQsIHF1YW50aXR5KSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9jaGFuZ2UuanMnLCB7XHJcbiAgICAgICAgcXVhbnRpdHk6IHF1YW50aXR5LFxyXG4gICAgICAgIGlkOiBrZXlPcklkLFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVJdGVtQnlLZXlPcklkKGtleU9ySWQpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHsgcXVhbnRpdHk6IDAsIGlkOiBrZXlPcklkIH0pO1xyXG4gICAgfSxcclxuICAgIGNoYW5nZUl0ZW1CeUxpbmUobGluZSwgcXVhbnRpdHkpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHsgcXVhbnRpdHksIGxpbmUgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlSXRlbUJ5TGluZShsaW5lKSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9jaGFuZ2UuanMnLCB7IHF1YW50aXR5OiAwLCBsaW5lIH0pO1xyXG4gICAgfSxcclxuICAgIGFkZEl0ZW0oaWQsIHF1YW50aXR5LCBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9hZGQuanMnLCB7XHJcbiAgICAgICAgaWQsXHJcbiAgICAgICAgcXVhbnRpdHksXHJcbiAgICAgICAgcHJvcGVydGllcyxcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWRkSXRlbUZyb21Gb3JtKGZvcm0pIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2FkZC5qcycsIG5ldyBGb3JtRGF0YShmb3JtKSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlQ2FydEF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xyXG4gICAgICBsZXQgZGF0YSA9ICcnO1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhdHRyaWJ1dGVzKSkge1xyXG4gICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBrZXkgPSBhdHRyaWJ1dGVUb1N0cmluZyhhdHRyaWJ1dGUua2V5KTtcclxuICAgICAgICAgIGlmIChrZXkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGRhdGEgKz1cclxuICAgICAgICAgICAgICAnYXR0cmlidXRlc1snICtcclxuICAgICAgICAgICAgICBrZXkgK1xyXG4gICAgICAgICAgICAgICddPScgK1xyXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZVRvU3RyaW5nKGF0dHJpYnV0ZS52YWx1ZSkgK1xyXG4gICAgICAgICAgICAgICcmJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXR0cmlidXRlcyA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcyAhPT0gbnVsbCkge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XHJcbiAgICAgICAgICBkYXRhICs9XHJcbiAgICAgICAgICAgICdhdHRyaWJ1dGVzWycgK1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVUb1N0cmluZyhrZXkpICtcclxuICAgICAgICAgICAgJ109JyArXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZVRvU3RyaW5nKHZhbHVlKSArXHJcbiAgICAgICAgICAgICcmJztcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvdXBkYXRlLmpzJywgZGF0YSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlQ2FydE5vdGUobm90ZSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdChcclxuICAgICAgICAnL2NhcnQvdXBkYXRlLmpzJyxcclxuICAgICAgICBgbm90ZT0ke2F0dHJpYnV0ZVRvU3RyaW5nKG5vdGUpfWBcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG4iLCIvLyBjb2RlIGZvciB0ZXN0aW1vbmlhbHNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgbmV3IEdsaWRlcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2xpZGVyJyksIHtcclxuICAgIC8vIE1vYmlsZS1maXJzdCBkZWZhdWx0c1xyXG4gICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICBzY3JvbGxMb2NrOiB0cnVlLFxyXG4gICAgZG90czogJyNyZXNwLWRvdHMnLFxyXG4gICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgYXJyb3dzOiB7XHJcbiAgICAgIHByZXY6ICcuZ2xpZGVyLXByZXYnLFxyXG4gICAgICBuZXh0OiAnLmdsaWRlci1uZXh0JyxcclxuICAgIH0sXHJcbiAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgIHtcclxuICAgICAgICAvLyBzY3JlZW5zIGdyZWF0ZXIgdGhhbiA+PSA3NzVweFxyXG4gICAgICAgIGJyZWFrcG9pbnQ6IDAsXHJcbiAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgIC8vIFNldCB0byBgYXV0b2AgYW5kIHByb3ZpZGUgaXRlbSB3aWR0aCB0byBhZGp1c3QgdG8gdmlld3BvcnRcclxuICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgaXRlbVdpZHRoOiAzMDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgLy8gc2NyZWVucyBncmVhdGVyIHRoYW4gPj0gMTAyNHB4XHJcbiAgICAgICAgYnJlYWtwb2ludDogNTQwLFxyXG4gICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICBzbGlkZXNUb1Nob3c6ICdhdXRvJyxcclxuICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAnYXV0bycsXHJcbiAgICAgICAgICBpdGVtV2lkdGg6IDMwMCxcclxuICAgICAgICAgIGR1cmF0aW9uOiAxLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0pO1xyXG59KTtcclxuIiwiaW1wb3J0IHsgdG9nZ2xlQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vaGVscGVyLmpzJztcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gIGlmICh0YXJnZXQuY2xvc2VzdCgnLmRyb3Bkb3duLW1lbnUnKSkge1xyXG4gICAgY29uc29sZS5sb2coJ3ByZXZlbnQgZHJvcGRvd24gbWVudSBmcm9tIGNsb3NpbmcnKTtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxuICAvLyBjbGFzcz1cIm5hdmJhci10b2dnbGVyXCIgZGF0YS10cmlnZ2VyPVwiI25hdmJhcl9tYWluXCJcclxuICBpZiAodGFyZ2V0LmNsb3Nlc3QoJy5uYXZiYXItdG9nZ2xlcltkYXRhLXRyaWdnZXJdJykpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGNvbnN0IG9mZmNhbnZhc19pZCA9IHRhcmdldFxyXG4gICAgICAuY2xvc2VzdCgnLm5hdmJhci10b2dnbGVyW2RhdGEtdHJpZ2dlcl0nKVxyXG4gICAgICAuZ2V0QXR0cmlidXRlKCdkYXRhLXRyaWdnZXInKTtcclxuICAgIGNvbnN0IG9mZmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob2ZmY2FudmFzX2lkKTtcclxuICAgIGlmIChvZmZjYW52YXMpIHtcclxuICAgICAgdG9nZ2xlQ2xhc3Mob2ZmY2FudmFzLCAnc2hvdycpO1xyXG4gICAgfVxyXG4gICAgdG9nZ2xlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ29mZmNhbnZhcy1hY3RpdmUnKTtcclxuICAgIGNvbnN0IHNjcmVlbl9vdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjcmVlbi1vdmVybGF5Jyk7XHJcbiAgICBpZiAoc2NyZWVuX292ZXJsYXkpIHtcclxuICAgICAgdG9nZ2xlQ2xhc3Moc2NyZWVuX292ZXJsYXksICdzaG93Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodGFyZ2V0LmNsb3Nlc3QoJy5idG4tY2xvc2UsIC5zY3JlZW4tb3ZlcmxheScpKSB7XHJcbiAgICBjb25zdCBzY3JlZW5fb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JlZW4tb3ZlcmxheScpO1xyXG4gICAgaWYgKHNjcmVlbl9vdmVybGF5KSB7XHJcbiAgICAgIHJlbW92ZUNsYXNzKHNjcmVlbl9vdmVybGF5LCAnc2hvdycpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbW9iaWxlX29mZmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtb2ZmY2FudmFzJyk7XHJcbiAgICBpZiAobW9iaWxlX29mZmNhbnZhcykge1xyXG4gICAgICByZW1vdmVDbGFzcyhtb2JpbGVfb2ZmY2FudmFzLCAnc2hvdycpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ29mZmNhbnZhcy1hY3RpdmUnKTtcclxuICB9XHJcbn0pO1xyXG4iLCIhZnVuY3Rpb24odCxuKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1uKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShuKTp0Lk1hY3k9bigpfSh0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0LG4pe3ZhciBlPXZvaWQgMDtyZXR1cm4gZnVuY3Rpb24oKXtlJiZjbGVhclRpbWVvdXQoZSksZT1zZXRUaW1lb3V0KHQsbil9fWZ1bmN0aW9uIG4odCxuKXtmb3IodmFyIGU9dC5sZW5ndGgscj1lLG89W107ZS0tOylvLnB1c2gobih0W3ItZS0xXSkpO3JldHVybiBvfWZ1bmN0aW9uIGUodCxuKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSYmYXJndW1lbnRzWzJdO2lmKHdpbmRvdy5Qcm9taXNlKXJldHVybiBBKHQsbixlKTt0LnJlY2FsY3VsYXRlKCEwLCEwKX1mdW5jdGlvbiByKHQpe2Zvcih2YXIgbj10Lm9wdGlvbnMsZT10LnJlc3BvbnNpdmVPcHRpb25zLHI9dC5rZXlzLG89dC5kb2NXaWR0aCxpPXZvaWQgMCxzPTA7czxyLmxlbmd0aDtzKyspe3ZhciBhPXBhcnNlSW50KHJbc10sMTApO28+PWEmJihpPW4uYnJlYWtBdFthXSxPKGksZSkpfXJldHVybiBlfWZ1bmN0aW9uIG8odCl7Zm9yKHZhciBuPXQub3B0aW9ucyxlPXQucmVzcG9uc2l2ZU9wdGlvbnMscj10LmtleXMsbz10LmRvY1dpZHRoLGk9dm9pZCAwLHM9ci5sZW5ndGgtMTtzPj0wO3MtLSl7dmFyIGE9cGFyc2VJbnQocltzXSwxMCk7bzw9YSYmKGk9bi5icmVha0F0W2FdLE8oaSxlKSl9cmV0dXJuIGV9ZnVuY3Rpb24gaSh0KXt2YXIgbj10LnVzZUNvbnRhaW5lckZvckJyZWFrcG9pbnRzP3QuY29udGFpbmVyLmNsaWVudFdpZHRoOndpbmRvdy5pbm5lcldpZHRoLGU9e2NvbHVtbnM6dC5jb2x1bW5zfTtiKHQubWFyZ2luKT9lLm1hcmdpbj17eDp0Lm1hcmdpbi54LHk6dC5tYXJnaW4ueX06ZS5tYXJnaW49e3g6dC5tYXJnaW4seTp0Lm1hcmdpbn07dmFyIGk9T2JqZWN0LmtleXModC5icmVha0F0KTtyZXR1cm4gdC5tb2JpbGVGaXJzdD9yKHtvcHRpb25zOnQscmVzcG9uc2l2ZU9wdGlvbnM6ZSxrZXlzOmksZG9jV2lkdGg6bn0pOm8oe29wdGlvbnM6dCxyZXNwb25zaXZlT3B0aW9uczplLGtleXM6aSxkb2NXaWR0aDpufSl9ZnVuY3Rpb24gcyh0KXtyZXR1cm4gaSh0KS5jb2x1bW5zfWZ1bmN0aW9uIGEodCl7cmV0dXJuIGkodCkubWFyZ2lufWZ1bmN0aW9uIGModCl7dmFyIG49IShhcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXSl8fGFyZ3VtZW50c1sxXSxlPXModCkscj1hKHQpLngsbz0xMDAvZTtpZighbilyZXR1cm4gbztpZigxPT09ZSlyZXR1cm5cIjEwMCVcIjt2YXIgaT1cInB4XCI7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHIpe3ZhciBjPXBhcnNlRmxvYXQocik7aT1yLnJlcGxhY2UoYyxcIlwiKSxyPWN9cmV0dXJuIHI9KGUtMSkqci9lLFwiJVwiPT09aT9vLXIrXCIlXCI6XCJjYWxjKFwiK28rXCIlIC0gXCIrcitpK1wiKVwifWZ1bmN0aW9uIHUodCxuKXt2YXIgZT1zKHQub3B0aW9ucykscj0wLG89dm9pZCAwLGk9dm9pZCAwO2lmKDE9PT0rK24pcmV0dXJuIDA7aT1hKHQub3B0aW9ucykueDt2YXIgdT1cInB4XCI7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGkpe3ZhciBsPXBhcnNlRmxvYXQoaSwxMCk7dT1pLnJlcGxhY2UobCxcIlwiKSxpPWx9cmV0dXJuIG89KGktKGUtMSkqaS9lKSoobi0xKSxyKz1jKHQub3B0aW9ucywhMSkqKG4tMSksXCIlXCI9PT11P3IrbytcIiVcIjpcImNhbGMoXCIrcitcIiUgKyBcIitvK3UrXCIpXCJ9ZnVuY3Rpb24gbCh0KXt2YXIgbj0wLGU9dC5jb250YWluZXIscj10LnJvd3M7dihyLGZ1bmN0aW9uKHQpe249dD5uP3Q6bn0pLGUuc3R5bGUuaGVpZ2h0PW4rXCJweFwifWZ1bmN0aW9uIHAodCxuKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSYmYXJndW1lbnRzWzJdLHI9IShhcmd1bWVudHMubGVuZ3RoPjMmJnZvaWQgMCE9PWFyZ3VtZW50c1szXSl8fGFyZ3VtZW50c1szXSxvPXModC5vcHRpb25zKSxpPWEodC5vcHRpb25zKS55O00odCxvLGUpLHYobixmdW5jdGlvbihuKXt2YXIgZT0wLG89cGFyc2VJbnQobi5vZmZzZXRIZWlnaHQsMTApO2lzTmFOKG8pfHwodC5yb3dzLmZvckVhY2goZnVuY3Rpb24obixyKXtuPHQucm93c1tlXSYmKGU9cil9KSxuLnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIixuLnN0eWxlLnRvcD10LnJvd3NbZV0rXCJweFwiLG4uc3R5bGUubGVmdD1cIlwiK3QuY29sc1tlXSx0LnJvd3NbZV0rPWlzTmFOKG8pPzA6bytpLHImJihuLmRhdGFzZXQubWFjeUNvbXBsZXRlPTEpKX0pLHImJih0LnRtcFJvd3M9bnVsbCksbCh0KX1mdW5jdGlvbiBmKHQsbil7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0mJmFyZ3VtZW50c1syXSxyPSEoYXJndW1lbnRzLmxlbmd0aD4zJiZ2b2lkIDAhPT1hcmd1bWVudHNbM10pfHxhcmd1bWVudHNbM10sbz1zKHQub3B0aW9ucyksaT1hKHQub3B0aW9ucykueTtNKHQsbyxlKSx2KG4sZnVuY3Rpb24obil7dC5sYXN0Y29sPT09byYmKHQubGFzdGNvbD0wKTt2YXIgZT1DKG4sXCJoZWlnaHRcIik7ZT1wYXJzZUludChuLm9mZnNldEhlaWdodCwxMCksaXNOYU4oZSl8fChuLnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIixuLnN0eWxlLnRvcD10LnJvd3NbdC5sYXN0Y29sXStcInB4XCIsbi5zdHlsZS5sZWZ0PVwiXCIrdC5jb2xzW3QubGFzdGNvbF0sdC5yb3dzW3QubGFzdGNvbF0rPWlzTmFOKGUpPzA6ZStpLHQubGFzdGNvbCs9MSxyJiYobi5kYXRhc2V0Lm1hY3lDb21wbGV0ZT0xKSl9KSxyJiYodC50bXBSb3dzPW51bGwpLGwodCl9dmFyIGg9ZnVuY3Rpb24gdChuLGUpe2lmKCEodGhpcyBpbnN0YW5jZW9mIHQpKXJldHVybiBuZXcgdChuLGUpO2lmKG4mJm4ubm9kZU5hbWUpcmV0dXJuIG47aWYobj1uLnJlcGxhY2UoL15cXHMqLyxcIlwiKS5yZXBsYWNlKC9cXHMqJC8sXCJcIiksZSlyZXR1cm4gdGhpcy5ieUNzcyhuLGUpO2Zvcih2YXIgciBpbiB0aGlzLnNlbGVjdG9ycylpZihlPXIuc3BsaXQoXCIvXCIpLG5ldyBSZWdFeHAoZVsxXSxlWzJdKS50ZXN0KG4pKXJldHVybiB0aGlzLnNlbGVjdG9yc1tyXShuKTtyZXR1cm4gdGhpcy5ieUNzcyhuKX07aC5wcm90b3R5cGUuYnlDc3M9ZnVuY3Rpb24odCxuKXtyZXR1cm4obnx8ZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwodCl9LGgucHJvdG90eXBlLnNlbGVjdG9ycz17fSxoLnByb3RvdHlwZS5zZWxlY3RvcnNbL15cXC5bXFx3XFwtXSskL109ZnVuY3Rpb24odCl7cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUodC5zdWJzdHJpbmcoMSkpfSxoLnByb3RvdHlwZS5zZWxlY3RvcnNbL15cXHcrJC9dPWZ1bmN0aW9uKHQpe3JldHVybiBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0KX0saC5wcm90b3R5cGUuc2VsZWN0b3JzWy9eXFwjW1xcd1xcLV0rJC9dPWZ1bmN0aW9uKHQpe3JldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0LnN1YnN0cmluZygxKSl9O3ZhciB2PWZ1bmN0aW9uKHQsbil7Zm9yKHZhciBlPXQubGVuZ3RoLHI9ZTtlLS07KW4odFtyLWUtMV0pfSxtPWZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXTt0aGlzLnJ1bm5pbmc9ITEsdGhpcy5ldmVudHM9W10sdGhpcy5hZGQodCl9O20ucHJvdG90eXBlLnJ1bj1mdW5jdGlvbigpe2lmKCF0aGlzLnJ1bm5pbmcmJnRoaXMuZXZlbnRzLmxlbmd0aD4wKXt2YXIgdD10aGlzLmV2ZW50cy5zaGlmdCgpO3RoaXMucnVubmluZz0hMCx0KCksdGhpcy5ydW5uaW5nPSExLHRoaXMucnVuKCl9fSxtLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLG49YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXTtyZXR1cm4hIW4mJihBcnJheS5pc0FycmF5KG4pP3YobixmdW5jdGlvbihuKXtyZXR1cm4gdC5hZGQobil9KToodGhpcy5ldmVudHMucHVzaChuKSx2b2lkIHRoaXMucnVuKCkpKX0sbS5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLmV2ZW50cz1bXX07dmFyIGQ9ZnVuY3Rpb24odCl7dmFyIG49YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOnt9O3JldHVybiB0aGlzLmluc3RhbmNlPXQsdGhpcy5kYXRhPW4sdGhpc30seT1mdW5jdGlvbigpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdJiZhcmd1bWVudHNbMF07dGhpcy5ldmVudHM9e30sdGhpcy5pbnN0YW5jZT10fTt5LnByb3RvdHlwZS5vbj1mdW5jdGlvbigpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdJiZhcmd1bWVudHNbMF0sbj1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXSYmYXJndW1lbnRzWzFdO3JldHVybiEoIXR8fCFuKSYmKEFycmF5LmlzQXJyYXkodGhpcy5ldmVudHNbdF0pfHwodGhpcy5ldmVudHNbdF09W10pLHRoaXMuZXZlbnRzW3RdLnB1c2gobikpfSx5LnByb3RvdHlwZS5lbWl0PWZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXSxuPWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdP2FyZ3VtZW50c1sxXTp7fTtpZighdHx8IUFycmF5LmlzQXJyYXkodGhpcy5ldmVudHNbdF0pKXJldHVybiExO3ZhciBlPW5ldyBkKHRoaXMuaW5zdGFuY2Usbik7dih0aGlzLmV2ZW50c1t0XSxmdW5jdGlvbih0KXtyZXR1cm4gdChlKX0pfTt2YXIgZz1mdW5jdGlvbih0KXtyZXR1cm4hKFwibmF0dXJhbEhlaWdodFwiaW4gdCYmdC5uYXR1cmFsSGVpZ2h0K3QubmF0dXJhbFdpZHRoPT09MCl8fHQud2lkdGgrdC5oZWlnaHQhPT0wfSxFPWZ1bmN0aW9uKHQsbil7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0mJmFyZ3VtZW50c1syXTtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24odCxlKXtpZihuLmNvbXBsZXRlKXJldHVybiBnKG4pP3Qobik6ZShuKTtuLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsZnVuY3Rpb24oKXtyZXR1cm4gZyhuKT90KG4pOmUobil9KSxuLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGZ1bmN0aW9uKCl7cmV0dXJuIGUobil9KX0pLnRoZW4oZnVuY3Rpb24obil7ZSYmdC5lbWl0KHQuY29uc3RhbnRzLkVWRU5UX0lNQUdFX0xPQUQse2ltZzpufSl9KS5jYXRjaChmdW5jdGlvbihuKXtyZXR1cm4gdC5lbWl0KHQuY29uc3RhbnRzLkVWRU5UX0lNQUdFX0VSUk9SLHtpbWc6bn0pfSl9LHc9ZnVuY3Rpb24odCxlKXt2YXIgcj1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSYmYXJndW1lbnRzWzJdO3JldHVybiBuKGUsZnVuY3Rpb24obil7cmV0dXJuIEUodCxuLHIpfSl9LEE9ZnVuY3Rpb24odCxuKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSYmYXJndW1lbnRzWzJdO3JldHVybiBQcm9taXNlLmFsbCh3KHQsbixlKSkudGhlbihmdW5jdGlvbigpe3QuZW1pdCh0LmNvbnN0YW50cy5FVkVOVF9JTUFHRV9DT01QTEVURSl9KX0sST1mdW5jdGlvbihuKXtyZXR1cm4gdChmdW5jdGlvbigpe24uZW1pdChuLmNvbnN0YW50cy5FVkVOVF9SRVNJWkUpLG4ucXVldWUuYWRkKGZ1bmN0aW9uKCl7cmV0dXJuIG4ucmVjYWxjdWxhdGUoITAsITApfSl9LDEwMCl9LE49ZnVuY3Rpb24odCl7aWYodC5jb250YWluZXI9aCh0Lm9wdGlvbnMuY29udGFpbmVyKSx0LmNvbnRhaW5lciBpbnN0YW5jZW9mIGh8fCF0LmNvbnRhaW5lcilyZXR1cm4hIXQub3B0aW9ucy5kZWJ1ZyYmY29uc29sZS5lcnJvcihcIkVycm9yOiBDb250YWluZXIgbm90IGZvdW5kXCIpO3QuY29udGFpbmVyLmxlbmd0aCYmKHQuY29udGFpbmVyPXQuY29udGFpbmVyWzBdKSx0Lm9wdGlvbnMuY29udGFpbmVyPXQuY29udGFpbmVyLHQuY29udGFpbmVyLnN0eWxlLnBvc2l0aW9uPVwicmVsYXRpdmVcIn0sVD1mdW5jdGlvbih0KXt0LnF1ZXVlPW5ldyBtLHQuZXZlbnRzPW5ldyB5KHQpLHQucm93cz1bXSx0LnJlc2l6ZXI9SSh0KX0sTD1mdW5jdGlvbih0KXt2YXIgbj1oKFwiaW1nXCIsdC5jb250YWluZXIpO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdC5yZXNpemVyKSx0Lm9uKHQuY29uc3RhbnRzLkVWRU5UX0lNQUdFX0xPQUQsZnVuY3Rpb24oKXtyZXR1cm4gdC5yZWNhbGN1bGF0ZSghMSwhMSl9KSx0Lm9uKHQuY29uc3RhbnRzLkVWRU5UX0lNQUdFX0NPTVBMRVRFLGZ1bmN0aW9uKCl7cmV0dXJuIHQucmVjYWxjdWxhdGUoITAsITApfSksdC5vcHRpb25zLnVzZU93bkltYWdlTG9hZGVyfHxlKHQsbiwhdC5vcHRpb25zLndhaXRGb3JJbWFnZXMpLHQuZW1pdCh0LmNvbnN0YW50cy5FVkVOVF9JTklUSUFMSVpFRCl9LF89ZnVuY3Rpb24odCl7Tih0KSxUKHQpLEwodCl9LGI9ZnVuY3Rpb24odCl7cmV0dXJuIHQ9PT1PYmplY3QodCkmJlwiW29iamVjdCBBcnJheV1cIiE9PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KX0sTz1mdW5jdGlvbih0LG4pe2IodCl8fChuLmNvbHVtbnM9dCksYih0KSYmdC5jb2x1bW5zJiYobi5jb2x1bW5zPXQuY29sdW1ucyksYih0KSYmdC5tYXJnaW4mJiFiKHQubWFyZ2luKSYmKG4ubWFyZ2luPXt4OnQubWFyZ2luLHk6dC5tYXJnaW59KSxiKHQpJiZ0Lm1hcmdpbiYmYih0Lm1hcmdpbikmJnQubWFyZ2luLngmJihuLm1hcmdpbi54PXQubWFyZ2luLngpLGIodCkmJnQubWFyZ2luJiZiKHQubWFyZ2luKSYmdC5tYXJnaW4ueSYmKG4ubWFyZ2luLnk9dC5tYXJnaW4ueSl9LEM9ZnVuY3Rpb24odCxuKXtyZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUodCxudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG4pfSxNPWZ1bmN0aW9uKHQsbil7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0mJmFyZ3VtZW50c1syXTtpZih0Lmxhc3Rjb2x8fCh0Lmxhc3Rjb2w9MCksdC5yb3dzLmxlbmd0aDwxJiYoZT0hMCksZSl7dC5yb3dzPVtdLHQuY29scz1bXSx0Lmxhc3Rjb2w9MDtmb3IodmFyIHI9bi0xO3I+PTA7ci0tKXQucm93c1tyXT0wLHQuY29sc1tyXT11KHQscil9ZWxzZSBpZih0LnRtcFJvd3Mpe3Qucm93cz1bXTtmb3IodmFyIHI9bi0xO3I+PTA7ci0tKXQucm93c1tyXT10LnRtcFJvd3Nbcl19ZWxzZXt0LnRtcFJvd3M9W107Zm9yKHZhciByPW4tMTtyPj0wO3ItLSl0LnRtcFJvd3Nbcl09dC5yb3dzW3JdfX0sVj1mdW5jdGlvbih0KXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXSYmYXJndW1lbnRzWzFdLGU9IShhcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXSl8fGFyZ3VtZW50c1syXSxyPW4/dC5jb250YWluZXIuY2hpbGRyZW46aCgnOnNjb3BlID4gKjpub3QoW2RhdGEtbWFjeS1jb21wbGV0ZT1cIjFcIl0pJyx0LmNvbnRhaW5lcik7cj1BcnJheS5mcm9tKHIpLmZpbHRlcihmdW5jdGlvbih0KXtyZXR1cm4gbnVsbCE9PXQub2Zmc2V0UGFyZW50fSk7dmFyIG89Yyh0Lm9wdGlvbnMpO3JldHVybiB2KHIsZnVuY3Rpb24odCl7biYmKHQuZGF0YXNldC5tYWN5Q29tcGxldGU9MCksdC5zdHlsZS53aWR0aD1vfSksdC5vcHRpb25zLnRydWVPcmRlcj8oZih0LHIsbixlKSx0LmVtaXQodC5jb25zdGFudHMuRVZFTlRfUkVDQUxDVUxBVEVEKSk6KHAodCxyLG4sZSksdC5lbWl0KHQuY29uc3RhbnRzLkVWRU5UX1JFQ0FMQ1VMQVRFRCkpfSxSPWZ1bmN0aW9uKCl7cmV0dXJuISF3aW5kb3cuUHJvbWlzZX0seD1PYmplY3QuYXNzaWdufHxmdW5jdGlvbih0KXtmb3IodmFyIG49MTtuPGFyZ3VtZW50cy5sZW5ndGg7bisrKXt2YXIgZT1hcmd1bWVudHNbbl07Zm9yKHZhciByIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUscikmJih0W3JdPWVbcl0pfXJldHVybiB0fTtBcnJheS5mcm9tfHwoQXJyYXkuZnJvbT1mdW5jdGlvbih0KXtmb3IodmFyIG49MCxlPVtdO248dC5sZW5ndGg7KWUucHVzaCh0W24rK10pO3JldHVybiBlfSk7dmFyIGs9e2NvbHVtbnM6NCxtYXJnaW46Mix0cnVlT3JkZXI6ITEsd2FpdEZvckltYWdlczohMSx1c2VJbWFnZUxvYWRlcjohMCxicmVha0F0Ont9LHVzZU93bkltYWdlTG9hZGVyOiExLG9uSW5pdDohMSxjYW5jZWxMZWdhY3k6ITEsdXNlQ29udGFpbmVyRm9yQnJlYWtwb2ludHM6ITF9OyFmdW5jdGlvbigpe3RyeXtkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlICpcIil9Y2F0Y2godCl7IWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0KXtyZXR1cm4gZnVuY3Rpb24oZSl7aWYoZSYmbi50ZXN0KGUpKXt2YXIgcj10aGlzLmdldEF0dHJpYnV0ZShcImlkXCIpO3J8fCh0aGlzLmlkPVwicVwiK01hdGguZmxvb3IoOWU2Kk1hdGgucmFuZG9tKCkpKzFlNiksYXJndW1lbnRzWzBdPWUucmVwbGFjZShuLFwiI1wiK3RoaXMuaWQpO3ZhciBvPXQuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBudWxsPT09cj90aGlzLnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpOnJ8fCh0aGlzLmlkPXIpLG99cmV0dXJuIHQuYXBwbHkodGhpcyxhcmd1bWVudHMpfX12YXIgbj0vOnNjb3BlXFxiL2dpLGU9dChFbGVtZW50LnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yKTtFbGVtZW50LnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yPWZ1bmN0aW9uKHQpe3JldHVybiBlLmFwcGx5KHRoaXMsYXJndW1lbnRzKX07dmFyIHI9dChFbGVtZW50LnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsKTtFbGVtZW50LnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsPWZ1bmN0aW9uKHQpe3JldHVybiByLmFwcGx5KHRoaXMsYXJndW1lbnRzKX19KCl9fSgpO3ZhciBxPWZ1bmN0aW9uIHQoKXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXT9hcmd1bWVudHNbMF06aztpZighKHRoaXMgaW5zdGFuY2VvZiB0KSlyZXR1cm4gbmV3IHQobik7dGhpcy5vcHRpb25zPXt9LHgodGhpcy5vcHRpb25zLGssbiksdGhpcy5vcHRpb25zLmNhbmNlbExlZ2FjeSYmIVIoKXx8Xyh0aGlzKX07cmV0dXJuIHEuaW5pdD1mdW5jdGlvbih0KXtyZXR1cm4gY29uc29sZS53YXJuKFwiRGVwcmVjaWF0ZWQ6IE1hY3kuaW5pdCB3aWxsIGJlIHJlbW92ZWQgaW4gdjMuMC4wIG9wdCB0byB1c2UgTWFjeSBkaXJlY3RseSBsaWtlIHNvIE1hY3koeyAvKm9wdGlvbnMgaGVyZSovIH0pIFwiKSxuZXcgcSh0KX0scS5wcm90b3R5cGUucmVjYWxjdWxhdGVPbkltYWdlTG9hZD1mdW5jdGlvbigpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdJiZhcmd1bWVudHNbMF07cmV0dXJuIGUodGhpcyxoKFwiaW1nXCIsdGhpcy5jb250YWluZXIpLCF0KX0scS5wcm90b3R5cGUucnVuT25JbWFnZUxvYWQ9ZnVuY3Rpb24odCl7dmFyIG49YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0mJmFyZ3VtZW50c1sxXSxyPWgoXCJpbWdcIix0aGlzLmNvbnRhaW5lcik7cmV0dXJuIHRoaXMub24odGhpcy5jb25zdGFudHMuRVZFTlRfSU1BR0VfQ09NUExFVEUsdCksbiYmdGhpcy5vbih0aGlzLmNvbnN0YW50cy5FVkVOVF9JTUFHRV9MT0FELHQpLGUodGhpcyxyLG4pfSxxLnByb3RvdHlwZS5yZWNhbGN1bGF0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMsbj1hcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXSYmYXJndW1lbnRzWzBdLGU9IShhcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXSl8fGFyZ3VtZW50c1sxXTtyZXR1cm4gZSYmdGhpcy5xdWV1ZS5jbGVhcigpLHRoaXMucXVldWUuYWRkKGZ1bmN0aW9uKCl7cmV0dXJuIFYodCxuLGUpfSl9LHEucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbigpe3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcy5yZXNpemVyKSx2KHRoaXMuY29udGFpbmVyLmNoaWxkcmVuLGZ1bmN0aW9uKHQpe3QucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1tYWN5LWNvbXBsZXRlXCIpLHQucmVtb3ZlQXR0cmlidXRlKFwic3R5bGVcIil9KSx0aGlzLmNvbnRhaW5lci5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKX0scS5wcm90b3R5cGUucmVJbml0PWZ1bmN0aW9uKCl7dGhpcy5yZWNhbGN1bGF0ZSghMCwhMCksdGhpcy5lbWl0KHRoaXMuY29uc3RhbnRzLkVWRU5UX0lOSVRJQUxJWkVEKSx3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMucmVzaXplciksdGhpcy5jb250YWluZXIuc3R5bGUucG9zaXRpb249XCJyZWxhdGl2ZVwifSxxLnByb3RvdHlwZS5vbj1mdW5jdGlvbih0LG4pe3RoaXMuZXZlbnRzLm9uKHQsbil9LHEucHJvdG90eXBlLmVtaXQ9ZnVuY3Rpb24odCxuKXt0aGlzLmV2ZW50cy5lbWl0KHQsbil9LHEuY29uc3RhbnRzPXtFVkVOVF9JTklUSUFMSVpFRDpcIm1hY3kuaW5pdGlhbGl6ZWRcIixFVkVOVF9SRUNBTENVTEFURUQ6XCJtYWN5LnJlY2FsY3VsYXRlZFwiLEVWRU5UX0lNQUdFX0xPQUQ6XCJtYWN5LmltYWdlLmxvYWRcIixFVkVOVF9JTUFHRV9FUlJPUjpcIm1hY3kuaW1hZ2UuZXJyb3JcIixFVkVOVF9JTUFHRV9DT01QTEVURTpcIm1hY3kuaW1hZ2VzLmNvbXBsZXRlXCIsRVZFTlRfUkVTSVpFOlwibWFjeS5yZXNpemVcIn0scS5wcm90b3R5cGUuY29uc3RhbnRzPXEuY29uc3RhbnRzLHF9KTtcbiIsImltcG9ydCBNYWN5IGZyb20gJ21hY3knO1xyXG5cclxuY29uc3QgbWFjeUluc3RhbmNlID0gTWFjeSh7XHJcbiAgY29udGFpbmVyOiAnLmluZGV4LXNlY3Rpb24tLW1hc29ucnkgLmltYWdlcy13cmFwcGVyJyxcclxuICBjb2x1bW5zOiAzLFxyXG4gIGJyZWFrQXQ6IHtcclxuICAgIDUyMDogMixcclxuICAgIDQwMDogMSxcclxuICB9LFxyXG59KTtcclxuIiwiaW1wb3J0IEJTTiBmcm9tICdib290c3RyYXAubmF0aXZlJztcclxuaW1wb3J0IGFqYXhBUElDcmVhdG9yIGZyb20gJy4vYWpheGFwaSc7XHJcbmltcG9ydCAnLi9zZWN0aW9ucy90ZXN0aW1vbmlhbHMnO1xyXG5pbXBvcnQgJy4vc2VjdGlvbnMvaGVhZGVyJztcclxuaW1wb3J0ICcuL3NlY3Rpb25zL21hc29ucnktZ2FsbGVyeSc7XHJcblxyXG53aW5kb3cuZGF0b21hciA9IHtcclxuICBCU04sXHJcbiAgYXBpOiBhamF4QVBJQ3JlYXRvcih7fSksXHJcbn07XHJcbiJdLCJuYW1lcyI6WyJ0cmFuc2l0aW9uRW5kRXZlbnQiLCJkb2N1bWVudCIsImJvZHkiLCJzdHlsZSIsInN1cHBvcnRUcmFuc2l0aW9uIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbiIsImVsZW1lbnQiLCJkdXJhdGlvbiIsInBhcnNlRmxvYXQiLCJnZXRDb21wdXRlZFN0eWxlIiwiaXNOYU4iLCJlbXVsYXRlVHJhbnNpdGlvbkVuZCIsImhhbmRsZXIiLCJjYWxsZWQiLCJhZGRFdmVudExpc3RlbmVyIiwidHJhbnNpdGlvbkVuZFdyYXBwZXIiLCJlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInNldFRpbWVvdXQiLCJxdWVyeUVsZW1lbnQiLCJzZWxlY3RvciIsInBhcmVudCIsImxvb2tVcCIsIkVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYm9vdHN0cmFwQ3VzdG9tRXZlbnQiLCJldmVudE5hbWUiLCJjb21wb25lbnROYW1lIiwicmVsYXRlZCIsIk9yaWdpbmFsQ3VzdG9tRXZlbnQiLCJDdXN0b21FdmVudCIsImNhbmNlbGFibGUiLCJyZWxhdGVkVGFyZ2V0IiwiZGlzcGF0Y2hDdXN0b21FdmVudCIsImN1c3RvbUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIkFsZXJ0Iiwic2VsZiIsImFsZXJ0IiwiY2xvc2VDdXN0b21FdmVudCIsImNsb3NlZEN1c3RvbUV2ZW50IiwidHJpZ2dlckhhbmRsZXIiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInRyYW5zaXRpb25FbmRIYW5kbGVyIiwidG9nZ2xlRXZlbnRzIiwiYWN0aW9uIiwiY2xpY2tIYW5kbGVyIiwidGFyZ2V0IiwiY2xvc2VzdCIsImNsb3NlIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwiY2FsbCIsImRlZmF1bHRQcmV2ZW50ZWQiLCJkaXNwb3NlIiwicmVtb3ZlIiwiQnV0dG9uIiwibGFiZWxzIiwiY2hhbmdlQ3VzdG9tRXZlbnQiLCJ0b2dnbGUiLCJpbnB1dCIsImxhYmVsIiwidGFnTmFtZSIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwidHlwZSIsImNoZWNrZWQiLCJhZGQiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJ0b2dnbGVkIiwic2NyZWVuWCIsInNjcmVlblkiLCJBcnJheSIsImZyb20iLCJtYXAiLCJvdGhlckxhYmVsIiwib3RoZXJJbnB1dCIsImtleUhhbmRsZXIiLCJrZXkiLCJ3aGljaCIsImtleUNvZGUiLCJhY3RpdmVFbGVtZW50IiwicHJldmVudFNjcm9sbCIsInByZXZlbnREZWZhdWx0IiwiZm9jdXNUb2dnbGUiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwibGVuZ3RoIiwiYnRuIiwibW91c2VIb3ZlckV2ZW50cyIsInN1cHBvcnRQYXNzaXZlIiwicmVzdWx0Iiwib3B0cyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2V0Iiwid3JhcCIsInBhc3NpdmVIYW5kbGVyIiwicGFzc2l2ZSIsImlzRWxlbWVudEluU2Nyb2xsUmFuZ2UiLCJiY3IiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ2aWV3cG9ydEhlaWdodCIsIndpbmRvdyIsImlubmVySGVpZ2h0IiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50SGVpZ2h0IiwidG9wIiwiYm90dG9tIiwiQ2Fyb3VzZWwiLCJvcHRpb25zIiwidmFycyIsIm9wcyIsInNsaWRlQ3VzdG9tRXZlbnQiLCJzbGlkQ3VzdG9tRXZlbnQiLCJzbGlkZXMiLCJsZWZ0QXJyb3ciLCJyaWdodEFycm93IiwiaW5kaWNhdG9yIiwiaW5kaWNhdG9ycyIsInBhdXNlSGFuZGxlciIsImludGVydmFsIiwiaXNTbGlkaW5nIiwiY2xlYXJJbnRlcnZhbCIsInRpbWVyIiwicmVzdW1lSGFuZGxlciIsImN5Y2xlIiwiaW5kaWNhdG9ySGFuZGxlciIsImV2ZW50VGFyZ2V0IiwiaW5kZXgiLCJwYXJzZUludCIsInNsaWRlVG8iLCJjb250cm9sc0hhbmRsZXIiLCJjdXJyZW50VGFyZ2V0Iiwic3JjRWxlbWVudCIsInJlZiIsInBhdXNlIiwidG91Y2giLCJ0b3VjaERvd25IYW5kbGVyIiwia2V5Ym9hcmQiLCJ0b2dnbGVUb3VjaEV2ZW50cyIsInRvdWNoTW92ZUhhbmRsZXIiLCJ0b3VjaEVuZEhhbmRsZXIiLCJpc1RvdWNoIiwidG91Y2hQb3NpdGlvbiIsInN0YXJ0WCIsImNoYW5nZWRUb3VjaGVzIiwicGFnZVgiLCJjdXJyZW50WCIsImVuZFgiLCJNYXRoIiwiYWJzIiwic2V0QWN0aXZlUGFnZSIsInBhZ2VJbmRleCIsIngiLCJuZXh0IiwidGltZW91dCIsImVsYXBzZWRUaW1lIiwiYWN0aXZlSXRlbSIsImdldEFjdGl2ZUluZGV4Iiwib3JpZW50YXRpb24iLCJkaXJlY3Rpb24iLCJoaWRkZW4iLCJzZXRJbnRlcnZhbCIsImlkeCIsIm9mZnNldFdpZHRoIiwiaW5kZXhPZiIsIml0ZW1DbGFzc2VzIiwic2xpZGUiLCJjbHMiLCJpbnRlcnZhbEF0dHJpYnV0ZSIsImludGVydmFsRGF0YSIsInRvdWNoRGF0YSIsInBhdXNlRGF0YSIsImtleWJvYXJkRGF0YSIsImludGVydmFsT3B0aW9uIiwidG91Y2hPcHRpb24iLCJDb2xsYXBzZSIsImFjY29yZGlvbiIsImNvbGxhcHNlIiwiYWN0aXZlQ29sbGFwc2UiLCJzaG93Q3VzdG9tRXZlbnQiLCJzaG93bkN1c3RvbUV2ZW50IiwiaGlkZUN1c3RvbUV2ZW50IiwiaGlkZGVuQ3VzdG9tRXZlbnQiLCJvcGVuQWN0aW9uIiwiY29sbGFwc2VFbGVtZW50IiwiaXNBbmltYXRpbmciLCJoZWlnaHQiLCJzY3JvbGxIZWlnaHQiLCJjbG9zZUFjdGlvbiIsInNob3ciLCJoaWRlIiwiaWQiLCJhY2NvcmRpb25EYXRhIiwic2V0Rm9jdXMiLCJmb2N1cyIsInNldEFjdGl2ZSIsIkRyb3Bkb3duIiwib3B0aW9uIiwibWVudSIsIm1lbnVJdGVtcyIsInBlcnNpc3QiLCJwcmV2ZW50RW1wdHlBbmNob3IiLCJhbmNob3IiLCJocmVmIiwic2xpY2UiLCJ0b2dnbGVEaXNtaXNzIiwib3BlbiIsImRpc21pc3NIYW5kbGVyIiwiaGFzRGF0YSIsImlzU2FtZUVsZW1lbnQiLCJpc0luc2lkZU1lbnUiLCJpc01lbnVJdGVtIiwiY2hpbGRyZW4iLCJjaGlsZCIsInB1c2giLCJNb2RhbCIsIm1vZGFsIiwic2Nyb2xsQmFyV2lkdGgiLCJvdmVybGF5Iiwib3ZlcmxheURlbGF5IiwiZml4ZWRJdGVtcyIsInNldFNjcm9sbGJhciIsIm9wZW5Nb2RhbCIsImJvZHlQYWQiLCJwYWRkaW5nUmlnaHQiLCJib2R5T3ZlcmZsb3ciLCJtb2RhbE92ZXJmbG93IiwibWVhc3VyZVNjcm9sbGJhciIsImZpeGVkIiwiaXRlbVBhZCIsInJlc2V0U2Nyb2xsYmFyIiwic2Nyb2xsRGl2IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoVmFsdWUiLCJjbGFzc05hbWUiLCJhcHBlbmRDaGlsZCIsImNsaWVudFdpZHRoIiwiY3JlYXRlT3ZlcmxheSIsIm5ld092ZXJsYXkiLCJhbmltYXRpb24iLCJyZW1vdmVPdmVybGF5IiwidXBkYXRlIiwiYmVmb3JlU2hvdyIsImRpc3BsYXkiLCJ0cmlnZ2VyU2hvdyIsInRyaWdnZXJIaWRlIiwiZm9yY2UiLCJjbGlja1RhcmdldCIsIm1vZGFsSUQiLCJ0YXJnZXRBdHRyVmFsdWUiLCJlbGVtQXR0clZhbHVlIiwibW9kYWxUcmlnZ2VyIiwicGFyZW50V2l0aERhdGEiLCJiYWNrZHJvcCIsImN1cnJlbnRPcGVuIiwic2V0Q29udGVudCIsImNvbnRlbnQiLCJpbm5lckhUTUwiLCJjaGVja01vZGFsIiwiY29uY2F0IiwidHJpbSIsIm1vdXNlQ2xpY2tFdmVudHMiLCJkb3duIiwidXAiLCJnZXRTY3JvbGwiLCJ5IiwicGFnZVlPZmZzZXQiLCJzY3JvbGxUb3AiLCJwYWdlWE9mZnNldCIsInNjcm9sbExlZnQiLCJzdHlsZVRpcCIsImxpbmsiLCJwb3NpdGlvbiIsInRpcFBvc2l0aW9ucyIsImVsZW1lbnREaW1lbnNpb25zIiwidyIsImgiLCJvZmZzZXRIZWlnaHQiLCJ3aW5kb3dXaWR0aCIsIndpbmRvd0hlaWdodCIsInJlY3QiLCJzY3JvbGwiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwibGlua0RpbWVuc2lvbnMiLCJyaWdodCIsImxlZnQiLCJpc1BvcG92ZXIiLCJhcnJvdyIsImhhbGZUb3BFeGNlZWQiLCJoYWxmTGVmdEV4Y2VlZCIsImhhbGZSaWdodEV4Y2VlZCIsImhhbGZCb3R0b21FeGNlZWQiLCJ0b3BFeGNlZWQiLCJsZWZ0RXhjZWVkIiwiYm90dG9tRXhjZWVkIiwicmlnaHRFeGNlZWQiLCJ0b3BQb3NpdGlvbiIsImxlZnRQb3NpdGlvbiIsImFycm93VG9wIiwiYXJyb3dMZWZ0IiwiYXJyb3dXaWR0aCIsImFycm93SGVpZ2h0IiwicmVwbGFjZSIsIlBvcG92ZXIiLCJwb3BvdmVyIiwiaXNJcGhvbmUiLCJ0ZXN0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwidGl0bGVTdHJpbmciLCJjb250ZW50U3RyaW5nIiwidHJpZ2dlckRhdGEiLCJhbmltYXRpb25EYXRhIiwicGxhY2VtZW50RGF0YSIsImRpc21pc3NpYmxlRGF0YSIsImRlbGF5RGF0YSIsImNvbnRhaW5lckRhdGEiLCJjbG9zZUJ0biIsImNvbnRhaW5lckVsZW1lbnQiLCJjb250YWluZXJEYXRhRWxlbWVudCIsIm5hdmJhckZpeGVkVG9wIiwibmF2YmFyRml4ZWRCb3R0b20iLCJwbGFjZW1lbnRDbGFzcyIsImRpc21pc3NpYmxlSGFuZGxlciIsImdldENvbnRlbnRzIiwidGl0bGUiLCJyZW1vdmVQb3BvdmVyIiwiY29udGFpbmVyIiwiY3JlYXRlUG9wb3ZlciIsInBvcG92ZXJBcnJvdyIsInRlbXBsYXRlIiwicG9wb3ZlclRpdGxlIiwiZGlzbWlzc2libGUiLCJwb3BvdmVyQm9keU1hcmt1cCIsInBvcG92ZXJUZW1wbGF0ZSIsImZpcnN0Q2hpbGQiLCJwb3BvdmVySGVhZGVyIiwicG9wb3ZlckJvZHkiLCJzaG93UG9wb3ZlciIsInVwZGF0ZVBvcG92ZXIiLCJwbGFjZW1lbnQiLCJmb3JjZUZvY3VzIiwidHJpZ2dlciIsInRvdWNoSGFuZGxlciIsImRpc21pc3NIYW5kbGVyVG9nZ2xlIiwic2hvd1RyaWdnZXIiLCJoaWRlVHJpZ2dlciIsImNsZWFyVGltZW91dCIsImRlbGF5IiwicG9wb3ZlckNvbnRlbnRzIiwiU2Nyb2xsU3B5IiwidGFyZ2V0RGF0YSIsIm9mZnNldERhdGEiLCJzcHlUYXJnZXQiLCJzY3JvbGxUYXJnZXQiLCJ1cGRhdGVUYXJnZXRzIiwibGlua3MiLCJpdGVtcyIsInRhcmdldHMiLCJ0YXJnZXRJdGVtIiwiY2hhckF0IiwidXBkYXRlSXRlbSIsIml0ZW0iLCJkcm9wbWVudSIsImRyb3BMaW5rIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsIm5leHRTaWJsaW5nIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiYWN0aXZlU2libGluZyIsInRhcmdldFJlY3QiLCJpc1dpbmRvdyIsImlzQWN0aXZlIiwidG9wRWRnZSIsInNjcm9sbE9mZnNldCIsIm9mZnNldCIsImJvdHRvbUVkZ2UiLCJpbnNpZGUiLCJ1cGRhdGVJdGVtcyIsImwiLCJyZWZyZXNoIiwiVGFiIiwiaGVpZ2h0RGF0YSIsInRhYnMiLCJkcm9wZG93biIsInRhYnNDb250ZW50Q29udGFpbmVyIiwiYWN0aXZlVGFiIiwiYWN0aXZlQ29udGVudCIsIm5leHRDb250ZW50IiwiY29udGFpbmVySGVpZ2h0IiwiZXF1YWxDb250ZW50cyIsIm5leHRIZWlnaHQiLCJhbmltYXRlSGVpZ2h0IiwidHJpZ2dlckVuZCIsImdldEFjdGl2ZVRhYiIsImFjdGl2ZVRhYnMiLCJnZXRBY3RpdmVDb250ZW50IiwiVG9hc3QiLCJ0b2FzdCIsImF1dG9oaWRlRGF0YSIsInNob3dDb21wbGV0ZSIsImF1dG9oaWRlIiwiaGlkZUNvbXBsZXRlIiwiZGlzcG9zZUNvbXBsZXRlIiwibm9UaW1lciIsIlRvb2x0aXAiLCJ0b29sdGlwIiwiZ2V0VGl0bGUiLCJyZW1vdmVUb29sVGlwIiwiY3JlYXRlVG9vbFRpcCIsInRvb2x0aXBNYXJrdXAiLCJ0b29sdGlwQXJyb3ciLCJ0b29sdGlwSW5uZXIiLCJ1cGRhdGVUb29sdGlwIiwic2hvd1Rvb2x0aXAiLCJ0b2dnbGVBY3Rpb24iLCJzaG93QWN0aW9uIiwiaGlkZUFjdGlvbiIsImNvbXBvbmVudHNJbml0IiwiaW5pdGlhbGl6ZURhdGFBUEkiLCJDb25zdHJ1Y3RvciIsImNvbGxlY3Rpb24iLCJpbml0Q2FsbGJhY2siLCJjb21wb25lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaW5pdFdyYXBwZXIiLCJyZW1vdmVFbGVtZW50RGF0YUFQSSIsIkNvbnN0cnVjdG9yTmFtZSIsInJlbW92ZURhdGFBUEkiLCJ2ZXJzaW9uIiwiVmVyc2lvbiIsImJpbmQiLCJmbiIsInRoaXNBcmciLCJhcmdzIiwiYXJndW1lbnRzIiwiaSIsImFwcGx5IiwidG9TdHJpbmciLCJwcm90b3R5cGUiLCJpc0FycmF5IiwidmFsIiwiaXNVbmRlZmluZWQiLCJpc0J1ZmZlciIsImNvbnN0cnVjdG9yIiwiaXNBcnJheUJ1ZmZlciIsImlzRm9ybURhdGEiLCJGb3JtRGF0YSIsImlzQXJyYXlCdWZmZXJWaWV3IiwiQXJyYXlCdWZmZXIiLCJpc1ZpZXciLCJidWZmZXIiLCJpc1N0cmluZyIsImlzTnVtYmVyIiwiaXNPYmplY3QiLCJpc1BsYWluT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJpc0RhdGUiLCJpc0ZpbGUiLCJpc0Jsb2IiLCJpc0Z1bmN0aW9uIiwiaXNTdHJlYW0iLCJwaXBlIiwiaXNVUkxTZWFyY2hQYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJzdHIiLCJpc1N0YW5kYXJkQnJvd3NlckVudiIsInByb2R1Y3QiLCJmb3JFYWNoIiwib2JqIiwiaGFzT3duUHJvcGVydHkiLCJtZXJnZSIsImFzc2lnblZhbHVlIiwiZXh0ZW5kIiwiYSIsImIiLCJzdHJpcEJPTSIsImNoYXJDb2RlQXQiLCJlbmNvZGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJidWlsZFVSTCIsInVybCIsInBhcmFtcyIsInBhcmFtc1NlcmlhbGl6ZXIiLCJzZXJpYWxpemVkUGFyYW1zIiwidXRpbHMiLCJwYXJ0cyIsInNlcmlhbGl6ZSIsInBhcnNlVmFsdWUiLCJ2IiwidG9JU09TdHJpbmciLCJKU09OIiwic3RyaW5naWZ5Iiwiam9pbiIsImhhc2htYXJrSW5kZXgiLCJJbnRlcmNlcHRvck1hbmFnZXIiLCJoYW5kbGVycyIsInVzZSIsImZ1bGZpbGxlZCIsInJlamVjdGVkIiwiZWplY3QiLCJmb3JFYWNoSGFuZGxlciIsInRyYW5zZm9ybURhdGEiLCJkYXRhIiwiaGVhZGVycyIsImZucyIsInRyYW5zZm9ybSIsImlzQ2FuY2VsIiwidmFsdWUiLCJfX0NBTkNFTF9fIiwibm9ybWFsaXplSGVhZGVyTmFtZSIsIm5vcm1hbGl6ZWROYW1lIiwicHJvY2Vzc0hlYWRlciIsIm5hbWUiLCJ0b1VwcGVyQ2FzZSIsImVuaGFuY2VFcnJvciIsImVycm9yIiwiY29uZmlnIiwiY29kZSIsInJlcXVlc3QiLCJyZXNwb25zZSIsImlzQXhpb3NFcnJvciIsInRvSlNPTiIsIm1lc3NhZ2UiLCJkZXNjcmlwdGlvbiIsIm51bWJlciIsImZpbGVOYW1lIiwibGluZU51bWJlciIsImNvbHVtbk51bWJlciIsInN0YWNrIiwiY3JlYXRlRXJyb3IiLCJFcnJvciIsInNldHRsZSIsInJlc29sdmUiLCJyZWplY3QiLCJ2YWxpZGF0ZVN0YXR1cyIsInN0YXR1cyIsInN0YW5kYXJkQnJvd3NlckVudiIsIndyaXRlIiwiZXhwaXJlcyIsInBhdGgiLCJkb21haW4iLCJzZWN1cmUiLCJjb29raWUiLCJEYXRlIiwidG9HTVRTdHJpbmciLCJyZWFkIiwibWF0Y2giLCJSZWdFeHAiLCJkZWNvZGVVUklDb21wb25lbnQiLCJub3ciLCJub25TdGFuZGFyZEJyb3dzZXJFbnYiLCJpc0Fic29sdXRlVVJMIiwiY29tYmluZVVSTHMiLCJiYXNlVVJMIiwicmVsYXRpdmVVUkwiLCJidWlsZEZ1bGxQYXRoIiwicmVxdWVzdGVkVVJMIiwiaWdub3JlRHVwbGljYXRlT2YiLCJwYXJzZUhlYWRlcnMiLCJwYXJzZWQiLCJzcGxpdCIsInBhcnNlciIsImxpbmUiLCJzdWJzdHIiLCJ0b0xvd2VyQ2FzZSIsIm1zaWUiLCJ1cmxQYXJzaW5nTm9kZSIsIm9yaWdpblVSTCIsInJlc29sdmVVUkwiLCJwcm90b2NvbCIsImhvc3QiLCJzZWFyY2giLCJoYXNoIiwiaG9zdG5hbWUiLCJwb3J0IiwicGF0aG5hbWUiLCJsb2NhdGlvbiIsImlzVVJMU2FtZU9yaWdpbiIsInJlcXVlc3RVUkwiLCJ4aHJBZGFwdGVyIiwiUHJvbWlzZSIsImRpc3BhdGNoWGhyUmVxdWVzdCIsInJlcXVlc3REYXRhIiwicmVxdWVzdEhlYWRlcnMiLCJYTUxIdHRwUmVxdWVzdCIsImF1dGgiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwidW5lc2NhcGUiLCJBdXRob3JpemF0aW9uIiwiYnRvYSIsImZ1bGxQYXRoIiwibWV0aG9kIiwib25yZWFkeXN0YXRlY2hhbmdlIiwiaGFuZGxlTG9hZCIsInJlYWR5U3RhdGUiLCJyZXNwb25zZVVSTCIsInJlc3BvbnNlSGVhZGVycyIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsInJlc3BvbnNlRGF0YSIsInJlc3BvbnNlVHlwZSIsInJlc3BvbnNlVGV4dCIsInN0YXR1c1RleHQiLCJvbmFib3J0IiwiaGFuZGxlQWJvcnQiLCJvbmVycm9yIiwiaGFuZGxlRXJyb3IiLCJvbnRpbWVvdXQiLCJoYW5kbGVUaW1lb3V0IiwidGltZW91dEVycm9yTWVzc2FnZSIsInhzcmZWYWx1ZSIsIndpdGhDcmVkZW50aWFscyIsInhzcmZDb29raWVOYW1lIiwiY29va2llcyIsInVuZGVmaW5lZCIsInhzcmZIZWFkZXJOYW1lIiwic2V0UmVxdWVzdEhlYWRlciIsIm9uRG93bmxvYWRQcm9ncmVzcyIsIm9uVXBsb2FkUHJvZ3Jlc3MiLCJ1cGxvYWQiLCJjYW5jZWxUb2tlbiIsInByb21pc2UiLCJ0aGVuIiwib25DYW5jZWxlZCIsImNhbmNlbCIsImFib3J0Iiwic2VuZCIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwic2V0Q29udGVudFR5cGVJZlVuc2V0IiwiZ2V0RGVmYXVsdEFkYXB0ZXIiLCJhZGFwdGVyIiwicmVxdWlyZSQkMCIsInByb2Nlc3MiLCJyZXF1aXJlJCQxIiwiZGVmYXVsdHMiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwidHJhbnNmb3JtUmVzcG9uc2UiLCJwYXJzZSIsIm1heENvbnRlbnRMZW5ndGgiLCJtYXhCb2R5TGVuZ3RoIiwiY29tbW9uIiwiZm9yRWFjaE1ldGhvZE5vRGF0YSIsImZvckVhY2hNZXRob2RXaXRoRGF0YSIsInRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQiLCJ0aHJvd0lmUmVxdWVzdGVkIiwiZGlzcGF0Y2hSZXF1ZXN0IiwiY2xlYW5IZWFkZXJDb25maWciLCJvbkFkYXB0ZXJSZXNvbHV0aW9uIiwib25BZGFwdGVyUmVqZWN0aW9uIiwicmVhc29uIiwibWVyZ2VDb25maWciLCJjb25maWcxIiwiY29uZmlnMiIsInZhbHVlRnJvbUNvbmZpZzJLZXlzIiwibWVyZ2VEZWVwUHJvcGVydGllc0tleXMiLCJkZWZhdWx0VG9Db25maWcyS2V5cyIsImRpcmVjdE1lcmdlS2V5cyIsImdldE1lcmdlZFZhbHVlIiwic291cmNlIiwibWVyZ2VEZWVwUHJvcGVydGllcyIsInByb3AiLCJ2YWx1ZUZyb21Db25maWcyIiwiZGVmYXVsdFRvQ29uZmlnMiIsImF4aW9zS2V5cyIsIm90aGVyS2V5cyIsImtleXMiLCJmaWx0ZXIiLCJmaWx0ZXJBeGlvc0tleXMiLCJBeGlvcyIsImluc3RhbmNlQ29uZmlnIiwiaW50ZXJjZXB0b3JzIiwiY2hhaW4iLCJ1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyIsImludGVyY2VwdG9yIiwidW5zaGlmdCIsInB1c2hSZXNwb25zZUludGVyY2VwdG9ycyIsInNoaWZ0IiwiZ2V0VXJpIiwiQ2FuY2VsIiwiQ2FuY2VsVG9rZW4iLCJleGVjdXRvciIsIlR5cGVFcnJvciIsInJlc29sdmVQcm9taXNlIiwicHJvbWlzZUV4ZWN1dG9yIiwidG9rZW4iLCJjIiwic3ByZWFkIiwiY2FsbGJhY2siLCJhcnIiLCJjcmVhdGVJbnN0YW5jZSIsImRlZmF1bHRDb25maWciLCJjb250ZXh0IiwiaW5zdGFuY2UiLCJheGlvcyIsImNyZWF0ZSIsInJlcXVpcmUkJDIiLCJhbGwiLCJwcm9taXNlcyIsInJlcXVpcmUkJDMiLCJhdHRyaWJ1dGVUb1N0cmluZyIsImF0dHJpYnV0ZSIsInRvZ2dsZUNsYXNzIiwiZWxlbSIsInJlbW92ZUNsYXNzIiwiY2xhc3NOYW1lcyIsImF4aW9zQ29uZmlnIiwiZ2V0Q2FydCIsImdldFByb2R1Y3QiLCJoYW5kbGUiLCJjbGVhckNhcnQiLCJwb3N0IiwidXBkYXRlQ2FydEZyb21Gb3JtIiwiZm9ybSIsImNoYW5nZUl0ZW1CeUtleU9ySWQiLCJrZXlPcklkIiwicXVhbnRpdHkiLCJyZW1vdmVJdGVtQnlLZXlPcklkIiwiY2hhbmdlSXRlbUJ5TGluZSIsInJlbW92ZUl0ZW1CeUxpbmUiLCJhZGRJdGVtIiwicHJvcGVydGllcyIsImFkZEl0ZW1Gcm9tRm9ybSIsInVwZGF0ZUNhcnRBdHRyaWJ1dGVzIiwiYXR0cmlidXRlcyIsInVwZGF0ZUNhcnROb3RlIiwibm90ZSIsIkdsaWRlciIsInNsaWRlc1RvU2hvdyIsInNsaWRlc1RvU2Nyb2xsIiwic2Nyb2xsTG9jayIsImRvdHMiLCJkcmFnZ2FibGUiLCJhcnJvd3MiLCJwcmV2IiwicmVzcG9uc2l2ZSIsImJyZWFrcG9pbnQiLCJzZXR0aW5ncyIsIml0ZW1XaWR0aCIsImV2ZW50IiwiY29uc29sZSIsImxvZyIsInN0b3BQcm9wYWdhdGlvbiIsIm9mZmNhbnZhc19pZCIsIm9mZmNhbnZhcyIsInNjcmVlbl9vdmVybGF5IiwibW9iaWxlX29mZmNhbnZhcyIsInQiLCJuIiwibW9kdWxlIiwidGhpcyIsInIiLCJvIiwiQSIsInJlY2FsY3VsYXRlIiwicmVzcG9uc2l2ZU9wdGlvbnMiLCJkb2NXaWR0aCIsInMiLCJicmVha0F0IiwiTyIsInVzZUNvbnRhaW5lckZvckJyZWFrcG9pbnRzIiwiaW5uZXJXaWR0aCIsImNvbHVtbnMiLCJtYXJnaW4iLCJtb2JpbGVGaXJzdCIsInUiLCJyb3dzIiwicCIsIk0iLCJjb2xzIiwiZGF0YXNldCIsIm1hY3lDb21wbGV0ZSIsInRtcFJvd3MiLCJmIiwibGFzdGNvbCIsIkMiLCJub2RlTmFtZSIsImJ5Q3NzIiwic2VsZWN0b3JzIiwic3Vic3RyaW5nIiwiZ2V0RWxlbWVudEJ5SWQiLCJtIiwicnVubmluZyIsImV2ZW50cyIsInJ1biIsImNsZWFyIiwiZCIsIm9uIiwiZW1pdCIsImciLCJuYXR1cmFsSGVpZ2h0IiwibmF0dXJhbFdpZHRoIiwid2lkdGgiLCJFIiwiY29tcGxldGUiLCJjb25zdGFudHMiLCJFVkVOVF9JTUFHRV9MT0FEIiwiaW1nIiwiRVZFTlRfSU1BR0VfRVJST1IiLCJFVkVOVF9JTUFHRV9DT01QTEVURSIsIkkiLCJFVkVOVF9SRVNJWkUiLCJxdWV1ZSIsIk4iLCJkZWJ1ZyIsIlQiLCJyZXNpemVyIiwiTCIsInVzZU93bkltYWdlTG9hZGVyIiwid2FpdEZvckltYWdlcyIsIkVWRU5UX0lOSVRJQUxJWkVEIiwiXyIsImdldFByb3BlcnR5VmFsdWUiLCJWIiwib2Zmc2V0UGFyZW50IiwidHJ1ZU9yZGVyIiwiRVZFTlRfUkVDQUxDVUxBVEVEIiwiUiIsImFzc2lnbiIsImsiLCJ1c2VJbWFnZUxvYWRlciIsIm9uSW5pdCIsImNhbmNlbExlZ2FjeSIsImZsb29yIiwicmFuZG9tIiwicSIsImluaXQiLCJ3YXJuIiwicmVjYWxjdWxhdGVPbkltYWdlTG9hZCIsInJ1bk9uSW1hZ2VMb2FkIiwicmVJbml0IiwibWFjeUluc3RhbmNlIiwiTWFjeSIsImRhdG9tYXIiLCJCU04iLCJhcGkiLCJhamF4QVBJQ3JlYXRvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7RUFBQTs7Ozs7RUFLQSxJQUFJQSxrQkFBa0IsR0FBRyxzQkFBc0JDLFFBQVEsQ0FBQ0MsSUFBVCxDQUFjQyxLQUFwQyxHQUE0QyxxQkFBNUMsR0FBb0UsZUFBN0Y7RUFFQSxJQUFJQyxpQkFBaUIsR0FBRyxzQkFBc0JILFFBQVEsQ0FBQ0MsSUFBVCxDQUFjQyxLQUFwQyxJQUE2Qyxn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
