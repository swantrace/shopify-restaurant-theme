(function (factory) {
  typeof define === 'function' && define.amd ? define('index', factory) :
  factory();
}((function () { 'use strict';

  /*!
    * Native JavaScript for Bootstrap v3.0.9 (https://thednp.github.io/bootstrap.native/)
    * Copyright 2015-2020 © dnp_theme
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

  window.datomar = {
    BSN: index,
    api: ajaxAPICreator({})
  };

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ib290c3RyYXAubmF0aXZlL2Rpc3QvYm9vdHN0cmFwLW5hdGl2ZS5lc20uanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvaGVscGVyLmpzIiwic3JjL3NjcmlwdHMvYWpheGFwaS5qcyIsInNyYy9zY3JpcHRzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICAqIE5hdGl2ZSBKYXZhU2NyaXB0IGZvciBCb290c3RyYXAgdjMuMC45IChodHRwczovL3RoZWRucC5naXRodWIuaW8vYm9vdHN0cmFwLm5hdGl2ZS8pXG4gICogQ29weXJpZ2h0IDIwMTUtMjAyMCDCqSBkbnBfdGhlbWVcbiAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90aGVkbnAvYm9vdHN0cmFwLm5hdGl2ZS9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICAqL1xudmFyIHRyYW5zaXRpb25FbmRFdmVudCA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID8gJ3dlYmtpdFRyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnO1xuXG52YXIgc3VwcG9ydFRyYW5zaXRpb24gPSAnd2Via2l0VHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAndHJhbnNpdGlvbicgaW4gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxudmFyIHRyYW5zaXRpb25EdXJhdGlvbiA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID8gJ3dlYmtpdFRyYW5zaXRpb25EdXJhdGlvbicgOiAndHJhbnNpdGlvbkR1cmF0aW9uJztcblxuZnVuY3Rpb24gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihlbGVtZW50KSB7XG4gIHZhciBkdXJhdGlvbiA9IHN1cHBvcnRUcmFuc2l0aW9uID8gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpW3RyYW5zaXRpb25EdXJhdGlvbl0pIDogMDtcbiAgZHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmICFpc05hTihkdXJhdGlvbikgPyBkdXJhdGlvbiAqIDEwMDAgOiAwO1xuICByZXR1cm4gZHVyYXRpb247XG59XG5cbmZ1bmN0aW9uIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGVsZW1lbnQsaGFuZGxlcil7XG4gIHZhciBjYWxsZWQgPSAwLCBkdXJhdGlvbiA9IGdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24oZWxlbWVudCk7XG4gIGR1cmF0aW9uID8gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCB0cmFuc2l0aW9uRW5kRXZlbnQsIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRXcmFwcGVyKGUpe1xuICAgICAgICAgICAgICAhY2FsbGVkICYmIGhhbmRsZXIoZSksIGNhbGxlZCA9IDE7XG4gICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHJhbnNpdGlvbkVuZEV2ZW50LCB0cmFuc2l0aW9uRW5kV3JhcHBlcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICA6IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICFjYWxsZWQgJiYgaGFuZGxlcigpLCBjYWxsZWQgPSAxOyB9LCAxNyk7XG59XG5cbmZ1bmN0aW9uIHF1ZXJ5RWxlbWVudChzZWxlY3RvciwgcGFyZW50KSB7XG4gIHZhciBsb29rVXAgPSBwYXJlbnQgJiYgcGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IGRvY3VtZW50O1xuICByZXR1cm4gc2VsZWN0b3IgaW5zdGFuY2VvZiBFbGVtZW50ID8gc2VsZWN0b3IgOiBsb29rVXAucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgY29tcG9uZW50TmFtZSwgcmVsYXRlZCkge1xuICB2YXIgT3JpZ2luYWxDdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCggZXZlbnROYW1lICsgJy5icy4nICsgY29tcG9uZW50TmFtZSwge2NhbmNlbGFibGU6IHRydWV9KTtcbiAgT3JpZ2luYWxDdXN0b21FdmVudC5yZWxhdGVkVGFyZ2V0ID0gcmVsYXRlZDtcbiAgcmV0dXJuIE9yaWdpbmFsQ3VzdG9tRXZlbnQ7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ3VzdG9tRXZlbnQoY3VzdG9tRXZlbnQpe1xuICB0aGlzICYmIHRoaXMuZGlzcGF0Y2hFdmVudChjdXN0b21FdmVudCk7XG59XG5cbmZ1bmN0aW9uIEFsZXJ0KGVsZW1lbnQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGFsZXJ0LFxuICAgIGNsb3NlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnY2xvc2UnLCdhbGVydCcpLFxuICAgIGNsb3NlZEN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2Nsb3NlZCcsJ2FsZXJ0Jyk7XG4gIGZ1bmN0aW9uIHRyaWdnZXJIYW5kbGVyKCkge1xuICAgIGFsZXJ0LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gZW11bGF0ZVRyYW5zaXRpb25FbmQoYWxlcnQsdHJhbnNpdGlvbkVuZEhhbmRsZXIpIDogdHJhbnNpdGlvbkVuZEhhbmRsZXIoKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKXtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGFsZXJ0ID0gZSAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLmFsZXJ0XCIpO1xuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXScsYWxlcnQpO1xuICAgIGVsZW1lbnQgJiYgYWxlcnQgJiYgKGVsZW1lbnQgPT09IGUudGFyZ2V0IHx8IGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpKSAmJiBzZWxmLmNsb3NlKCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZEhhbmRsZXIoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgYWxlcnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChhbGVydCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFsZXJ0LGNsb3NlZEN1c3RvbUV2ZW50KTtcbiAgfVxuICBzZWxmLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggYWxlcnQgJiYgZWxlbWVudCAmJiBhbGVydC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhbGVydCxjbG9zZUN1c3RvbUV2ZW50KTtcbiAgICAgIGlmICggY2xvc2VDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgIHNlbGYuZGlzcG9zZSgpO1xuICAgICAgYWxlcnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgdHJpZ2dlckhhbmRsZXIoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5BbGVydDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgYWxlcnQgPSBlbGVtZW50LmNsb3Nlc3QoJy5hbGVydCcpO1xuICBlbGVtZW50LkFsZXJ0ICYmIGVsZW1lbnQuQWxlcnQuZGlzcG9zZSgpO1xuICBpZiAoICFlbGVtZW50LkFsZXJ0ICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBzZWxmLmVsZW1lbnQgPSBlbGVtZW50O1xuICBlbGVtZW50LkFsZXJ0ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gQnV0dG9uKGVsZW1lbnQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLCBsYWJlbHMsXG4gICAgICBjaGFuZ2VDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdjaGFuZ2UnLCAnYnV0dG9uJyk7XG4gIGZ1bmN0aW9uIHRvZ2dsZShlKSB7XG4gICAgdmFyIGlucHV0LFxuICAgICAgICBsYWJlbCA9IGUudGFyZ2V0LnRhZ05hbWUgPT09ICdMQUJFTCcgPyBlLnRhcmdldFxuICAgICAgICAgICAgICA6IGUudGFyZ2V0LmNsb3Nlc3QoJ0xBQkVMJykgPyBlLnRhcmdldC5jbG9zZXN0KCdMQUJFTCcpIDogbnVsbDtcbiAgICBpbnB1dCA9IGxhYmVsICYmIGxhYmVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdO1xuICAgIGlmICggIWlucHV0ICkgeyByZXR1cm47IH1cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoaW5wdXQsIGNoYW5nZUN1c3RvbUV2ZW50KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgY2hhbmdlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaW5wdXQudHlwZSA9PT0gJ2NoZWNrYm94JyApIHtcbiAgICAgIGlmICggY2hhbmdlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICBpZiAoICFpbnB1dC5jaGVja2VkICkge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIWVsZW1lbnQudG9nZ2xlZCkge1xuICAgICAgICBlbGVtZW50LnRvZ2dsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIGlucHV0LnR5cGUgPT09ICdyYWRpbycgJiYgIWVsZW1lbnQudG9nZ2xlZCApIHtcbiAgICAgIGlmICggY2hhbmdlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICBpZiAoICFpbnB1dC5jaGVja2VkIHx8IChlLnNjcmVlblggPT09IDAgJiYgZS5zY3JlZW5ZID09IDApICkge1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZm9jdXMnKTtcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKCdjaGVja2VkJywnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgZWxlbWVudC50b2dnbGVkID0gdHJ1ZTtcbiAgICAgICAgQXJyYXkuZnJvbShsYWJlbHMpLm1hcChmdW5jdGlvbiAob3RoZXJMYWJlbCl7XG4gICAgICAgICAgdmFyIG90aGVySW5wdXQgPSBvdGhlckxhYmVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdO1xuICAgICAgICAgIGlmICggb3RoZXJMYWJlbCAhPT0gbGFiZWwgJiYgb3RoZXJMYWJlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICkgIHtcbiAgICAgICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChvdGhlcklucHV0LCBjaGFuZ2VDdXN0b21FdmVudCk7XG4gICAgICAgICAgICBvdGhlckxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgb3RoZXJJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgIG90aGVySW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHsgZWxlbWVudC50b2dnbGVkID0gZmFsc2U7IH0sIDUwICk7XG4gIH1cbiAgZnVuY3Rpb24ga2V5SGFuZGxlcihlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGtleSA9PT0gMzIgJiYgZS50YXJnZXQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgdG9nZ2xlKGUpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRTY3JvbGwoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBrZXkgPT09IDMyICYmIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBmdW5jdGlvbiBmb2N1c1RvZ2dsZShlKSB7XG4gICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdJTlBVVCcgKSB7XG4gICAgICB2YXIgYWN0aW9uID0gZS50eXBlID09PSAnZm9jdXNpbicgPyAnYWRkJyA6ICdyZW1vdmUnO1xuICAgICAgZS50YXJnZXQuY2xvc2VzdCgnLmJ0bicpLmNsYXNzTGlzdFthY3Rpb25dKCdmb2N1cycpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgnY2xpY2snLHRvZ2dsZSxmYWxzZSApO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgna2V5dXAnLGtleUhhbmRsZXIsZmFsc2UpLCBlbGVtZW50W2FjdGlvbl0oJ2tleWRvd24nLHByZXZlbnRTY3JvbGwsZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXSgnZm9jdXNpbicsZm9jdXNUb2dnbGUsZmFsc2UpLCBlbGVtZW50W2FjdGlvbl0oJ2ZvY3Vzb3V0Jyxmb2N1c1RvZ2dsZSxmYWxzZSk7XG4gIH1cbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkJ1dHRvbjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5CdXR0b24gJiYgZWxlbWVudC5CdXR0b24uZGlzcG9zZSgpO1xuICBsYWJlbHMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2J0bicpO1xuICBpZiAoIWxhYmVscy5sZW5ndGgpIHsgcmV0dXJuOyB9XG4gIGlmICggIWVsZW1lbnQuQnV0dG9uICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBlbGVtZW50LnRvZ2dsZWQgPSBmYWxzZTtcbiAgZWxlbWVudC5CdXR0b24gPSBzZWxmO1xuICBBcnJheS5mcm9tKGxhYmVscykubWFwKGZ1bmN0aW9uIChidG4pe1xuICAgICFidG4uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKVxuICAgICAgJiYgcXVlcnlFbGVtZW50KCdpbnB1dDpjaGVja2VkJyxidG4pXG4gICAgICAmJiBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYnRuLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJylcbiAgICAgICYmICFxdWVyeUVsZW1lbnQoJ2lucHV0OmNoZWNrZWQnLGJ0bilcbiAgICAgICYmIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgfSk7XG59XG5cbnZhciBtb3VzZUhvdmVyRXZlbnRzID0gKCdvbm1vdXNlbGVhdmUnIGluIGRvY3VtZW50KSA/IFsgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddIDogWyAnbW91c2VvdmVyJywgJ21vdXNlb3V0JyBdO1xuXG52YXIgc3VwcG9ydFBhc3NpdmUgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gd3JhcCgpe1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHdyYXAsIG9wdHMpO1xuICAgIH0sIG9wdHMpO1xuICB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4gcmVzdWx0O1xufSkoKTtcblxudmFyIHBhc3NpdmVIYW5kbGVyID0gc3VwcG9ydFBhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnRJblNjcm9sbFJhbmdlKGVsZW1lbnQpIHtcbiAgdmFyIGJjciA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB2aWV3cG9ydEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZXR1cm4gYmNyLnRvcCA8PSB2aWV3cG9ydEhlaWdodCAmJiBiY3IuYm90dG9tID49IDA7XG59XG5cbmZ1bmN0aW9uIENhcm91c2VsIChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICB2YXJzLCBvcHMsXG4gICAgc2xpZGVDdXN0b21FdmVudCwgc2xpZEN1c3RvbUV2ZW50LFxuICAgIHNsaWRlcywgbGVmdEFycm93LCByaWdodEFycm93LCBpbmRpY2F0b3IsIGluZGljYXRvcnM7XG4gIGZ1bmN0aW9uIHBhdXNlSGFuZGxlcigpIHtcbiAgICBpZiAoIG9wcy5pbnRlcnZhbCAhPT1mYWxzZSAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BhdXNlZCcpICkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKTtcbiAgICAgICF2YXJzLmlzU2xpZGluZyAmJiAoIGNsZWFySW50ZXJ2YWwodmFycy50aW1lciksIHZhcnMudGltZXIgPSBudWxsICk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlc3VtZUhhbmRsZXIoKSB7XG4gICAgaWYgKCBvcHMuaW50ZXJ2YWwgIT09IGZhbHNlICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncGF1c2VkJyk7XG4gICAgICAhdmFycy5pc1NsaWRpbmcgJiYgKCBjbGVhckludGVydmFsKHZhcnMudGltZXIpLCB2YXJzLnRpbWVyID0gbnVsbCApO1xuICAgICAgIXZhcnMuaXNTbGlkaW5nICYmIHNlbGYuY3ljbGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gaW5kaWNhdG9ySGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICB2YXIgZXZlbnRUYXJnZXQgPSBlLnRhcmdldDtcbiAgICBpZiAoIGV2ZW50VGFyZ2V0ICYmICFldmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmIGV2ZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zbGlkZS10bycpICkge1xuICAgICAgdmFycy5pbmRleCA9IHBhcnNlSW50KCBldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xpZGUtdG8nKSk7XG4gICAgfSBlbHNlIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgc2VsZi5zbGlkZVRvKCB2YXJzLmluZGV4ICk7XG4gIH1cbiAgZnVuY3Rpb24gY29udHJvbHNIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHZhciBldmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYgKCBldmVudFRhcmdldCA9PT0gcmlnaHRBcnJvdyApIHtcbiAgICAgIHZhcnMuaW5kZXgrKztcbiAgICB9IGVsc2UgaWYgKCBldmVudFRhcmdldCA9PT0gbGVmdEFycm93ICkge1xuICAgICAgdmFycy5pbmRleC0tO1xuICAgIH1cbiAgICBzZWxmLnNsaWRlVG8oIHZhcnMuaW5kZXggKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKHJlZikge1xuICAgIHZhciB3aGljaCA9IHJlZi53aGljaDtcbiAgICBpZiAodmFycy5pc1NsaWRpbmcpIHsgcmV0dXJuOyB9XG4gICAgc3dpdGNoICh3aGljaCkge1xuICAgICAgY2FzZSAzOTpcbiAgICAgICAgdmFycy5pbmRleCsrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzc6XG4gICAgICAgIHZhcnMuaW5kZXgtLTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuc2xpZGVUbyggdmFycy5pbmRleCApO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKCBvcHMucGF1c2UgJiYgb3BzLmludGVydmFsICkge1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzBdLCBwYXVzZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMV0sIHJlc3VtZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaHN0YXJ0JywgcGF1c2VIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2hlbmQnLCByZXN1bWVIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIH1cbiAgICBvcHMudG91Y2ggJiYgc2xpZGVzLmxlbmd0aCA+IDEgJiYgZWxlbWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHRvdWNoRG93bkhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgcmlnaHRBcnJvdyAmJiByaWdodEFycm93W2FjdGlvbl0oICdjbGljaycsIGNvbnRyb2xzSGFuZGxlcixmYWxzZSApO1xuICAgIGxlZnRBcnJvdyAmJiBsZWZ0QXJyb3dbYWN0aW9uXSggJ2NsaWNrJywgY29udHJvbHNIYW5kbGVyLGZhbHNlICk7XG4gICAgaW5kaWNhdG9yICYmIGluZGljYXRvclthY3Rpb25dKCAnY2xpY2snLCBpbmRpY2F0b3JIYW5kbGVyLGZhbHNlICk7XG4gICAgb3BzLmtleWJvYXJkICYmIHdpbmRvd1thY3Rpb25dKCAna2V5ZG93bicsIGtleUhhbmRsZXIsZmFsc2UgKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVUb3VjaEV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCAndG91Y2htb3ZlJywgdG91Y2hNb3ZlSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaGVuZCcsIHRvdWNoRW5kSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBmdW5jdGlvbiB0b3VjaERvd25IYW5kbGVyKGUpIHtcbiAgICBpZiAoIHZhcnMuaXNUb3VjaCApIHsgcmV0dXJuOyB9XG4gICAgdmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSApIHtcbiAgICAgIHZhcnMuaXNUb3VjaCA9IHRydWU7XG4gICAgICB0b2dnbGVUb3VjaEV2ZW50cygxKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hNb3ZlSGFuZGxlcihlKSB7XG4gICAgaWYgKCAhdmFycy5pc1RvdWNoICkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHJldHVybjsgfVxuICAgIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCBlLnR5cGUgPT09ICd0b3VjaG1vdmUnICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID4gMSApIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hFbmRIYW5kbGVyIChlKSB7XG4gICAgaWYgKCAhdmFycy5pc1RvdWNoIHx8IHZhcnMuaXNTbGlkaW5nICkgeyByZXR1cm4gfVxuICAgIHZhcnMudG91Y2hQb3NpdGlvbi5lbmRYID0gdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYIHx8IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgaWYgKCB2YXJzLmlzVG91Y2ggKSB7XG4gICAgICBpZiAoICghZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkgfHwgIWVsZW1lbnQuY29udGFpbnMoZS5yZWxhdGVkVGFyZ2V0KSApXG4gICAgICAgICAgJiYgTWF0aC5hYnModmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCAtIHZhcnMudG91Y2hQb3NpdGlvbi5lbmRYKSA8IDc1ICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA8IHZhcnMudG91Y2hQb3NpdGlvbi5zdGFydFggKSB7XG4gICAgICAgICAgdmFycy5pbmRleCsrO1xuICAgICAgICB9IGVsc2UgaWYgKCB2YXJzLnRvdWNoUG9zaXRpb24uY3VycmVudFggPiB2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYICkge1xuICAgICAgICAgIHZhcnMuaW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgICB2YXJzLmlzVG91Y2ggPSBmYWxzZTtcbiAgICAgICAgc2VsZi5zbGlkZVRvKHZhcnMuaW5kZXgpO1xuICAgICAgfVxuICAgICAgdG9nZ2xlVG91Y2hFdmVudHMoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2V0QWN0aXZlUGFnZShwYWdlSW5kZXgpIHtcbiAgICBBcnJheS5mcm9tKGluZGljYXRvcnMpLm1hcChmdW5jdGlvbiAoeCl7eC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTt9KTtcbiAgICBpbmRpY2F0b3JzW3BhZ2VJbmRleF0gJiYgaW5kaWNhdG9yc1twYWdlSW5kZXhdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICB9XG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRIYW5kbGVyKGUpe1xuICAgIGlmICh2YXJzLnRvdWNoUG9zaXRpb24pe1xuICAgICAgdmFyIG5leHQgPSB2YXJzLmluZGV4LFxuICAgICAgICAgIHRpbWVvdXQgPSBlICYmIGUudGFyZ2V0ICE9PSBzbGlkZXNbbmV4dF0gPyBlLmVsYXBzZWRUaW1lKjEwMDArMTAwIDogMjAsXG4gICAgICAgICAgYWN0aXZlSXRlbSA9IHNlbGYuZ2V0QWN0aXZlSW5kZXgoKSxcbiAgICAgICAgICBvcmllbnRhdGlvbiA9IHZhcnMuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAnbmV4dCcgOiAncHJldic7XG4gICAgICB2YXJzLmlzU2xpZGluZyAmJiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHZhcnMudG91Y2hQb3NpdGlvbil7XG4gICAgICAgICAgdmFycy5pc1NsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyBvcmllbnRhdGlvbikpO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZEN1c3RvbUV2ZW50KTtcbiAgICAgICAgICBpZiAoICFkb2N1bWVudC5oaWRkZW4gJiYgb3BzLmludGVydmFsICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICAgICAgICBzZWxmLmN5Y2xlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG4gIH1cbiAgc2VsZi5jeWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodmFycy50aW1lcikge1xuICAgICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICAgIHZhcnMudGltZXIgPSBudWxsO1xuICAgIH1cbiAgICB2YXJzLnRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGlkeCA9IHZhcnMuaW5kZXggfHwgc2VsZi5nZXRBY3RpdmVJbmRleCgpO1xuICAgICAgaXNFbGVtZW50SW5TY3JvbGxSYW5nZShlbGVtZW50KSAmJiAoaWR4KyssIHNlbGYuc2xpZGVUbyggaWR4ICkgKTtcbiAgICB9LCBvcHMuaW50ZXJ2YWwpO1xuICB9O1xuICBzZWxmLnNsaWRlVG8gPSBmdW5jdGlvbiAobmV4dCkge1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICB2YXIgYWN0aXZlSXRlbSA9IHNlbGYuZ2V0QWN0aXZlSW5kZXgoKSwgb3JpZW50YXRpb247XG4gICAgaWYgKCBhY3RpdmVJdGVtID09PSBuZXh0ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAgKCAoYWN0aXZlSXRlbSA8IG5leHQgKSB8fCAoYWN0aXZlSXRlbSA9PT0gMCAmJiBuZXh0ID09PSBzbGlkZXMubGVuZ3RoIC0xICkgKSB7XG4gICAgICB2YXJzLmRpcmVjdGlvbiA9ICdsZWZ0JztcbiAgICB9IGVsc2UgaWYgICggKGFjdGl2ZUl0ZW0gPiBuZXh0KSB8fCAoYWN0aXZlSXRlbSA9PT0gc2xpZGVzLmxlbmd0aCAtIDEgJiYgbmV4dCA9PT0gMCApICkge1xuICAgICAgdmFycy5kaXJlY3Rpb24gPSAncmlnaHQnO1xuICAgIH1cbiAgICBpZiAoIG5leHQgPCAwICkgeyBuZXh0ID0gc2xpZGVzLmxlbmd0aCAtIDE7IH1cbiAgICBlbHNlIGlmICggbmV4dCA+PSBzbGlkZXMubGVuZ3RoICl7IG5leHQgPSAwOyB9XG4gICAgb3JpZW50YXRpb24gPSB2YXJzLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ25leHQnIDogJ3ByZXYnO1xuICAgIHNsaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2xpZGUnLCAnY2Fyb3VzZWwnLCBzbGlkZXNbbmV4dF0pO1xuICAgIHNsaWRDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzbGlkJywgJ2Nhcm91c2VsJywgc2xpZGVzW25leHRdKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKHNsaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICB2YXJzLmluZGV4ID0gbmV4dDtcbiAgICB2YXJzLmlzU2xpZGluZyA9IHRydWU7XG4gICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICB2YXJzLnRpbWVyID0gbnVsbDtcbiAgICBzZXRBY3RpdmVQYWdlKCBuZXh0ICk7XG4gICAgaWYgKCBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKHNsaWRlc1tuZXh0XSkgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3NsaWRlJykgKSB7XG4gICAgICBzbGlkZXNbbmV4dF0uY2xhc3NMaXN0LmFkZCgoXCJjYXJvdXNlbC1pdGVtLVwiICsgb3JpZW50YXRpb24pKTtcbiAgICAgIHNsaWRlc1tuZXh0XS5vZmZzZXRXaWR0aDtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LmFkZCgoXCJjYXJvdXNlbC1pdGVtLVwiICsgKHZhcnMuZGlyZWN0aW9uKSkpO1xuICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoc2xpZGVzW25leHRdLCB0cmFuc2l0aW9uRW5kSGFuZGxlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIHNsaWRlc1tuZXh0XS5vZmZzZXRXaWR0aDtcbiAgICAgIHNsaWRlc1thY3RpdmVJdGVtXS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXJzLmlzU2xpZGluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoIG9wcy5pbnRlcnZhbCAmJiBlbGVtZW50ICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICAgICAgc2VsZi5jeWNsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkQ3VzdG9tRXZlbnQpO1xuICAgICAgfSwgMTAwICk7XG4gICAgfVxuICB9O1xuICBzZWxmLmdldEFjdGl2ZUluZGV4ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gQXJyYXkuZnJvbShzbGlkZXMpLmluZGV4T2YoZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1pdGVtIGFjdGl2ZScpWzBdKSB8fCAwOyB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGl0ZW1DbGFzc2VzID0gWydsZWZ0JywncmlnaHQnLCdwcmV2JywnbmV4dCddO1xuICAgIEFycmF5LmZyb20oc2xpZGVzKS5tYXAoZnVuY3Rpb24gKHNsaWRlLGlkeCkge1xuICAgICAgc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSAmJiBzZXRBY3RpdmVQYWdlKCBpZHggKTtcbiAgICAgIGl0ZW1DbGFzc2VzLm1hcChmdW5jdGlvbiAoY2xzKSB7IHJldHVybiBzbGlkZS5jbGFzc0xpc3QucmVtb3ZlKChcImNhcm91c2VsLWl0ZW0tXCIgKyBjbHMpKTsgfSk7XG4gICAgfSk7XG4gICAgY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKTtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICB2YXJzID0ge307XG4gICAgb3BzID0ge307XG4gICAgZGVsZXRlIGVsZW1lbnQuQ2Fyb3VzZWw7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoIGVsZW1lbnQgKTtcbiAgZWxlbWVudC5DYXJvdXNlbCAmJiBlbGVtZW50LkNhcm91c2VsLmRpc3Bvc2UoKTtcbiAgc2xpZGVzID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1pdGVtJyk7XG4gIGxlZnRBcnJvdyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtY29udHJvbC1wcmV2JylbMF07XG4gIHJpZ2h0QXJyb3cgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWNvbnRyb2wtbmV4dCcpWzBdO1xuICBpbmRpY2F0b3IgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWluZGljYXRvcnMnKVswXTtcbiAgaW5kaWNhdG9ycyA9IGluZGljYXRvciAmJiBpbmRpY2F0b3IuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIFwiTElcIiApIHx8IFtdO1xuICBpZiAoc2xpZGVzLmxlbmd0aCA8IDIpIHsgcmV0dXJuIH1cbiAgdmFyXG4gICAgaW50ZXJ2YWxBdHRyaWJ1dGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnRlcnZhbCcpLFxuICAgIGludGVydmFsRGF0YSA9IGludGVydmFsQXR0cmlidXRlID09PSAnZmFsc2UnID8gMCA6IHBhcnNlSW50KGludGVydmFsQXR0cmlidXRlKSxcbiAgICB0b3VjaERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10b3VjaCcpID09PSAnZmFsc2UnID8gMCA6IDEsXG4gICAgcGF1c2VEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF1c2UnKSA9PT0gJ2hvdmVyJyB8fCBmYWxzZSxcbiAgICBrZXlib2FyZERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1rZXlib2FyZCcpID09PSAndHJ1ZScgfHwgZmFsc2UsXG4gICAgaW50ZXJ2YWxPcHRpb24gPSBvcHRpb25zLmludGVydmFsLFxuICAgIHRvdWNoT3B0aW9uID0gb3B0aW9ucy50b3VjaDtcbiAgb3BzID0ge307XG4gIG9wcy5rZXlib2FyZCA9IG9wdGlvbnMua2V5Ym9hcmQgPT09IHRydWUgfHwga2V5Ym9hcmREYXRhO1xuICBvcHMucGF1c2UgPSAob3B0aW9ucy5wYXVzZSA9PT0gJ2hvdmVyJyB8fCBwYXVzZURhdGEpID8gJ2hvdmVyJyA6IGZhbHNlO1xuICBvcHMudG91Y2ggPSB0b3VjaE9wdGlvbiB8fCB0b3VjaERhdGE7XG4gIG9wcy5pbnRlcnZhbCA9IHR5cGVvZiBpbnRlcnZhbE9wdGlvbiA9PT0gJ251bWJlcicgPyBpbnRlcnZhbE9wdGlvblxuICAgICAgICAgICAgICA6IGludGVydmFsT3B0aW9uID09PSBmYWxzZSB8fCBpbnRlcnZhbERhdGEgPT09IDAgfHwgaW50ZXJ2YWxEYXRhID09PSBmYWxzZSA/IDBcbiAgICAgICAgICAgICAgOiBpc05hTihpbnRlcnZhbERhdGEpID8gNTAwMFxuICAgICAgICAgICAgICA6IGludGVydmFsRGF0YTtcbiAgaWYgKHNlbGYuZ2V0QWN0aXZlSW5kZXgoKTwwKSB7XG4gICAgc2xpZGVzLmxlbmd0aCAmJiBzbGlkZXNbMF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgaW5kaWNhdG9ycy5sZW5ndGggJiYgc2V0QWN0aXZlUGFnZSgwKTtcbiAgfVxuICB2YXJzID0ge307XG4gIHZhcnMuZGlyZWN0aW9uID0gJ2xlZnQnO1xuICB2YXJzLmluZGV4ID0gMDtcbiAgdmFycy50aW1lciA9IG51bGw7XG4gIHZhcnMuaXNTbGlkaW5nID0gZmFsc2U7XG4gIHZhcnMuaXNUb3VjaCA9IGZhbHNlO1xuICB2YXJzLnRvdWNoUG9zaXRpb24gPSB7XG4gICAgc3RhcnRYIDogMCxcbiAgICBjdXJyZW50WCA6IDAsXG4gICAgZW5kWCA6IDBcbiAgfTtcbiAgdG9nZ2xlRXZlbnRzKDEpO1xuICBpZiAoIG9wcy5pbnRlcnZhbCApeyBzZWxmLmN5Y2xlKCk7IH1cbiAgZWxlbWVudC5DYXJvdXNlbCA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIENvbGxhcHNlKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgYWNjb3JkaW9uID0gbnVsbCxcbiAgICAgIGNvbGxhcHNlID0gbnVsbCxcbiAgICAgIGFjdGl2ZUNvbGxhcHNlLFxuICAgICAgYWN0aXZlRWxlbWVudCxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudDtcbiAgZnVuY3Rpb24gb3BlbkFjdGlvbihjb2xsYXBzZUVsZW1lbnQsIHRvZ2dsZSkge1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgY29sbGFwc2VFbGVtZW50LmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzZScpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29sbGFwc2VFbGVtZW50LnNjcm9sbEhlaWdodCkgKyBcInB4XCI7XG4gICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoY29sbGFwc2VFbGVtZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCd0cnVlJyk7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywndHJ1ZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNpbmcnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZScpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlQWN0aW9uKGNvbGxhcHNlRWxlbWVudCwgdG9nZ2xlKSB7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29sbGFwc2VFbGVtZW50LnNjcm9sbEhlaWdodCkgKyBcInB4XCI7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlJyk7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzBweCc7XG4gICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoY29sbGFwc2VFbGVtZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCdmYWxzZScpO1xuICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ2ZhbHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gICAgfSk7XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlICYmIGUudGFyZ2V0LnRhZ05hbWUgPT09ICdBJyB8fCBlbGVtZW50LnRhZ05hbWUgPT09ICdBJykge2UucHJldmVudERlZmF1bHQoKTt9XG4gICAgaWYgKGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpIHx8IGUudGFyZ2V0ID09PSBlbGVtZW50KSB7XG4gICAgICBpZiAoIWNvbGxhcHNlLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7IHNlbGYuc2hvdygpOyB9XG4gICAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgICB9XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIGNvbGxhcHNlLmlzQW5pbWF0aW5nICkgeyByZXR1cm47IH1cbiAgICBjbG9zZUFjdGlvbihjb2xsYXBzZSxlbGVtZW50KTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICB9O1xuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBhY2NvcmRpb24gKSB7XG4gICAgICBhY3RpdmVDb2xsYXBzZSA9IGFjY29yZGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY29sbGFwc2Ugc2hvd1wiKVswXTtcbiAgICAgIGFjdGl2ZUVsZW1lbnQgPSBhY3RpdmVDb2xsYXBzZSAmJiAocXVlcnlFbGVtZW50KChcIltkYXRhLXRhcmdldD1cXFwiI1wiICsgKGFjdGl2ZUNvbGxhcHNlLmlkKSArIFwiXFxcIl1cIiksYWNjb3JkaW9uKVxuICAgICAgICAgICAgICAgICAgICB8fCBxdWVyeUVsZW1lbnQoKFwiW2hyZWY9XFxcIiNcIiArIChhY3RpdmVDb2xsYXBzZS5pZCkgKyBcIlxcXCJdXCIpLGFjY29yZGlvbikgKTtcbiAgICB9XG4gICAgaWYgKCAhY29sbGFwc2UuaXNBbmltYXRpbmcgKSB7XG4gICAgICBpZiAoIGFjdGl2ZUVsZW1lbnQgJiYgYWN0aXZlQ29sbGFwc2UgIT09IGNvbGxhcHNlICkge1xuICAgICAgICBjbG9zZUFjdGlvbihhY3RpdmVDb2xsYXBzZSxhY3RpdmVFbGVtZW50KTtcbiAgICAgICAgYWN0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZWQnKTtcbiAgICAgIH1cbiAgICAgIG9wZW5BY3Rpb24oY29sbGFwc2UsZWxlbWVudCk7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlZCcpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYudG9nZ2xlLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5Db2xsYXBzZTtcbiAgfTtcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICAgIGVsZW1lbnQuQ29sbGFwc2UgJiYgZWxlbWVudC5Db2xsYXBzZS5kaXNwb3NlKCk7XG4gICAgdmFyIGFjY29yZGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQnKTtcbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdjb2xsYXBzZScpO1xuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAnY29sbGFwc2UnKTtcbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICdjb2xsYXBzZScpO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdjb2xsYXBzZScpO1xuICAgIGNvbGxhcHNlID0gcXVlcnlFbGVtZW50KG9wdGlvbnMudGFyZ2V0IHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuICAgIGNvbGxhcHNlLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgYWNjb3JkaW9uID0gZWxlbWVudC5jbG9zZXN0KG9wdGlvbnMucGFyZW50IHx8IGFjY29yZGlvbkRhdGEpO1xuICAgIGlmICggIWVsZW1lbnQuQ29sbGFwc2UgKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLnRvZ2dsZSxmYWxzZSk7XG4gICAgfVxuICAgIGVsZW1lbnQuQ29sbGFwc2UgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBzZXRGb2N1cyAoZWxlbWVudCl7XG4gIGVsZW1lbnQuZm9jdXMgPyBlbGVtZW50LmZvY3VzKCkgOiBlbGVtZW50LnNldEFjdGl2ZSgpO1xufVxuXG5mdW5jdGlvbiBEcm9wZG93bihlbGVtZW50LG9wdGlvbikge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbCxcbiAgICAgIHBhcmVudCwgbWVudSwgbWVudUl0ZW1zID0gW10sXG4gICAgICBwZXJzaXN0O1xuICBmdW5jdGlvbiBwcmV2ZW50RW1wdHlBbmNob3IoYW5jaG9yKSB7XG4gICAgKGFuY2hvci5ocmVmICYmIGFuY2hvci5ocmVmLnNsaWNlKC0xKSA9PT0gJyMnIHx8IGFuY2hvci5wYXJlbnROb2RlICYmIGFuY2hvci5wYXJlbnROb2RlLmhyZWZcbiAgICAgICYmIGFuY2hvci5wYXJlbnROb2RlLmhyZWYuc2xpY2UoLTEpID09PSAnIycpICYmIHRoaXMucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVEaXNtaXNzKCkge1xuICAgIHZhciBhY3Rpb24gPSBlbGVtZW50Lm9wZW4gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgnY2xpY2snLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdrZXlkb3duJyxwcmV2ZW50U2Nyb2xsLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdrZXl1cCcsa2V5SGFuZGxlcixmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSgnZm9jdXMnLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBkaXNtaXNzSGFuZGxlcihlKSB7XG4gICAgdmFyIGV2ZW50VGFyZ2V0ID0gZS50YXJnZXQsXG4gICAgICAgICAgaGFzRGF0YSA9IGV2ZW50VGFyZ2V0ICYmIChldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgZXZlbnRUYXJnZXQucGFyZW50Tm9kZSAmJiBldmVudFRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBldmVudFRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKSk7XG4gICAgaWYgKCBlLnR5cGUgPT09ICdmb2N1cycgJiYgKGV2ZW50VGFyZ2V0ID09PSBlbGVtZW50IHx8IGV2ZW50VGFyZ2V0ID09PSBtZW51IHx8IG1lbnUuY29udGFpbnMoZXZlbnRUYXJnZXQpICkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICggKGV2ZW50VGFyZ2V0ID09PSBtZW51IHx8IG1lbnUuY29udGFpbnMoZXZlbnRUYXJnZXQpKSAmJiAocGVyc2lzdCB8fCBoYXNEYXRhKSApIHsgcmV0dXJuOyB9XG4gICAgZWxzZSB7XG4gICAgICByZWxhdGVkVGFyZ2V0ID0gZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQgfHwgZWxlbWVudC5jb250YWlucyhldmVudFRhcmdldCkgPyBlbGVtZW50IDogbnVsbDtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgICBwcmV2ZW50RW1wdHlBbmNob3IuY2FsbChlLGV2ZW50VGFyZ2V0KTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgIHNlbGYuc2hvdygpO1xuICAgIHByZXZlbnRFbXB0eUFuY2hvci5jYWxsKGUsZS50YXJnZXQpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRTY3JvbGwoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBpZigga2V5ID09PSAzOCB8fCBrZXkgPT09IDQwICkgeyBlLnByZXZlbnREZWZhdWx0KCk7IH1cbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKGUpIHtcbiAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGUsXG4gICAgICAgIGFjdGl2ZUl0ZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50LFxuICAgICAgICBpc1NhbWVFbGVtZW50ID0gYWN0aXZlSXRlbSA9PT0gZWxlbWVudCxcbiAgICAgICAgaXNJbnNpZGVNZW51ID0gbWVudS5jb250YWlucyhhY3RpdmVJdGVtKSxcbiAgICAgICAgaXNNZW51SXRlbSA9IGFjdGl2ZUl0ZW0ucGFyZW50Tm9kZSA9PT0gbWVudSB8fCBhY3RpdmVJdGVtLnBhcmVudE5vZGUucGFyZW50Tm9kZSA9PT0gbWVudSxcbiAgICAgICAgaWR4ID0gbWVudUl0ZW1zLmluZGV4T2YoYWN0aXZlSXRlbSk7XG4gICAgaWYgKCBpc01lbnVJdGVtICkge1xuICAgICAgaWR4ID0gaXNTYW1lRWxlbWVudCA/IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBrZXkgPT09IDM4ID8gKGlkeD4xP2lkeC0xOjApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5ID09PSA0MCA/IChpZHg8bWVudUl0ZW1zLmxlbmd0aC0xP2lkeCsxOmlkeCkgOiBpZHg7XG4gICAgICBtZW51SXRlbXNbaWR4XSAmJiBzZXRGb2N1cyhtZW51SXRlbXNbaWR4XSk7XG4gICAgfVxuICAgIGlmICggKG1lbnVJdGVtcy5sZW5ndGggJiYgaXNNZW51SXRlbVxuICAgICAgICAgIHx8ICFtZW51SXRlbXMubGVuZ3RoICYmIChpc0luc2lkZU1lbnUgfHwgaXNTYW1lRWxlbWVudClcbiAgICAgICAgICB8fCAhaXNJbnNpZGVNZW51IClcbiAgICAgICAgICAmJiBlbGVtZW50Lm9wZW4gJiYga2V5ID09PSAyN1xuICAgICkge1xuICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgIH1cbiAgfVxuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1lbnUuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIHBhcmVudC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLHRydWUpO1xuICAgIGVsZW1lbnQub3BlbiA9IHRydWU7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldEZvY3VzKCBtZW51LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdJTlBVVCcpWzBdIHx8IGVsZW1lbnQgKTtcbiAgICAgIHRvZ2dsZURpc21pc3MoKTtcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCggJ3Nob3duJywgJ2Ryb3Bkb3duJywgcmVsYXRlZFRhcmdldCk7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgICB9LDEpO1xuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1lbnUuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIHBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLGZhbHNlKTtcbiAgICBlbGVtZW50Lm9wZW4gPSBmYWxzZTtcbiAgICB0b2dnbGVEaXNtaXNzKCk7XG4gICAgc2V0Rm9jdXMoZWxlbWVudCk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBlbGVtZW50LkRyb3Bkb3duICYmIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgfSwxKTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH07XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgZWxlbWVudC5vcGVuKSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgZWxzZSB7IHNlbGYuc2hvdygpOyB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmIGVsZW1lbnQub3BlbikgeyBzZWxmLmhpZGUoKTsgfVxuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gICAgZGVsZXRlIGVsZW1lbnQuRHJvcGRvd247XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuRHJvcGRvd24gJiYgZWxlbWVudC5Ecm9wZG93bi5kaXNwb3NlKCk7XG4gIHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgbWVudSA9IHF1ZXJ5RWxlbWVudCgnLmRyb3Bkb3duLW1lbnUnLCBwYXJlbnQpO1xuICBBcnJheS5mcm9tKG1lbnUuY2hpbGRyZW4pLm1hcChmdW5jdGlvbiAoY2hpbGQpe1xuICAgIGNoaWxkLmNoaWxkcmVuLmxlbmd0aCAmJiAoY2hpbGQuY2hpbGRyZW5bMF0udGFnTmFtZSA9PT0gJ0EnICYmIG1lbnVJdGVtcy5wdXNoKGNoaWxkLmNoaWxkcmVuWzBdKSk7XG4gICAgY2hpbGQudGFnTmFtZSA9PT0gJ0EnICYmIG1lbnVJdGVtcy5wdXNoKGNoaWxkKTtcbiAgfSk7XG4gIGlmICggIWVsZW1lbnQuRHJvcGRvd24gKSB7XG4gICAgISgndGFiaW5kZXgnIGluIG1lbnUpICYmIG1lbnUuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBwZXJzaXN0ID0gb3B0aW9uID09PSB0cnVlIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBlcnNpc3QnKSA9PT0gJ3RydWUnIHx8IGZhbHNlO1xuICBlbGVtZW50Lm9wZW4gPSBmYWxzZTtcbiAgZWxlbWVudC5Ecm9wZG93biA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIE1vZGFsKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLCBtb2RhbCxcbiAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgc2hvd25DdXN0b21FdmVudCxcbiAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgcmVsYXRlZFRhcmdldCA9IG51bGwsXG4gICAgc2Nyb2xsQmFyV2lkdGgsXG4gICAgb3ZlcmxheSxcbiAgICBvdmVybGF5RGVsYXksXG4gICAgZml4ZWRJdGVtcyxcbiAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gc2V0U2Nyb2xsYmFyKCkge1xuICAgIHZhciBvcGVuTW9kYWwgPSBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygnbW9kYWwtb3BlbicpLFxuICAgICAgICBib2R5UGFkID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5wYWRkaW5nUmlnaHQpLFxuICAgICAgICBib2R5T3ZlcmZsb3cgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICE9PSBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCxcbiAgICAgICAgbW9kYWxPdmVyZmxvdyA9IG1vZGFsLmNsaWVudEhlaWdodCAhPT0gbW9kYWwuc2Nyb2xsSGVpZ2h0O1xuICAgIHNjcm9sbEJhcldpZHRoID0gbWVhc3VyZVNjcm9sbGJhcigpO1xuICAgIG1vZGFsLnN0eWxlLnBhZGRpbmdSaWdodCA9ICFtb2RhbE92ZXJmbG93ICYmIHNjcm9sbEJhcldpZHRoID8gKHNjcm9sbEJhcldpZHRoICsgXCJweFwiKSA6ICcnO1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gbW9kYWxPdmVyZmxvdyB8fCBib2R5T3ZlcmZsb3cgPyAoKGJvZHlQYWQgKyAob3Blbk1vZGFsID8gMDpzY3JvbGxCYXJXaWR0aCkpICsgXCJweFwiKSA6ICcnO1xuICAgIGZpeGVkSXRlbXMubGVuZ3RoICYmIGZpeGVkSXRlbXMubWFwKGZ1bmN0aW9uIChmaXhlZCl7XG4gICAgICB2YXIgaXRlbVBhZCA9IGdldENvbXB1dGVkU3R5bGUoZml4ZWQpLnBhZGRpbmdSaWdodDtcbiAgICAgIGZpeGVkLnN0eWxlLnBhZGRpbmdSaWdodCA9IG1vZGFsT3ZlcmZsb3cgfHwgYm9keU92ZXJmbG93ID8gKChwYXJzZUludChpdGVtUGFkKSArIChvcGVuTW9kYWw/MDpzY3JvbGxCYXJXaWR0aCkpICsgXCJweFwiKSA6ICgocGFyc2VJbnQoaXRlbVBhZCkpICsgXCJweFwiKTtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiByZXNldFNjcm9sbGJhcigpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIG1vZGFsLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIGZpeGVkSXRlbXMubGVuZ3RoICYmIGZpeGVkSXRlbXMubWFwKGZ1bmN0aW9uIChmaXhlZCl7XG4gICAgICBmaXhlZC5zdHlsZS5wYWRkaW5nUmlnaHQgPSAnJztcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBtZWFzdXJlU2Nyb2xsYmFyKCkge1xuICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwgd2lkdGhWYWx1ZTtcbiAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gJ21vZGFsLXNjcm9sbGJhci1tZWFzdXJlJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbERpdik7XG4gICAgd2lkdGhWYWx1ZSA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aDtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcm9sbERpdik7XG4gICAgcmV0dXJuIHdpZHRoVmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlT3ZlcmxheSgpIHtcbiAgICB2YXIgbmV3T3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy5tb2RhbC1iYWNrZHJvcCcpO1xuICAgIGlmICggb3ZlcmxheSA9PT0gbnVsbCApIHtcbiAgICAgIG5ld092ZXJsYXkuc2V0QXR0cmlidXRlKCdjbGFzcycsICdtb2RhbC1iYWNrZHJvcCcgKyAob3BzLmFuaW1hdGlvbiA/ICcgZmFkZScgOiAnJykpO1xuICAgICAgb3ZlcmxheSA9IG5ld092ZXJsYXk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXkpO1xuICAgIH1cbiAgICByZXR1cm4gb3ZlcmxheTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVPdmVybGF5ICgpIHtcbiAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcubW9kYWwtYmFja2Ryb3AnKTtcbiAgICBpZiAoIG92ZXJsYXkgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXSApIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3ZlcmxheSk7IG92ZXJsYXkgPSBudWxsO1xuICAgIH1cbiAgICBvdmVybGF5ID09PSBudWxsICYmIChkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLW9wZW4nKSwgcmVzZXRTY3JvbGxiYXIoKSk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYudXBkYXRlLCBwYXNzaXZlSGFuZGxlcik7XG4gICAgbW9kYWxbYWN0aW9uXSggJ2NsaWNrJyxkaXNtaXNzSGFuZGxlcixmYWxzZSk7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSggJ2tleWRvd24nLGtleUhhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGJlZm9yZVNob3coKSB7XG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgc2V0U2Nyb2xsYmFyKCk7XG4gICAgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsIHNob3cnKVswXSAmJiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLW9wZW4nKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKG1vZGFsLCB0cmlnZ2VyU2hvdykgOiB0cmlnZ2VyU2hvdygpO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJTaG93KCkge1xuICAgIHNldEZvY3VzKG1vZGFsKTtcbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ21vZGFsJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VySGlkZShmb3JjZSkge1xuICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICBlbGVtZW50ICYmIChzZXRGb2N1cyhlbGVtZW50KSk7XG4gICAgb3ZlcmxheSA9IHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWJhY2tkcm9wJyk7XG4gICAgaWYgKGZvcmNlICE9PSAxICYmIG92ZXJsYXkgJiYgb3ZlcmxheS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdKSB7XG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKG92ZXJsYXkscmVtb3ZlT3ZlcmxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZU92ZXJsYXkoKTtcbiAgICB9XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAnbW9kYWwnKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGlmICggbW9kYWwuaXNBbmltYXRpbmcgKSB7IHJldHVybjsgfVxuICAgIHZhciBjbGlja1RhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICBtb2RhbElEID0gXCIjXCIgKyAobW9kYWwuZ2V0QXR0cmlidXRlKCdpZCcpKSxcbiAgICAgICAgdGFyZ2V0QXR0clZhbHVlID0gY2xpY2tUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGNsaWNrVGFyZ2V0LmdldEF0dHJpYnV0ZSgnaHJlZicpLFxuICAgICAgICBlbGVtQXR0clZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoICFtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKVxuICAgICAgICAmJiAoY2xpY2tUYXJnZXQgPT09IGVsZW1lbnQgJiYgdGFyZ2V0QXR0clZhbHVlID09PSBtb2RhbElEXG4gICAgICAgIHx8IGVsZW1lbnQuY29udGFpbnMoY2xpY2tUYXJnZXQpICYmIGVsZW1BdHRyVmFsdWUgPT09IG1vZGFsSUQpICkge1xuICAgICAgbW9kYWwubW9kYWxUcmlnZ2VyID0gZWxlbWVudDtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgICAgc2VsZi5zaG93KCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIocmVmKSB7XG4gICAgdmFyIHdoaWNoID0gcmVmLndoaWNoO1xuICAgIGlmICghbW9kYWwuaXNBbmltYXRpbmcgJiYgb3BzLmtleWJvYXJkICYmIHdoaWNoID09IDI3ICYmIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGRpc21pc3NIYW5kbGVyKGUpIHtcbiAgICBpZiAoIG1vZGFsLmlzQW5pbWF0aW5nICkgeyByZXR1cm47IH1cbiAgICB2YXIgY2xpY2tUYXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgaGFzRGF0YSA9IGNsaWNrVGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kaXNtaXNzJykgPT09ICdtb2RhbCcsXG4gICAgICAgIHBhcmVudFdpdGhEYXRhID0gY2xpY2tUYXJnZXQuY2xvc2VzdCgnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJyk7XG4gICAgaWYgKCBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAoIHBhcmVudFdpdGhEYXRhIHx8IGhhc0RhdGFcbiAgICAgICAgfHwgY2xpY2tUYXJnZXQgPT09IG1vZGFsICYmIG9wcy5iYWNrZHJvcCAhPT0gJ3N0YXRpYycgKSApIHtcbiAgICAgIHNlbGYuaGlkZSgpOyByZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtzZWxmLmhpZGUoKTt9IGVsc2Uge3NlbGYuc2hvdygpO31cbiAgfTtcbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAhIW1vZGFsLmlzQW5pbWF0aW5nICkge3JldHVybn1cbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdtb2RhbCcsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRPcGVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdO1xuICAgIGlmIChjdXJyZW50T3BlbiAmJiBjdXJyZW50T3BlbiAhPT0gbW9kYWwpIHtcbiAgICAgIGN1cnJlbnRPcGVuLm1vZGFsVHJpZ2dlciAmJiBjdXJyZW50T3Blbi5tb2RhbFRyaWdnZXIuTW9kYWwuaGlkZSgpO1xuICAgICAgY3VycmVudE9wZW4uTW9kYWwgJiYgY3VycmVudE9wZW4uTW9kYWwuaGlkZSgpO1xuICAgIH1cbiAgICBpZiAoIG9wcy5iYWNrZHJvcCApIHtcbiAgICAgIG92ZXJsYXkgPSBjcmVhdGVPdmVybGF5KCk7XG4gICAgfVxuICAgIGlmICggb3ZlcmxheSAmJiAhY3VycmVudE9wZW4gJiYgIW92ZXJsYXkuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7XG4gICAgICBvdmVybGF5Lm9mZnNldFdpZHRoO1xuICAgICAgb3ZlcmxheURlbGF5ID0gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihvdmVybGF5KTtcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cbiAgICAhY3VycmVudE9wZW4gPyBzZXRUaW1lb3V0KCBiZWZvcmVTaG93LCBvdmVybGF5ICYmIG92ZXJsYXlEZWxheSA/IG92ZXJsYXlEZWxheTowICkgOiBiZWZvcmVTaG93KCk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uIChmb3JjZSkge1xuICAgIGlmICggIW1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge3JldHVybn1cbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCggJ2hpZGUnLCAnbW9kYWwnKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKCBoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbW9kYWwuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgJiYgZm9yY2UgIT09IDEgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChtb2RhbCwgdHJpZ2dlckhpZGUpIDogdHJpZ2dlckhpZGUoKTtcbiAgfTtcbiAgc2VsZi5zZXRDb250ZW50ID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICBxdWVyeUVsZW1lbnQoJy5tb2RhbC1jb250ZW50Jyxtb2RhbCkuaW5uZXJIVE1MID0gY29udGVudDtcbiAgfTtcbiAgc2VsZi51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBzZXRTY3JvbGxiYXIoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLmhpZGUoMSk7XG4gICAgaWYgKGVsZW1lbnQpIHtlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpOyBkZWxldGUgZWxlbWVudC5Nb2RhbDsgfVxuICAgIGVsc2Uge2RlbGV0ZSBtb2RhbC5Nb2RhbDt9XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIHZhciBjaGVja01vZGFsID0gcXVlcnlFbGVtZW50KCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpICk7XG4gIG1vZGFsID0gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGFsJykgPyBlbGVtZW50IDogY2hlY2tNb2RhbDtcbiAgZml4ZWRJdGVtcyA9IEFycmF5LmZyb20oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZml4ZWQtdG9wJykpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaXhlZC1ib3R0b20nKSkpO1xuICBpZiAoIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2RhbCcpICkgeyBlbGVtZW50ID0gbnVsbDsgfVxuICBlbGVtZW50ICYmIGVsZW1lbnQuTW9kYWwgJiYgZWxlbWVudC5Nb2RhbC5kaXNwb3NlKCk7XG4gIG1vZGFsICYmIG1vZGFsLk1vZGFsICYmIG1vZGFsLk1vZGFsLmRpc3Bvc2UoKTtcbiAgb3BzLmtleWJvYXJkID0gb3B0aW9ucy5rZXlib2FyZCA9PT0gZmFsc2UgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWtleWJvYXJkJykgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG4gIG9wcy5iYWNrZHJvcCA9IG9wdGlvbnMuYmFja2Ryb3AgPT09ICdzdGF0aWMnIHx8IG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1iYWNrZHJvcCcpID09PSAnc3RhdGljJyA/ICdzdGF0aWMnIDogdHJ1ZTtcbiAgb3BzLmJhY2tkcm9wID0gb3B0aW9ucy5iYWNrZHJvcCA9PT0gZmFsc2UgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJhY2tkcm9wJykgPT09ICdmYWxzZScgPyBmYWxzZSA6IG9wcy5iYWNrZHJvcDtcbiAgb3BzLmFuaW1hdGlvbiA9IG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gdHJ1ZSA6IGZhbHNlO1xuICBvcHMuY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcbiAgbW9kYWwuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgaWYgKCBlbGVtZW50ICYmICFlbGVtZW50Lk1vZGFsICkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgaWYgKCBvcHMuY29udGVudCApIHtcbiAgICBzZWxmLnNldENvbnRlbnQoIG9wcy5jb250ZW50LnRyaW0oKSApO1xuICB9XG4gIGlmIChlbGVtZW50KSB7XG4gICAgbW9kYWwubW9kYWxUcmlnZ2VyID0gZWxlbWVudDtcbiAgICBlbGVtZW50Lk1vZGFsID0gc2VsZjtcbiAgfSBlbHNlIHtcbiAgICBtb2RhbC5Nb2RhbCA9IHNlbGY7XG4gIH1cbn1cblxudmFyIG1vdXNlQ2xpY2tFdmVudHMgPSB7IGRvd246ICdtb3VzZWRvd24nLCB1cDogJ21vdXNldXAnIH07XG5cbmZ1bmN0aW9uIGdldFNjcm9sbCgpIHtcbiAgcmV0dXJuIHtcbiAgICB5IDogd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AsXG4gICAgeCA6IHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdFxuICB9XG59XG5cbmZ1bmN0aW9uIHN0eWxlVGlwKGxpbmssZWxlbWVudCxwb3NpdGlvbixwYXJlbnQpIHtcbiAgdmFyIHRpcFBvc2l0aW9ucyA9IC9cXGIodG9wfGJvdHRvbXxsZWZ0fHJpZ2h0KSsvLFxuICAgICAgZWxlbWVudERpbWVuc2lvbnMgPSB7IHcgOiBlbGVtZW50Lm9mZnNldFdpZHRoLCBoOiBlbGVtZW50Lm9mZnNldEhlaWdodCB9LFxuICAgICAgd2luZG93V2lkdGggPSAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgpLFxuICAgICAgd2luZG93SGVpZ2h0ID0gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQpLFxuICAgICAgcmVjdCA9IGxpbmsuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBzY3JvbGwgPSBwYXJlbnQgPT09IGRvY3VtZW50LmJvZHkgPyBnZXRTY3JvbGwoKSA6IHsgeDogcGFyZW50Lm9mZnNldExlZnQgKyBwYXJlbnQuc2Nyb2xsTGVmdCwgeTogcGFyZW50Lm9mZnNldFRvcCArIHBhcmVudC5zY3JvbGxUb3AgfSxcbiAgICAgIGxpbmtEaW1lbnNpb25zID0geyB3OiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LCBoOiByZWN0LmJvdHRvbSAtIHJlY3QudG9wIH0sXG4gICAgICBpc1BvcG92ZXIgPSBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncG9wb3ZlcicpLFxuICAgICAgYXJyb3cgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Fycm93JylbMF0sXG4gICAgICBoYWxmVG9wRXhjZWVkID0gcmVjdC50b3AgKyBsaW5rRGltZW5zaW9ucy5oLzIgLSBlbGVtZW50RGltZW5zaW9ucy5oLzIgPCAwLFxuICAgICAgaGFsZkxlZnRFeGNlZWQgPSByZWN0LmxlZnQgKyBsaW5rRGltZW5zaW9ucy53LzIgLSBlbGVtZW50RGltZW5zaW9ucy53LzIgPCAwLFxuICAgICAgaGFsZlJpZ2h0RXhjZWVkID0gcmVjdC5sZWZ0ICsgZWxlbWVudERpbWVuc2lvbnMudy8yICsgbGlua0RpbWVuc2lvbnMudy8yID49IHdpbmRvd1dpZHRoLFxuICAgICAgaGFsZkJvdHRvbUV4Y2VlZCA9IHJlY3QudG9wICsgZWxlbWVudERpbWVuc2lvbnMuaC8yICsgbGlua0RpbWVuc2lvbnMuaC8yID49IHdpbmRvd0hlaWdodCxcbiAgICAgIHRvcEV4Y2VlZCA9IHJlY3QudG9wIC0gZWxlbWVudERpbWVuc2lvbnMuaCA8IDAsXG4gICAgICBsZWZ0RXhjZWVkID0gcmVjdC5sZWZ0IC0gZWxlbWVudERpbWVuc2lvbnMudyA8IDAsXG4gICAgICBib3R0b21FeGNlZWQgPSByZWN0LnRvcCArIGVsZW1lbnREaW1lbnNpb25zLmggKyBsaW5rRGltZW5zaW9ucy5oID49IHdpbmRvd0hlaWdodCxcbiAgICAgIHJpZ2h0RXhjZWVkID0gcmVjdC5sZWZ0ICsgZWxlbWVudERpbWVuc2lvbnMudyArIGxpbmtEaW1lbnNpb25zLncgPj0gd2luZG93V2lkdGg7XG4gIHBvc2l0aW9uID0gKHBvc2l0aW9uID09PSAnbGVmdCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcpICYmIGxlZnRFeGNlZWQgJiYgcmlnaHRFeGNlZWQgPyAndG9wJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAndG9wJyAmJiB0b3BFeGNlZWQgPyAnYm90dG9tJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBib3R0b21FeGNlZWQgPyAndG9wJyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbGVmdEV4Y2VlZCA/ICdyaWdodCcgOiBwb3NpdGlvbjtcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiByaWdodEV4Y2VlZCA/ICdsZWZ0JyA6IHBvc2l0aW9uO1xuICB2YXIgdG9wUG9zaXRpb24sXG4gICAgbGVmdFBvc2l0aW9uLFxuICAgIGFycm93VG9wLFxuICAgIGFycm93TGVmdCxcbiAgICBhcnJvd1dpZHRoLFxuICAgIGFycm93SGVpZ2h0O1xuICBlbGVtZW50LmNsYXNzTmFtZS5pbmRleE9mKHBvc2l0aW9uKSA9PT0gLTEgJiYgKGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZSh0aXBQb3NpdGlvbnMscG9zaXRpb24pKTtcbiAgYXJyb3dXaWR0aCA9IGFycm93Lm9mZnNldFdpZHRoOyBhcnJvd0hlaWdodCA9IGFycm93Lm9mZnNldEhlaWdodDtcbiAgaWYgKCBwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnICkge1xuICAgIGlmICggcG9zaXRpb24gPT09ICdsZWZ0JyApIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3QubGVmdCArIHNjcm9sbC54IC0gZWxlbWVudERpbWVuc2lvbnMudyAtICggaXNQb3BvdmVyID8gYXJyb3dXaWR0aCA6IDAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdC5sZWZ0ICsgc2Nyb2xsLnggKyBsaW5rRGltZW5zaW9ucy53O1xuICAgIH1cbiAgICBpZiAoaGFsZlRvcEV4Y2VlZCkge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55O1xuICAgICAgYXJyb3dUb3AgPSBsaW5rRGltZW5zaW9ucy5oLzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSBpZiAoaGFsZkJvdHRvbUV4Y2VlZCkge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55IC0gZWxlbWVudERpbWVuc2lvbnMuaCArIGxpbmtEaW1lbnNpb25zLmg7XG4gICAgICBhcnJvd1RvcCA9IGVsZW1lbnREaW1lbnNpb25zLmggLSBsaW5rRGltZW5zaW9ucy5oLzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oLzIgKyBsaW5rRGltZW5zaW9ucy5oLzI7XG4gICAgICBhcnJvd1RvcCA9IGVsZW1lbnREaW1lbnNpb25zLmgvMiAtIChpc1BvcG92ZXIgPyBhcnJvd0hlaWdodCowLjkgOiBhcnJvd0hlaWdodC8yKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgKSB7XG4gICAgaWYgKCBwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gIHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oIC0gKCBpc1BvcG92ZXIgPyBhcnJvd0hlaWdodCA6IDAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9wUG9zaXRpb24gPSByZWN0LnRvcCArIHNjcm9sbC55ICsgbGlua0RpbWVuc2lvbnMuaDtcbiAgICB9XG4gICAgaWYgKGhhbGZMZWZ0RXhjZWVkKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSAwO1xuICAgICAgYXJyb3dMZWZ0ID0gcmVjdC5sZWZ0ICsgbGlua0RpbWVuc2lvbnMudy8yIC0gYXJyb3dXaWR0aDtcbiAgICB9IGVsc2UgaWYgKGhhbGZSaWdodEV4Y2VlZCkge1xuICAgICAgbGVmdFBvc2l0aW9uID0gd2luZG93V2lkdGggLSBlbGVtZW50RGltZW5zaW9ucy53KjEuMDE7XG4gICAgICBhcnJvd0xlZnQgPSBlbGVtZW50RGltZW5zaW9ucy53IC0gKCB3aW5kb3dXaWR0aCAtIHJlY3QubGVmdCApICsgbGlua0RpbWVuc2lvbnMudy8yIC0gYXJyb3dXaWR0aC8yO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSByZWN0LmxlZnQgKyBzY3JvbGwueCAtIGVsZW1lbnREaW1lbnNpb25zLncvMiArIGxpbmtEaW1lbnNpb25zLncvMjtcbiAgICAgIGFycm93TGVmdCA9IGVsZW1lbnREaW1lbnNpb25zLncvMiAtICggaXNQb3BvdmVyID8gYXJyb3dXaWR0aCA6IGFycm93V2lkdGgvMiApO1xuICAgIH1cbiAgfVxuICBlbGVtZW50LnN0eWxlLnRvcCA9IHRvcFBvc2l0aW9uICsgJ3B4JztcbiAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbGVmdFBvc2l0aW9uICsgJ3B4JztcbiAgYXJyb3dUb3AgJiYgKGFycm93LnN0eWxlLnRvcCA9IGFycm93VG9wICsgJ3B4Jyk7XG4gIGFycm93TGVmdCAmJiAoYXJyb3cuc3R5bGUubGVmdCA9IGFycm93TGVmdCArICdweCcpO1xufVxuXG5mdW5jdGlvbiBQb3BvdmVyKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgcG9wb3ZlciA9IG51bGwsXG4gICAgICB0aW1lciA9IDAsXG4gICAgICBpc0lwaG9uZSA9IC8oaVBob25lfGlQb2R8aVBhZCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgICB0aXRsZVN0cmluZyxcbiAgICAgIGNvbnRlbnRTdHJpbmcsXG4gICAgICBvcHMgPSB7fTtcbiAgdmFyIHRyaWdnZXJEYXRhLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIHBsYWNlbWVudERhdGEsXG4gICAgICBkaXNtaXNzaWJsZURhdGEsXG4gICAgICBkZWxheURhdGEsXG4gICAgICBjb250YWluZXJEYXRhLFxuICAgICAgY2xvc2VCdG4sXG4gICAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgICBjb250YWluZXJFbGVtZW50LFxuICAgICAgY29udGFpbmVyRGF0YUVsZW1lbnQsXG4gICAgICBtb2RhbCxcbiAgICAgIG5hdmJhckZpeGVkVG9wLFxuICAgICAgbmF2YmFyRml4ZWRCb3R0b20sXG4gICAgICBwbGFjZW1lbnRDbGFzcztcbiAgZnVuY3Rpb24gZGlzbWlzc2libGVIYW5kbGVyKGUpIHtcbiAgICBpZiAocG9wb3ZlciAhPT0gbnVsbCAmJiBlLnRhcmdldCA9PT0gcXVlcnlFbGVtZW50KCcuY2xvc2UnLHBvcG92ZXIpKSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZ2V0Q29udGVudHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIDAgOiBvcHRpb25zLnRpdGxlIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJykgfHwgbnVsbCxcbiAgICAgIDEgOiBvcHRpb25zLmNvbnRlbnQgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGVudCcpIHx8IG51bGxcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlUG9wb3ZlcigpIHtcbiAgICBvcHMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHBvcG92ZXIpO1xuICAgIHRpbWVyID0gbnVsbDsgcG9wb3ZlciA9IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlUG9wb3ZlcigpIHtcbiAgICB0aXRsZVN0cmluZyA9IGdldENvbnRlbnRzKClbMF0gfHwgbnVsbDtcbiAgICBjb250ZW50U3RyaW5nID0gZ2V0Q29udGVudHMoKVsxXTtcbiAgICBjb250ZW50U3RyaW5nID0gISFjb250ZW50U3RyaW5nID8gY29udGVudFN0cmluZy50cmltKCkgOiBudWxsO1xuICAgIHBvcG92ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgcG9wb3ZlckFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcG9wb3ZlckFycm93LmNsYXNzTGlzdC5hZGQoJ2Fycm93Jyk7XG4gICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyQXJyb3cpO1xuICAgIGlmICggY29udGVudFN0cmluZyAhPT0gbnVsbCAmJiBvcHMudGVtcGxhdGUgPT09IG51bGwgKSB7XG4gICAgICBwb3BvdmVyLnNldEF0dHJpYnV0ZSgncm9sZScsJ3Rvb2x0aXAnKTtcbiAgICAgIGlmICh0aXRsZVN0cmluZyAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgcG9wb3ZlclRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgcG9wb3ZlclRpdGxlLmNsYXNzTGlzdC5hZGQoJ3BvcG92ZXItaGVhZGVyJyk7XG4gICAgICAgIHBvcG92ZXJUaXRsZS5pbm5lckhUTUwgPSBvcHMuZGlzbWlzc2libGUgPyB0aXRsZVN0cmluZyArIGNsb3NlQnRuIDogdGl0bGVTdHJpbmc7XG4gICAgICAgIHBvcG92ZXIuYXBwZW5kQ2hpbGQocG9wb3ZlclRpdGxlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwb3BvdmVyQm9keU1hcmt1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgcG9wb3ZlckJvZHlNYXJrdXAuY2xhc3NMaXN0LmFkZCgncG9wb3Zlci1ib2R5Jyk7XG4gICAgICBwb3BvdmVyQm9keU1hcmt1cC5pbm5lckhUTUwgPSBvcHMuZGlzbWlzc2libGUgJiYgdGl0bGVTdHJpbmcgPT09IG51bGwgPyBjb250ZW50U3RyaW5nICsgY2xvc2VCdG4gOiBjb250ZW50U3RyaW5nO1xuICAgICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyQm9keU1hcmt1cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwb3BvdmVyVGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHBvcG92ZXJUZW1wbGF0ZS5pbm5lckhUTUwgPSBvcHMudGVtcGxhdGUudHJpbSgpO1xuICAgICAgcG9wb3Zlci5jbGFzc05hbWUgPSBwb3BvdmVyVGVtcGxhdGUuZmlyc3RDaGlsZC5jbGFzc05hbWU7XG4gICAgICBwb3BvdmVyLmlubmVySFRNTCA9IHBvcG92ZXJUZW1wbGF0ZS5maXJzdENoaWxkLmlubmVySFRNTDtcbiAgICAgIHZhciBwb3BvdmVySGVhZGVyID0gcXVlcnlFbGVtZW50KCcucG9wb3Zlci1oZWFkZXInLHBvcG92ZXIpLFxuICAgICAgICAgIHBvcG92ZXJCb2R5ID0gcXVlcnlFbGVtZW50KCcucG9wb3Zlci1ib2R5Jyxwb3BvdmVyKTtcbiAgICAgIHRpdGxlU3RyaW5nICYmIHBvcG92ZXJIZWFkZXIgJiYgKHBvcG92ZXJIZWFkZXIuaW5uZXJIVE1MID0gdGl0bGVTdHJpbmcudHJpbSgpKTtcbiAgICAgIGNvbnRlbnRTdHJpbmcgJiYgcG9wb3ZlckJvZHkgJiYgKHBvcG92ZXJCb2R5LmlubmVySFRNTCA9IGNvbnRlbnRTdHJpbmcudHJpbSgpKTtcbiAgICB9XG4gICAgb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChwb3BvdmVyKTtcbiAgICBwb3BvdmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucyggJ3BvcG92ZXInKSAmJiBwb3BvdmVyLmNsYXNzTGlzdC5hZGQoJ3BvcG92ZXInKTtcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoIG9wcy5hbmltYXRpb24pICYmIHBvcG92ZXIuY2xhc3NMaXN0LmFkZChvcHMuYW5pbWF0aW9uKTtcbiAgICAhcG9wb3Zlci5jbGFzc0xpc3QuY29udGFpbnMoIHBsYWNlbWVudENsYXNzKSAmJiBwb3BvdmVyLmNsYXNzTGlzdC5hZGQocGxhY2VtZW50Q2xhc3MpO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dQb3BvdmVyKCkge1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICggcG9wb3Zlci5jbGFzc0xpc3QuYWRkKCdzaG93JykgKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVQb3BvdmVyKCkge1xuICAgIHN0eWxlVGlwKGVsZW1lbnQsIHBvcG92ZXIsIG9wcy5wbGFjZW1lbnQsIG9wcy5jb250YWluZXIpO1xuICB9XG4gIGZ1bmN0aW9uIGZvcmNlRm9jdXMgKCkge1xuICAgIGlmIChwb3BvdmVyID09PSBudWxsKSB7IGVsZW1lbnQuZm9jdXMoKTsgfVxuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKG9wcy50cmlnZ2VyID09PSAnaG92ZXInKSB7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlQ2xpY2tFdmVudHMuZG93biwgc2VsZi5zaG93ICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMF0sIHNlbGYuc2hvdyApO1xuICAgICAgaWYgKCFvcHMuZGlzbWlzc2libGUpIHsgZWxlbWVudFthY3Rpb25dKCBtb3VzZUhvdmVyRXZlbnRzWzFdLCBzZWxmLmhpZGUgKTsgfVxuICAgIH0gZWxzZSBpZiAoJ2NsaWNrJyA9PSBvcHMudHJpZ2dlcikge1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBvcHMudHJpZ2dlciwgc2VsZi50b2dnbGUgKTtcbiAgICB9IGVsc2UgaWYgKCdmb2N1cycgPT0gb3BzLnRyaWdnZXIpIHtcbiAgICAgIGlzSXBob25lICYmIGVsZW1lbnRbYWN0aW9uXSggJ2NsaWNrJywgZm9yY2VGb2N1cywgZmFsc2UgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggb3BzLnRyaWdnZXIsIHNlbGYudG9nZ2xlICk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvdWNoSGFuZGxlcihlKXtcbiAgICBpZiAoIHBvcG92ZXIgJiYgcG9wb3Zlci5jb250YWlucyhlLnRhcmdldCkgfHwgZS50YXJnZXQgPT09IGVsZW1lbnQgfHwgZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkpIDsgZWxzZSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZGlzbWlzc0hhbmRsZXJUb2dnbGUoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGlmIChvcHMuZGlzbWlzc2libGUpIHtcbiAgICAgIGRvY3VtZW50W2FjdGlvbl0oJ2NsaWNrJywgZGlzbWlzc2libGVIYW5kbGVyLCBmYWxzZSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAnZm9jdXMnID09IG9wcy50cmlnZ2VyICYmIGVsZW1lbnRbYWN0aW9uXSggJ2JsdXInLCBzZWxmLmhpZGUgKTtcbiAgICAgICdob3ZlcicgPT0gb3BzLnRyaWdnZXIgJiYgZG9jdW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCB0b3VjaEhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgfVxuICAgIHdpbmRvd1thY3Rpb25dKCdyZXNpemUnLCBzZWxmLmhpZGUsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd1RyaWdnZXIoKSB7XG4gICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUoMSk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGhpZGVUcmlnZ2VyKCkge1xuICAgIGRpc21pc3NIYW5kbGVyVG9nZ2xlKCk7XG4gICAgcmVtb3ZlUG9wb3ZlcigpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHBvcG92ZXIgPT09IG51bGwpIHsgc2VsZi5zaG93KCk7IH1cbiAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgfTtcbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkge1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgICAgIGNyZWF0ZVBvcG92ZXIoKTtcbiAgICAgICAgdXBkYXRlUG9wb3ZlcigpO1xuICAgICAgICBzaG93UG9wb3ZlcigpO1xuICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChwb3BvdmVyLCBzaG93VHJpZ2dlcikgOiBzaG93VHJpZ2dlcigpO1xuICAgICAgfVxuICAgIH0sIDIwICk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHBvcG92ZXIgJiYgcG9wb3ZlciAhPT0gbnVsbCAmJiBwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgICAgcG9wb3Zlci5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHBvcG92ZXIsIGhpZGVUcmlnZ2VyKSA6IGhpZGVUcmlnZ2VyKCk7XG4gICAgICB9XG4gICAgfSwgb3BzLmRlbGF5ICk7XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLmhpZGUoKTtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBkZWxldGUgZWxlbWVudC5Qb3BvdmVyO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlBvcG92ZXIgJiYgZWxlbWVudC5Qb3BvdmVyLmRpc3Bvc2UoKTtcbiAgdHJpZ2dlckRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10cmlnZ2VyJyk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlbWVudCcpO1xuICBkaXNtaXNzaWJsZURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kaXNtaXNzaWJsZScpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBjb250YWluZXJEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGFpbmVyJyk7XG4gIGNsb3NlQnRuID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIj7DlzwvYnV0dG9uPic7XG4gIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3BvcG92ZXInKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICdwb3BvdmVyJyk7XG4gIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ3BvcG92ZXInKTtcbiAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3BvcG92ZXInKTtcbiAgY29udGFpbmVyRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLmNvbnRhaW5lcik7XG4gIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpO1xuICBtb2RhbCA9IGVsZW1lbnQuY2xvc2VzdCgnLm1vZGFsJyk7XG4gIG5hdmJhckZpeGVkVG9wID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtdG9wJyk7XG4gIG5hdmJhckZpeGVkQm90dG9tID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtYm90dG9tJyk7XG4gIG9wcy50ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogbnVsbDtcbiAgb3BzLnRyaWdnZXIgPSBvcHRpb25zLnRyaWdnZXIgPyBvcHRpb25zLnRyaWdnZXIgOiB0cmlnZ2VyRGF0YSB8fCAnaG92ZXInO1xuICBvcHMuYW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRpb24gJiYgb3B0aW9ucy5hbmltYXRpb24gIT09ICdmYWRlJyA/IG9wdGlvbnMuYW5pbWF0aW9uIDogYW5pbWF0aW9uRGF0YSB8fCAnZmFkZSc7XG4gIG9wcy5wbGFjZW1lbnQgPSBvcHRpb25zLnBsYWNlbWVudCA/IG9wdGlvbnMucGxhY2VtZW50IDogcGxhY2VtZW50RGF0YSB8fCAndG9wJztcbiAgb3BzLmRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5kZWxheSB8fCBkZWxheURhdGEpIHx8IDIwMDtcbiAgb3BzLmRpc21pc3NpYmxlID0gb3B0aW9ucy5kaXNtaXNzaWJsZSB8fCBkaXNtaXNzaWJsZURhdGEgPT09ICd0cnVlJyA/IHRydWUgOiBmYWxzZTtcbiAgb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lckVsZW1lbnQgPyBjb250YWluZXJFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogY29udGFpbmVyRGF0YUVsZW1lbnQgPyBjb250YWluZXJEYXRhRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkVG9wID8gbmF2YmFyRml4ZWRUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZEJvdHRvbSA/IG5hdmJhckZpeGVkQm90dG9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbW9kYWwgPyBtb2RhbCA6IGRvY3VtZW50LmJvZHk7XG4gIHBsYWNlbWVudENsYXNzID0gXCJicy1wb3BvdmVyLVwiICsgKG9wcy5wbGFjZW1lbnQpO1xuICB2YXIgcG9wb3ZlckNvbnRlbnRzID0gZ2V0Q29udGVudHMoKTtcbiAgdGl0bGVTdHJpbmcgPSBwb3BvdmVyQ29udGVudHNbMF07XG4gIGNvbnRlbnRTdHJpbmcgPSBwb3BvdmVyQ29udGVudHNbMV07XG4gIGlmICggIWNvbnRlbnRTdHJpbmcgJiYgIW9wcy50ZW1wbGF0ZSApIHsgcmV0dXJuOyB9XG4gIGlmICggIWVsZW1lbnQuUG9wb3ZlciApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgZWxlbWVudC5Qb3BvdmVyID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gU2Nyb2xsU3B5KGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIHZhcnMsXG4gICAgdGFyZ2V0RGF0YSxcbiAgICBvZmZzZXREYXRhLFxuICAgIHNweVRhcmdldCxcbiAgICBzY3JvbGxUYXJnZXQsXG4gICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIHVwZGF0ZVRhcmdldHMoKXtcbiAgICB2YXIgbGlua3MgPSBzcHlUYXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0EnKTtcbiAgICBpZiAodmFycy5sZW5ndGggIT09IGxpbmtzLmxlbmd0aCkge1xuICAgICAgdmFycy5pdGVtcyA9IFtdO1xuICAgICAgdmFycy50YXJnZXRzID0gW107XG4gICAgICBBcnJheS5mcm9tKGxpbmtzKS5tYXAoZnVuY3Rpb24gKGxpbmspe1xuICAgICAgICB2YXIgaHJlZiA9IGxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJyksXG4gICAgICAgICAgdGFyZ2V0SXRlbSA9IGhyZWYgJiYgaHJlZi5jaGFyQXQoMCkgPT09ICcjJyAmJiBocmVmLnNsaWNlKC0xKSAhPT0gJyMnICYmIHF1ZXJ5RWxlbWVudChocmVmKTtcbiAgICAgICAgaWYgKCB0YXJnZXRJdGVtICkge1xuICAgICAgICAgIHZhcnMuaXRlbXMucHVzaChsaW5rKTtcbiAgICAgICAgICB2YXJzLnRhcmdldHMucHVzaCh0YXJnZXRJdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXJzLmxlbmd0aCA9IGxpbmtzLmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlSXRlbShpbmRleCkge1xuICAgIHZhciBpdGVtID0gdmFycy5pdGVtc1tpbmRleF0sXG4gICAgICB0YXJnZXRJdGVtID0gdmFycy50YXJnZXRzW2luZGV4XSxcbiAgICAgIGRyb3BtZW51ID0gaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duLWl0ZW0nKSAmJiBpdGVtLmNsb3Nlc3QoJy5kcm9wZG93bi1tZW51JyksXG4gICAgICBkcm9wTGluayA9IGRyb3BtZW51ICYmIGRyb3BtZW51LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsXG4gICAgICBuZXh0U2libGluZyA9IGl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nLFxuICAgICAgYWN0aXZlU2libGluZyA9IG5leHRTaWJsaW5nICYmIG5leHRTaWJsaW5nLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLmxlbmd0aCxcbiAgICAgIHRhcmdldFJlY3QgPSB2YXJzLmlzV2luZG93ICYmIHRhcmdldEl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBpc0FjdGl2ZSA9IGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSB8fCBmYWxzZSxcbiAgICAgIHRvcEVkZ2UgPSAodmFycy5pc1dpbmRvdyA/IHRhcmdldFJlY3QudG9wICsgdmFycy5zY3JvbGxPZmZzZXQgOiB0YXJnZXRJdGVtLm9mZnNldFRvcCkgLSBvcHMub2Zmc2V0LFxuICAgICAgYm90dG9tRWRnZSA9IHZhcnMuaXNXaW5kb3cgPyB0YXJnZXRSZWN0LmJvdHRvbSArIHZhcnMuc2Nyb2xsT2Zmc2V0IC0gb3BzLm9mZnNldFxuICAgICAgICAgICAgICAgICA6IHZhcnMudGFyZ2V0c1tpbmRleCsxXSA/IHZhcnMudGFyZ2V0c1tpbmRleCsxXS5vZmZzZXRUb3AgLSBvcHMub2Zmc2V0XG4gICAgICAgICAgICAgICAgIDogZWxlbWVudC5zY3JvbGxIZWlnaHQsXG4gICAgICBpbnNpZGUgPSBhY3RpdmVTaWJsaW5nIHx8IHZhcnMuc2Nyb2xsT2Zmc2V0ID49IHRvcEVkZ2UgJiYgYm90dG9tRWRnZSA+IHZhcnMuc2Nyb2xsT2Zmc2V0O1xuICAgICBpZiAoICFpc0FjdGl2ZSAmJiBpbnNpZGUgKSB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgaWYgKGRyb3BMaW5rICYmICFkcm9wTGluay5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICkge1xuICAgICAgICBkcm9wTGluay5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBib290c3RyYXBDdXN0b21FdmVudCggJ2FjdGl2YXRlJywgJ3Njcm9sbHNweScsIHZhcnMuaXRlbXNbaW5kZXhdKSk7XG4gICAgfSBlbHNlIGlmICggaXNBY3RpdmUgJiYgIWluc2lkZSApIHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICBpZiAoZHJvcExpbmsgJiYgZHJvcExpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSAmJiAhaXRlbS5wYXJlbnROb2RlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLmxlbmd0aCApIHtcbiAgICAgICAgZHJvcExpbmsuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICggaXNBY3RpdmUgJiYgaW5zaWRlIHx8ICFpbnNpZGUgJiYgIWlzQWN0aXZlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVJdGVtcygpIHtcbiAgICB1cGRhdGVUYXJnZXRzKCk7XG4gICAgdmFycy5zY3JvbGxPZmZzZXQgPSB2YXJzLmlzV2luZG93ID8gZ2V0U2Nyb2xsKCkueSA6IGVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgIHZhcnMuaXRlbXMubWFwKGZ1bmN0aW9uIChsLGlkeCl7IHJldHVybiB1cGRhdGVJdGVtKGlkeCk7IH0pO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgc2Nyb2xsVGFyZ2V0W2FjdGlvbl0oJ3Njcm9sbCcsIHNlbGYucmVmcmVzaCwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYucmVmcmVzaCwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBzZWxmLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdXBkYXRlSXRlbXMoKTtcbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlNjcm9sbFNweTtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5TY3JvbGxTcHkgJiYgZWxlbWVudC5TY3JvbGxTcHkuZGlzcG9zZSgpO1xuICB0YXJnZXREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0Jyk7XG4gIG9mZnNldERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vZmZzZXQnKTtcbiAgc3B5VGFyZ2V0ID0gcXVlcnlFbGVtZW50KG9wdGlvbnMudGFyZ2V0IHx8IHRhcmdldERhdGEpO1xuICBzY3JvbGxUYXJnZXQgPSBlbGVtZW50Lm9mZnNldEhlaWdodCA8IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID8gZWxlbWVudCA6IHdpbmRvdztcbiAgaWYgKCFzcHlUYXJnZXQpIHsgcmV0dXJuIH1cbiAgb3BzLnRhcmdldCA9IHNweVRhcmdldDtcbiAgb3BzLm9mZnNldCA9IHBhcnNlSW50KG9wdGlvbnMub2Zmc2V0IHx8IG9mZnNldERhdGEpIHx8IDEwO1xuICB2YXJzID0ge307XG4gIHZhcnMubGVuZ3RoID0gMDtcbiAgdmFycy5pdGVtcyA9IFtdO1xuICB2YXJzLnRhcmdldHMgPSBbXTtcbiAgdmFycy5pc1dpbmRvdyA9IHNjcm9sbFRhcmdldCA9PT0gd2luZG93O1xuICBpZiAoICFlbGVtZW50LlNjcm9sbFNweSApIHtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgc2VsZi5yZWZyZXNoKCk7XG4gIGVsZW1lbnQuU2Nyb2xsU3B5ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVGFiKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGhlaWdodERhdGEsXG4gICAgdGFicywgZHJvcGRvd24sXG4gICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgIG5leHQsXG4gICAgdGFic0NvbnRlbnRDb250YWluZXIgPSBmYWxzZSxcbiAgICBhY3RpdmVUYWIsXG4gICAgYWN0aXZlQ29udGVudCxcbiAgICBuZXh0Q29udGVudCxcbiAgICBjb250YWluZXJIZWlnaHQsXG4gICAgZXF1YWxDb250ZW50cyxcbiAgICBuZXh0SGVpZ2h0LFxuICAgIGFuaW1hdGVIZWlnaHQ7XG4gIGZ1bmN0aW9uIHRyaWdnZXJFbmQoKSB7XG4gICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgdGFic0NvbnRlbnRDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VyU2hvdygpIHtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIGlmICggZXF1YWxDb250ZW50cyApIHtcbiAgICAgICAgdHJpZ2dlckVuZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gbmV4dEhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICB0YWJzQ29udGVudENvbnRhaW5lci5vZmZzZXRXaWR0aDtcbiAgICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0YWJzQ29udGVudENvbnRhaW5lciwgdHJpZ2dlckVuZCk7XG4gICAgICAgIH0sNTApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0YWJzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgfVxuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAndGFiJywgYWN0aXZlVGFiKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobmV4dCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJpZ2dlckhpZGUoKSB7XG4gICAgaWYgKHRhYnNDb250ZW50Q29udGFpbmVyKSB7XG4gICAgICBhY3RpdmVDb250ZW50LnN0eWxlLmZsb2F0ID0gJ2xlZnQnO1xuICAgICAgbmV4dENvbnRlbnQuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XG4gICAgICBjb250YWluZXJIZWlnaHQgPSBhY3RpdmVDb250ZW50LnNjcm9sbEhlaWdodDtcbiAgICB9XG4gICAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndGFiJywgYWN0aXZlVGFiKTtcbiAgICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndGFiJywgbmV4dCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG5leHQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbmV4dENvbnRlbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIG5leHRIZWlnaHQgPSBuZXh0Q29udGVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICBlcXVhbENvbnRlbnRzID0gbmV4dEhlaWdodCA9PT0gY29udGFpbmVySGVpZ2h0O1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2luZycpO1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0ICsgXCJweFwiO1xuICAgICAgdGFic0NvbnRlbnRDb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgYWN0aXZlQ29udGVudC5zdHlsZS5mbG9hdCA9ICcnO1xuICAgICAgbmV4dENvbnRlbnQuc3R5bGUuZmxvYXQgPSAnJztcbiAgICB9XG4gICAgaWYgKCBuZXh0Q29udGVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSApIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBuZXh0Q29udGVudC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKG5leHRDb250ZW50LHRyaWdnZXJTaG93KTtcbiAgICAgIH0sMjApO1xuICAgIH0gZWxzZSB7IHRyaWdnZXJTaG93KCk7IH1cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoYWN0aXZlVGFiLCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKCkge1xuICAgIHZhciBhY3RpdmVUYWJzID0gdGFicy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKSwgYWN0aXZlVGFiO1xuICAgIGlmICggYWN0aXZlVGFicy5sZW5ndGggPT09IDEgJiYgIWFjdGl2ZVRhYnNbMF0ucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duJykgKSB7XG4gICAgICBhY3RpdmVUYWIgPSBhY3RpdmVUYWJzWzBdO1xuICAgIH0gZWxzZSBpZiAoIGFjdGl2ZVRhYnMubGVuZ3RoID4gMSApIHtcbiAgICAgIGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbYWN0aXZlVGFicy5sZW5ndGgtMV07XG4gICAgfVxuICAgIHJldHVybiBhY3RpdmVUYWI7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlQ29udGVudCgpIHsgcmV0dXJuIHF1ZXJ5RWxlbWVudChnZXRBY3RpdmVUYWIoKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgfVxuICBmdW5jdGlvbiBjbGlja0hhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBuZXh0ID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICF0YWJzLmlzQW5pbWF0aW5nICYmIHNlbGYuc2hvdygpO1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBuZXh0ID0gbmV4dCB8fCBlbGVtZW50O1xuICAgIGlmICghbmV4dC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgICBuZXh0Q29udGVudCA9IHF1ZXJ5RWxlbWVudChuZXh0LmdldEF0dHJpYnV0ZSgnaHJlZicpKTtcbiAgICAgIGFjdGl2ZVRhYiA9IGdldEFjdGl2ZVRhYigpO1xuICAgICAgYWN0aXZlQ29udGVudCA9IGdldEFjdGl2ZUNvbnRlbnQoKTtcbiAgICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnaGlkZScsICd0YWInLCBuZXh0KTtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhY3RpdmVUYWIsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgICBpZiAoaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICB0YWJzLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgIGFjdGl2ZVRhYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIGFjdGl2ZVRhYi5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCdmYWxzZScpO1xuICAgICAgbmV4dC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIG5leHQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywndHJ1ZScpO1xuICAgICAgaWYgKCBkcm9wZG93biApIHtcbiAgICAgICAgaWYgKCAhZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24tbWVudScpICkge1xuICAgICAgICAgIGlmIChkcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7IGRyb3Bkb3duLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpOyB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFkcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7IGRyb3Bkb3duLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChhY3RpdmVDb250ZW50LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpKSB7XG4gICAgICAgIGFjdGl2ZUNvbnRlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChhY3RpdmVDb250ZW50LCB0cmlnZ2VySGlkZSk7XG4gICAgICB9IGVsc2UgeyB0cmlnZ2VySGlkZSgpOyB9XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5UYWI7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuVGFiICYmIGVsZW1lbnQuVGFiLmRpc3Bvc2UoKTtcbiAgaGVpZ2h0RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpO1xuICB0YWJzID0gZWxlbWVudC5jbG9zZXN0KCcubmF2Jyk7XG4gIGRyb3Bkb3duID0gdGFicyAmJiBxdWVyeUVsZW1lbnQoJy5kcm9wZG93bi10b2dnbGUnLHRhYnMpO1xuICBhbmltYXRlSGVpZ2h0ID0gIXN1cHBvcnRUcmFuc2l0aW9uIHx8IChvcHRpb25zLmhlaWdodCA9PT0gZmFsc2UgfHwgaGVpZ2h0RGF0YSA9PT0gJ2ZhbHNlJykgPyBmYWxzZSA6IHRydWU7XG4gIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgaWYgKCAhZWxlbWVudC5UYWIgKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBpZiAoYW5pbWF0ZUhlaWdodCkgeyB0YWJzQ29udGVudENvbnRhaW5lciA9IGdldEFjdGl2ZUNvbnRlbnQoKS5wYXJlbnROb2RlOyB9XG4gIGVsZW1lbnQuVGFiID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVG9hc3QoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB0b2FzdCwgdGltZXIgPSAwLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIGF1dG9oaWRlRGF0YSxcbiAgICAgIGRlbGF5RGF0YSxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIG9wcyA9IHt9O1xuICBmdW5jdGlvbiBzaG93Q29tcGxldGUoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSggJ3Nob3dpbmcnICk7XG4gICAgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ3Nob3cnICk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIGlmIChvcHMuYXV0b2hpZGUpIHsgc2VsZi5oaWRlKCk7IH1cbiAgfVxuICBmdW5jdGlvbiBoaWRlQ29tcGxldGUoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ2hpZGUnICk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZSAoKSB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycgKTtcbiAgICBvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9hc3QsIGhpZGVDb21wbGV0ZSkgOiBoaWRlQ29tcGxldGUoKTtcbiAgfVxuICBmdW5jdGlvbiBkaXNwb3NlQ29tcGxldGUoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzZWxmLmhpZGUsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlRvYXN0O1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodG9hc3QgJiYgIXRvYXN0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3Qsc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgIGlmIChzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIG9wcy5hbmltYXRpb24gJiYgdG9hc3QuY2xhc3NMaXN0LmFkZCggJ2ZhZGUnICk7XG4gICAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyApO1xuICAgICAgdG9hc3Qub2Zmc2V0V2lkdGg7XG4gICAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93aW5nJyApO1xuICAgICAgb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvYXN0LCBzaG93Q29tcGxldGUpIDogc2hvd0NvbXBsZXRlKCk7XG4gICAgfVxuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAobm9UaW1lcikge1xuICAgIGlmICh0b2FzdCAmJiB0b2FzdC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSkge1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKHRvYXN0LGhpZGVDdXN0b21FdmVudCk7XG4gICAgICBpZihoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIG5vVGltZXIgPyBjbG9zZSgpIDogKHRpbWVyID0gc2V0VGltZW91dCggY2xvc2UsIG9wcy5kZWxheSkpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIG9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b2FzdCwgZGlzcG9zZUNvbXBsZXRlKSA6IGRpc3Bvc2VDb21wbGV0ZSgpO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlRvYXN0ICYmIGVsZW1lbnQuVG9hc3QuZGlzcG9zZSgpO1xuICB0b2FzdCA9IGVsZW1lbnQuY2xvc2VzdCgnLnRvYXN0Jyk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgYXV0b2hpZGVEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYXV0b2hpZGUnKTtcbiAgZGVsYXlEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVsYXknKTtcbiAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndG9hc3QnKTtcbiAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAndG9hc3QnKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0b2FzdCcpO1xuICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndG9hc3QnKTtcbiAgb3BzLmFuaW1hdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uID09PSBmYWxzZSB8fCBhbmltYXRpb25EYXRhID09PSAnZmFsc2UnID8gMCA6IDE7XG4gIG9wcy5hdXRvaGlkZSA9IG9wdGlvbnMuYXV0b2hpZGUgPT09IGZhbHNlIHx8IGF1dG9oaWRlRGF0YSA9PT0gJ2ZhbHNlJyA/IDAgOiAxO1xuICBvcHMuZGVsYXkgPSBwYXJzZUludChvcHRpb25zLmRlbGF5IHx8IGRlbGF5RGF0YSkgfHwgNTAwO1xuICBpZiAoICFlbGVtZW50LlRvYXN0ICkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYuaGlkZSxmYWxzZSk7XG4gIH1cbiAgZWxlbWVudC5Ub2FzdCA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIFRvb2x0aXAoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB0b29sdGlwID0gbnVsbCwgdGltZXIgPSAwLCB0aXRsZVN0cmluZyxcbiAgICAgIGFuaW1hdGlvbkRhdGEsXG4gICAgICBwbGFjZW1lbnREYXRhLFxuICAgICAgZGVsYXlEYXRhLFxuICAgICAgY29udGFpbmVyRGF0YSxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIGNvbnRhaW5lckVsZW1lbnQsXG4gICAgICBjb250YWluZXJEYXRhRWxlbWVudCxcbiAgICAgIG1vZGFsLFxuICAgICAgbmF2YmFyRml4ZWRUb3AsXG4gICAgICBuYXZiYXJGaXhlZEJvdHRvbSxcbiAgICAgIHBsYWNlbWVudENsYXNzLFxuICAgICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZSgndGl0bGUnKVxuICAgICAgICB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpXG4gICAgICAgIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJylcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVUb29sVGlwKCkge1xuICAgIG9wcy5jb250YWluZXIucmVtb3ZlQ2hpbGQodG9vbHRpcCk7XG4gICAgdG9vbHRpcCA9IG51bGw7IHRpbWVyID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb29sVGlwKCkge1xuICAgIHRpdGxlU3RyaW5nID0gZ2V0VGl0bGUoKTtcbiAgICBpZiAoIHRpdGxlU3RyaW5nICkge1xuICAgICAgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgaWYgKG9wcy50ZW1wbGF0ZSkge1xuICAgICAgICB2YXIgdG9vbHRpcE1hcmt1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b29sdGlwTWFya3VwLmlubmVySFRNTCA9IG9wcy50ZW1wbGF0ZS50cmltKCk7XG4gICAgICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gdG9vbHRpcE1hcmt1cC5maXJzdENoaWxkLmNsYXNzTmFtZTtcbiAgICAgICAgdG9vbHRpcC5pbm5lckhUTUwgPSB0b29sdGlwTWFya3VwLmZpcnN0Q2hpbGQuaW5uZXJIVE1MO1xuICAgICAgICBxdWVyeUVsZW1lbnQoJy50b29sdGlwLWlubmVyJyx0b29sdGlwKS5pbm5lckhUTUwgPSB0aXRsZVN0cmluZy50cmltKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdG9vbHRpcEFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2x0aXBBcnJvdy5jbGFzc0xpc3QuYWRkKCdhcnJvdycpO1xuICAgICAgICB0b29sdGlwLmFwcGVuZENoaWxkKHRvb2x0aXBBcnJvdyk7XG4gICAgICAgIHZhciB0b29sdGlwSW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbHRpcElubmVyLmNsYXNzTGlzdC5hZGQoJ3Rvb2x0aXAtaW5uZXInKTtcbiAgICAgICAgdG9vbHRpcC5hcHBlbmRDaGlsZCh0b29sdGlwSW5uZXIpO1xuICAgICAgICB0b29sdGlwSW5uZXIuaW5uZXJIVE1MID0gdGl0bGVTdHJpbmc7XG4gICAgICB9XG4gICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgICB0b29sdGlwLnN0eWxlLnRvcCA9ICcwJztcbiAgICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywndG9vbHRpcCcpO1xuICAgICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKCd0b29sdGlwJykgJiYgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCd0b29sdGlwJyk7XG4gICAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMob3BzLmFuaW1hdGlvbikgJiYgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKG9wcy5hbmltYXRpb24pO1xuICAgICAgIXRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKHBsYWNlbWVudENsYXNzKSAmJiB0b29sdGlwLmNsYXNzTGlzdC5hZGQocGxhY2VtZW50Q2xhc3MpO1xuICAgICAgb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0b29sdGlwKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlVG9vbHRpcCgpIHtcbiAgICBzdHlsZVRpcChlbGVtZW50LCB0b29sdGlwLCBvcHMucGxhY2VtZW50LCBvcHMuY29udGFpbmVyKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93VG9vbHRpcCgpIHtcbiAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiAoIHRvb2x0aXAuY2xhc3NMaXN0LmFkZCgnc2hvdycpICk7XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hIYW5kbGVyKGUpe1xuICAgIGlmICggdG9vbHRpcCAmJiB0b29sdGlwLmNvbnRhaW5zKGUudGFyZ2V0KSB8fCBlLnRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSkgOyBlbHNlIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVBY3Rpb24oYWN0aW9uKXtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZG9jdW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCB0b3VjaEhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgd2luZG93W2FjdGlvbl0oICdyZXNpemUnLCBzZWxmLmhpZGUsIHBhc3NpdmVIYW5kbGVyICk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd0FjdGlvbigpIHtcbiAgICB0b2dnbGVBY3Rpb24oMSk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGhpZGVBY3Rpb24oKSB7XG4gICAgdG9nZ2xlQWN0aW9uKCk7XG4gICAgcmVtb3ZlVG9vbFRpcCgpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRkZW5DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0obW91c2VDbGlja0V2ZW50cy5kb3duLCBzZWxmLnNob3csZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUhvdmVyRXZlbnRzWzBdLCBzZWxmLnNob3csZmFsc2UpO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUhvdmVyRXZlbnRzWzFdLCBzZWxmLmhpZGUsZmFsc2UpO1xuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRvb2x0aXAgPT09IG51bGwpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgICAgIGlmIChzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgICAgaWYoY3JlYXRlVG9vbFRpcCgpICE9PSBmYWxzZSkge1xuICAgICAgICAgIHVwZGF0ZVRvb2x0aXAoKTtcbiAgICAgICAgICBzaG93VG9vbHRpcCgpO1xuICAgICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvb2x0aXAsIHNob3dBY3Rpb24pIDogc2hvd0FjdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgMjAgKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodG9vbHRpcCAmJiB0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICAhIW9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b29sdGlwLCBoaWRlQWN0aW9uKSA6IGhpZGVBY3Rpb24oKTtcbiAgICAgIH1cbiAgICB9LCBvcHMuZGVsYXkpO1xuICB9O1xuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRvb2x0aXApIHsgc2VsZi5zaG93KCk7IH1cbiAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIHNlbGYuaGlkZSgpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0aXRsZScsIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykpO1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXRpdGxlJyk7XG4gICAgZGVsZXRlIGVsZW1lbnQuVG9vbHRpcDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5Ub29sdGlwICYmIGVsZW1lbnQuVG9vbHRpcC5kaXNwb3NlKCk7XG4gIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nKTtcbiAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlbWVudCcpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBjb250YWluZXJEYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGFpbmVyJyk7XG4gIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ3Rvb2x0aXAnKTtcbiAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0b29sdGlwJyk7XG4gIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ3Rvb2x0aXAnKTtcbiAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ3Rvb2x0aXAnKTtcbiAgY29udGFpbmVyRWxlbWVudCA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLmNvbnRhaW5lcik7XG4gIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpO1xuICBtb2RhbCA9IGVsZW1lbnQuY2xvc2VzdCgnLm1vZGFsJyk7XG4gIG5hdmJhckZpeGVkVG9wID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtdG9wJyk7XG4gIG5hdmJhckZpeGVkQm90dG9tID0gZWxlbWVudC5jbG9zZXN0KCcuZml4ZWQtYm90dG9tJyk7XG4gIG9wcy5hbmltYXRpb24gPSBvcHRpb25zLmFuaW1hdGlvbiAmJiBvcHRpb25zLmFuaW1hdGlvbiAhPT0gJ2ZhZGUnID8gb3B0aW9ucy5hbmltYXRpb24gOiBhbmltYXRpb25EYXRhIHx8ICdmYWRlJztcbiAgb3BzLnBsYWNlbWVudCA9IG9wdGlvbnMucGxhY2VtZW50ID8gb3B0aW9ucy5wbGFjZW1lbnQgOiBwbGFjZW1lbnREYXRhIHx8ICd0b3AnO1xuICBvcHMudGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlID8gb3B0aW9ucy50ZW1wbGF0ZSA6IG51bGw7XG4gIG9wcy5kZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuZGVsYXkgfHwgZGVsYXlEYXRhKSB8fCAyMDA7XG4gIG9wcy5jb250YWluZXIgPSBjb250YWluZXJFbGVtZW50ID8gY29udGFpbmVyRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGNvbnRhaW5lckRhdGFFbGVtZW50ID8gY29udGFpbmVyRGF0YUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZFRvcCA/IG5hdmJhckZpeGVkVG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRCb3R0b20gPyBuYXZiYXJGaXhlZEJvdHRvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG1vZGFsID8gbW9kYWwgOiBkb2N1bWVudC5ib2R5O1xuICBwbGFjZW1lbnRDbGFzcyA9IFwiYnMtdG9vbHRpcC1cIiArIChvcHMucGxhY2VtZW50KTtcbiAgdGl0bGVTdHJpbmcgPSBnZXRUaXRsZSgpO1xuICBpZiAoICF0aXRsZVN0cmluZyApIHsgcmV0dXJuOyB9XG4gIGlmICghZWxlbWVudC5Ub29sdGlwKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLHRpdGxlU3RyaW5nKTtcbiAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKTtcbiAgICB0b2dnbGVFdmVudHMoMSk7XG4gIH1cbiAgZWxlbWVudC5Ub29sdGlwID0gc2VsZjtcbn1cblxudmFyIGNvbXBvbmVudHNJbml0ID0ge307XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVEYXRhQVBJKCBDb25zdHJ1Y3RvciwgY29sbGVjdGlvbiApe1xuICBBcnJheS5mcm9tKGNvbGxlY3Rpb24pLm1hcChmdW5jdGlvbiAoeCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IoeCk7IH0pO1xufVxuZnVuY3Rpb24gaW5pdENhbGxiYWNrKGxvb2tVcCl7XG4gIGxvb2tVcCA9IGxvb2tVcCB8fCBkb2N1bWVudDtcbiAgZm9yICh2YXIgY29tcG9uZW50IGluIGNvbXBvbmVudHNJbml0KSB7XG4gICAgaW5pdGlhbGl6ZURhdGFBUEkoIGNvbXBvbmVudHNJbml0W2NvbXBvbmVudF1bMF0sIGxvb2tVcC5xdWVyeVNlbGVjdG9yQWxsIChjb21wb25lbnRzSW5pdFtjb21wb25lbnRdWzFdKSApO1xuICB9XG59XG5cbmNvbXBvbmVudHNJbml0LkFsZXJ0ID0gWyBBbGVydCwgJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXSddO1xuY29tcG9uZW50c0luaXQuQnV0dG9uID0gWyBCdXR0b24sICdbZGF0YS10b2dnbGU9XCJidXR0b25zXCJdJyBdO1xuY29tcG9uZW50c0luaXQuQ2Fyb3VzZWwgPSBbIENhcm91c2VsLCAnW2RhdGEtcmlkZT1cImNhcm91c2VsXCJdJyBdO1xuY29tcG9uZW50c0luaXQuQ29sbGFwc2UgPSBbIENvbGxhcHNlLCAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Ecm9wZG93biA9IFsgRHJvcGRvd24sICdbZGF0YS10b2dnbGU9XCJkcm9wZG93blwiXSddO1xuY29tcG9uZW50c0luaXQuTW9kYWwgPSBbIE1vZGFsLCAnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Qb3BvdmVyID0gWyBQb3BvdmVyLCAnW2RhdGEtdG9nZ2xlPVwicG9wb3ZlclwiXSxbZGF0YS10aXA9XCJwb3BvdmVyXCJdJyBdO1xuY29tcG9uZW50c0luaXQuU2Nyb2xsU3B5ID0gWyBTY3JvbGxTcHksICdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5UYWIgPSBbIFRhYiwgJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRvYXN0ID0gWyBUb2FzdCwgJ1tkYXRhLWRpc21pc3M9XCJ0b2FzdFwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRvb2x0aXAgPSBbIFRvb2x0aXAsICdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdLFtkYXRhLXRpcD1cInRvb2x0aXBcIl0nIF07XG5kb2N1bWVudC5ib2R5ID8gaW5pdENhbGxiYWNrKCkgOiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIGluaXRXcmFwcGVyKCl7XG5cdGluaXRDYWxsYmFjaygpO1xuXHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJyxpbml0V3JhcHBlcixmYWxzZSk7XG59LCBmYWxzZSApO1xuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50RGF0YUFQSSggQ29uc3RydWN0b3JOYW1lLCBjb2xsZWN0aW9uICl7XG4gIEFycmF5LmZyb20oY29sbGVjdGlvbikubWFwKGZ1bmN0aW9uICh4KXsgcmV0dXJuIHhbQ29uc3RydWN0b3JOYW1lXS5kaXNwb3NlKCk7IH0pO1xufVxuZnVuY3Rpb24gcmVtb3ZlRGF0YUFQSShsb29rVXApIHtcbiAgbG9va1VwID0gbG9va1VwIHx8IGRvY3VtZW50O1xuICBmb3IgKHZhciBjb21wb25lbnQgaW4gY29tcG9uZW50c0luaXQpIHtcbiAgICByZW1vdmVFbGVtZW50RGF0YUFQSSggY29tcG9uZW50LCBsb29rVXAucXVlcnlTZWxlY3RvckFsbCAoY29tcG9uZW50c0luaXRbY29tcG9uZW50XVsxXSkgKTtcbiAgfVxufVxuXG52YXIgdmVyc2lvbiA9IFwiMy4wLjlcIjtcblxudmFyIGluZGV4ID0ge1xuICBBbGVydDogQWxlcnQsXG4gIEJ1dHRvbjogQnV0dG9uLFxuICBDYXJvdXNlbDogQ2Fyb3VzZWwsXG4gIENvbGxhcHNlOiBDb2xsYXBzZSxcbiAgRHJvcGRvd246IERyb3Bkb3duLFxuICBNb2RhbDogTW9kYWwsXG4gIFBvcG92ZXI6IFBvcG92ZXIsXG4gIFNjcm9sbFNweTogU2Nyb2xsU3B5LFxuICBUYWI6IFRhYixcbiAgVG9hc3Q6IFRvYXN0LFxuICBUb29sdGlwOiBUb29sdGlwLFxuICBpbml0Q2FsbGJhY2s6IGluaXRDYWxsYmFjayxcbiAgcmVtb3ZlRGF0YUFQSTogcmVtb3ZlRGF0YUFQSSxcbiAgY29tcG9uZW50c0luaXQ6IGNvbXBvbmVudHNJbml0LFxuICBWZXJzaW9uOiB2ZXJzaW9uXG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmRleDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgKHV0aWxzLmlzQmxvYihyZXF1ZXN0RGF0YSkgfHwgdXRpbHMuaXNGaWxlKHJlcXVlc3REYXRhKSkgJiZcbiAgICAgIHJlcXVlc3REYXRhLnR5cGVcbiAgICApIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSB8fCAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCJleHBvcnQgZnVuY3Rpb24gYXR0cmlidXRlVG9TdHJpbmcoYXR0cmlidXRlKSB7XHJcbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICBhdHRyaWJ1dGUgKz0gJyc7XHJcbiAgICBpZiAoYXR0cmlidXRlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBhdHRyaWJ1dGUgPSAnJztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGF0dHJpYnV0ZS50cmltKCk7XHJcbn1cclxuIiwiaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcclxuaW1wb3J0IHsgYXR0cmlidXRlVG9TdHJpbmcgfSBmcm9tICcuL2hlbHBlcic7XHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChheGlvc0NvbmZpZywgLi4uYXJncykge1xyXG4gIGNvbnN0IGluc3RhbmNlID0gQXhpb3MuY3JlYXRlKGF4aW9zQ29uZmlnKTtcclxuICByZXR1cm4ge1xyXG4gICAgZ2V0Q2FydCgpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLmdldCgnL2NhcnQuanMnKTtcclxuICAgIH0sXHJcbiAgICBnZXRQcm9kdWN0KGhhbmRsZSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UuZ2V0KGAvcHJvZHVjdHMvJHtoYW5kbGV9LmpzYCk7XHJcbiAgICB9LFxyXG4gICAgY2xlYXJDYXJ0KCkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvY2xlYXIuanMnKTtcclxuICAgIH0sXHJcbiAgICB1cGRhdGVDYXJ0RnJvbUZvcm0oZm9ybSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvdXBkYXRlLmpzJywgbmV3IEZvcm1EYXRhKGZvcm0pKTtcclxuICAgIH0sXHJcbiAgICBjaGFuZ2VJdGVtQnlLZXlPcklkKGtleU9ySWQsIHF1YW50aXR5KSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9jaGFuZ2UuanMnLCB7XHJcbiAgICAgICAgcXVhbnRpdHk6IHF1YW50aXR5LFxyXG4gICAgICAgIGlkOiBrZXlPcklkLFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVJdGVtQnlLZXlPcklkKGtleU9ySWQpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHsgcXVhbnRpdHk6IDAsIGlkOiBrZXlPcklkIH0pO1xyXG4gICAgfSxcclxuICAgIGNoYW5nZUl0ZW1CeUxpbmUobGluZSwgcXVhbnRpdHkpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2NoYW5nZS5qcycsIHsgcXVhbnRpdHksIGxpbmUgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlSXRlbUJ5TGluZShsaW5lKSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9jaGFuZ2UuanMnLCB7IHF1YW50aXR5OiAwLCBsaW5lIH0pO1xyXG4gICAgfSxcclxuICAgIGFkZEl0ZW0oaWQsIHF1YW50aXR5LCBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5wb3N0KCcvY2FydC9hZGQuanMnLCB7XHJcbiAgICAgICAgaWQsXHJcbiAgICAgICAgcXVhbnRpdHksXHJcbiAgICAgICAgcHJvcGVydGllcyxcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWRkSXRlbUZyb21Gb3JtKGZvcm0pIHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnBvc3QoJy9jYXJ0L2FkZC5qcycsIG5ldyBGb3JtRGF0YShmb3JtKSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlQ2FydEF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xyXG4gICAgICBsZXQgZGF0YSA9ICcnO1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhdHRyaWJ1dGVzKSkge1xyXG4gICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBrZXkgPSBhdHRyaWJ1dGVUb1N0cmluZyhhdHRyaWJ1dGUua2V5KTtcclxuICAgICAgICAgIGlmIChrZXkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGRhdGEgKz1cclxuICAgICAgICAgICAgICAnYXR0cmlidXRlc1snICtcclxuICAgICAgICAgICAgICBrZXkgK1xyXG4gICAgICAgICAgICAgICddPScgK1xyXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZVRvU3RyaW5nKGF0dHJpYnV0ZS52YWx1ZSkgK1xyXG4gICAgICAgICAgICAgICcmJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXR0cmlidXRlcyA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcyAhPT0gbnVsbCkge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XHJcbiAgICAgICAgICBkYXRhICs9XHJcbiAgICAgICAgICAgICdhdHRyaWJ1dGVzWycgK1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVUb1N0cmluZyhrZXkpICtcclxuICAgICAgICAgICAgJ109JyArXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZVRvU3RyaW5nKHZhbHVlKSArXHJcbiAgICAgICAgICAgICcmJztcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdCgnL2NhcnQvdXBkYXRlLmpzJywgZGF0YSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlQ2FydE5vdGUobm90ZSkge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucG9zdChcclxuICAgICAgICAnL2NhcnQvdXBkYXRlLmpzJyxcclxuICAgICAgICBgbm90ZT0ke2F0dHJpYnV0ZVRvU3RyaW5nKG5vdGUpfWBcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG4iLCJpbXBvcnQgQlNOIGZyb20gJ2Jvb3RzdHJhcC5uYXRpdmUnO1xyXG5pbXBvcnQgYWpheEFQSUNyZWF0b3IgZnJvbSAnLi9hamF4YXBpJztcclxuXHJcbndpbmRvdy5kYXRvbWFyID0ge1xyXG4gIEJTTixcclxuICBhcGk6IGFqYXhBUElDcmVhdG9yKHt9KSxcclxufTtcclxuIl0sIm5hbWVzIjpbInRyYW5zaXRpb25FbmRFdmVudCIsImRvY3VtZW50IiwiYm9keSIsInN0eWxlIiwic3VwcG9ydFRyYW5zaXRpb24iLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uIiwiZWxlbWVudCIsImR1cmF0aW9uIiwicGFyc2VGbG9hdCIsImdldENvbXB1dGVkU3R5bGUiLCJpc05hTiIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiaGFuZGxlciIsImNhbGxlZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ0cmFuc2l0aW9uRW5kV3JhcHBlciIsImUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2V0VGltZW91dCIsInF1ZXJ5RWxlbWVudCIsInNlbGVjdG9yIiwicGFyZW50IiwibG9va1VwIiwiRWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJib290c3RyYXBDdXN0b21FdmVudCIsImV2ZW50TmFtZSIsImNvbXBvbmVudE5hbWUiLCJyZWxhdGVkIiwiT3JpZ2luYWxDdXN0b21FdmVudCIsIkN1c3RvbUV2ZW50IiwiY2FuY2VsYWJsZSIsInJlbGF0ZWRUYXJnZXQiLCJkaXNwYXRjaEN1c3RvbUV2ZW50IiwiY3VzdG9tRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiQWxlcnQiLCJzZWxmIiwiYWxlcnQiLCJjbG9zZUN1c3RvbUV2ZW50IiwiY2xvc2VkQ3VzdG9tRXZlbnQiLCJ0cmlnZ2VySGFuZGxlciIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwidHJhbnNpdGlvbkVuZEhhbmRsZXIiLCJ0b2dnbGVFdmVudHMiLCJhY3Rpb24iLCJjbGlja0hhbmRsZXIiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiY2xvc2UiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJjYWxsIiwiZGVmYXVsdFByZXZlbnRlZCIsImRpc3Bvc2UiLCJyZW1vdmUiLCJCdXR0b24iLCJsYWJlbHMiLCJjaGFuZ2VDdXN0b21FdmVudCIsInRvZ2dsZSIsImlucHV0IiwibGFiZWwiLCJ0YWdOYW1lIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJ0eXBlIiwiY2hlY2tlZCIsImFkZCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInJlbW92ZUF0dHJpYnV0ZSIsInRvZ2dsZWQiLCJzY3JlZW5YIiwic2NyZWVuWSIsIkFycmF5IiwiZnJvbSIsIm1hcCIsIm90aGVyTGFiZWwiLCJvdGhlcklucHV0Iiwia2V5SGFuZGxlciIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsImFjdGl2ZUVsZW1lbnQiLCJwcmV2ZW50U2Nyb2xsIiwicHJldmVudERlZmF1bHQiLCJmb2N1c1RvZ2dsZSIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJsZW5ndGgiLCJidG4iLCJtb3VzZUhvdmVyRXZlbnRzIiwic3VwcG9ydFBhc3NpdmUiLCJyZXN1bHQiLCJvcHRzIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiLCJ3cmFwIiwicGFzc2l2ZUhhbmRsZXIiLCJwYXNzaXZlIiwiaXNFbGVtZW50SW5TY3JvbGxSYW5nZSIsImJjciIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInZpZXdwb3J0SGVpZ2h0Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRIZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJDYXJvdXNlbCIsIm9wdGlvbnMiLCJ2YXJzIiwib3BzIiwic2xpZGVDdXN0b21FdmVudCIsInNsaWRDdXN0b21FdmVudCIsInNsaWRlcyIsImxlZnRBcnJvdyIsInJpZ2h0QXJyb3ciLCJpbmRpY2F0b3IiLCJpbmRpY2F0b3JzIiwicGF1c2VIYW5kbGVyIiwiaW50ZXJ2YWwiLCJpc1NsaWRpbmciLCJjbGVhckludGVydmFsIiwidGltZXIiLCJyZXN1bWVIYW5kbGVyIiwiY3ljbGUiLCJpbmRpY2F0b3JIYW5kbGVyIiwiZXZlbnRUYXJnZXQiLCJpbmRleCIsInBhcnNlSW50Iiwic2xpZGVUbyIsImNvbnRyb2xzSGFuZGxlciIsImN1cnJlbnRUYXJnZXQiLCJzcmNFbGVtZW50IiwicmVmIiwicGF1c2UiLCJ0b3VjaCIsInRvdWNoRG93bkhhbmRsZXIiLCJrZXlib2FyZCIsInRvZ2dsZVRvdWNoRXZlbnRzIiwidG91Y2hNb3ZlSGFuZGxlciIsInRvdWNoRW5kSGFuZGxlciIsImlzVG91Y2giLCJ0b3VjaFBvc2l0aW9uIiwic3RhcnRYIiwiY2hhbmdlZFRvdWNoZXMiLCJwYWdlWCIsImN1cnJlbnRYIiwiZW5kWCIsIk1hdGgiLCJhYnMiLCJzZXRBY3RpdmVQYWdlIiwicGFnZUluZGV4IiwieCIsIm5leHQiLCJ0aW1lb3V0IiwiZWxhcHNlZFRpbWUiLCJhY3RpdmVJdGVtIiwiZ2V0QWN0aXZlSW5kZXgiLCJvcmllbnRhdGlvbiIsImRpcmVjdGlvbiIsImhpZGRlbiIsInNldEludGVydmFsIiwiaWR4Iiwib2Zmc2V0V2lkdGgiLCJpbmRleE9mIiwiaXRlbUNsYXNzZXMiLCJzbGlkZSIsImNscyIsImludGVydmFsQXR0cmlidXRlIiwiaW50ZXJ2YWxEYXRhIiwidG91Y2hEYXRhIiwicGF1c2VEYXRhIiwia2V5Ym9hcmREYXRhIiwiaW50ZXJ2YWxPcHRpb24iLCJ0b3VjaE9wdGlvbiIsIkNvbGxhcHNlIiwiYWNjb3JkaW9uIiwiY29sbGFwc2UiLCJhY3RpdmVDb2xsYXBzZSIsInNob3dDdXN0b21FdmVudCIsInNob3duQ3VzdG9tRXZlbnQiLCJoaWRlQ3VzdG9tRXZlbnQiLCJoaWRkZW5DdXN0b21FdmVudCIsIm9wZW5BY3Rpb24iLCJjb2xsYXBzZUVsZW1lbnQiLCJpc0FuaW1hdGluZyIsImhlaWdodCIsInNjcm9sbEhlaWdodCIsImNsb3NlQWN0aW9uIiwic2hvdyIsImhpZGUiLCJpZCIsImFjY29yZGlvbkRhdGEiLCJzZXRGb2N1cyIsImZvY3VzIiwic2V0QWN0aXZlIiwiRHJvcGRvd24iLCJvcHRpb24iLCJtZW51IiwibWVudUl0ZW1zIiwicGVyc2lzdCIsInByZXZlbnRFbXB0eUFuY2hvciIsImFuY2hvciIsImhyZWYiLCJzbGljZSIsInRvZ2dsZURpc21pc3MiLCJvcGVuIiwiZGlzbWlzc0hhbmRsZXIiLCJoYXNEYXRhIiwiaXNTYW1lRWxlbWVudCIsImlzSW5zaWRlTWVudSIsImlzTWVudUl0ZW0iLCJjaGlsZHJlbiIsImNoaWxkIiwicHVzaCIsIk1vZGFsIiwibW9kYWwiLCJzY3JvbGxCYXJXaWR0aCIsIm92ZXJsYXkiLCJvdmVybGF5RGVsYXkiLCJmaXhlZEl0ZW1zIiwic2V0U2Nyb2xsYmFyIiwib3Blbk1vZGFsIiwiYm9keVBhZCIsInBhZGRpbmdSaWdodCIsImJvZHlPdmVyZmxvdyIsIm1vZGFsT3ZlcmZsb3ciLCJtZWFzdXJlU2Nyb2xsYmFyIiwiZml4ZWQiLCJpdGVtUGFkIiwicmVzZXRTY3JvbGxiYXIiLCJzY3JvbGxEaXYiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGhWYWx1ZSIsImNsYXNzTmFtZSIsImFwcGVuZENoaWxkIiwiY2xpZW50V2lkdGgiLCJjcmVhdGVPdmVybGF5IiwibmV3T3ZlcmxheSIsImFuaW1hdGlvbiIsInJlbW92ZU92ZXJsYXkiLCJ1cGRhdGUiLCJiZWZvcmVTaG93IiwiZGlzcGxheSIsInRyaWdnZXJTaG93IiwidHJpZ2dlckhpZGUiLCJmb3JjZSIsImNsaWNrVGFyZ2V0IiwibW9kYWxJRCIsInRhcmdldEF0dHJWYWx1ZSIsImVsZW1BdHRyVmFsdWUiLCJtb2RhbFRyaWdnZXIiLCJwYXJlbnRXaXRoRGF0YSIsImJhY2tkcm9wIiwiY3VycmVudE9wZW4iLCJzZXRDb250ZW50IiwiY29udGVudCIsImlubmVySFRNTCIsImNoZWNrTW9kYWwiLCJjb25jYXQiLCJ0cmltIiwibW91c2VDbGlja0V2ZW50cyIsImRvd24iLCJ1cCIsImdldFNjcm9sbCIsInkiLCJwYWdlWU9mZnNldCIsInNjcm9sbFRvcCIsInBhZ2VYT2Zmc2V0Iiwic2Nyb2xsTGVmdCIsInN0eWxlVGlwIiwibGluayIsInBvc2l0aW9uIiwidGlwUG9zaXRpb25zIiwiZWxlbWVudERpbWVuc2lvbnMiLCJ3IiwiaCIsIm9mZnNldEhlaWdodCIsIndpbmRvd1dpZHRoIiwid2luZG93SGVpZ2h0IiwicmVjdCIsInNjcm9sbCIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJsaW5rRGltZW5zaW9ucyIsInJpZ2h0IiwibGVmdCIsImlzUG9wb3ZlciIsImFycm93IiwiaGFsZlRvcEV4Y2VlZCIsImhhbGZMZWZ0RXhjZWVkIiwiaGFsZlJpZ2h0RXhjZWVkIiwiaGFsZkJvdHRvbUV4Y2VlZCIsInRvcEV4Y2VlZCIsImxlZnRFeGNlZWQiLCJib3R0b21FeGNlZWQiLCJyaWdodEV4Y2VlZCIsInRvcFBvc2l0aW9uIiwibGVmdFBvc2l0aW9uIiwiYXJyb3dUb3AiLCJhcnJvd0xlZnQiLCJhcnJvd1dpZHRoIiwiYXJyb3dIZWlnaHQiLCJyZXBsYWNlIiwiUG9wb3ZlciIsInBvcG92ZXIiLCJpc0lwaG9uZSIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ0aXRsZVN0cmluZyIsImNvbnRlbnRTdHJpbmciLCJ0cmlnZ2VyRGF0YSIsImFuaW1hdGlvbkRhdGEiLCJwbGFjZW1lbnREYXRhIiwiZGlzbWlzc2libGVEYXRhIiwiZGVsYXlEYXRhIiwiY29udGFpbmVyRGF0YSIsImNsb3NlQnRuIiwiY29udGFpbmVyRWxlbWVudCIsImNvbnRhaW5lckRhdGFFbGVtZW50IiwibmF2YmFyRml4ZWRUb3AiLCJuYXZiYXJGaXhlZEJvdHRvbSIsInBsYWNlbWVudENsYXNzIiwiZGlzbWlzc2libGVIYW5kbGVyIiwiZ2V0Q29udGVudHMiLCJ0aXRsZSIsInJlbW92ZVBvcG92ZXIiLCJjb250YWluZXIiLCJjcmVhdGVQb3BvdmVyIiwicG9wb3ZlckFycm93IiwidGVtcGxhdGUiLCJwb3BvdmVyVGl0bGUiLCJkaXNtaXNzaWJsZSIsInBvcG92ZXJCb2R5TWFya3VwIiwicG9wb3ZlclRlbXBsYXRlIiwiZmlyc3RDaGlsZCIsInBvcG92ZXJIZWFkZXIiLCJwb3BvdmVyQm9keSIsInNob3dQb3BvdmVyIiwidXBkYXRlUG9wb3ZlciIsInBsYWNlbWVudCIsImZvcmNlRm9jdXMiLCJ0cmlnZ2VyIiwidG91Y2hIYW5kbGVyIiwiZGlzbWlzc0hhbmRsZXJUb2dnbGUiLCJzaG93VHJpZ2dlciIsImhpZGVUcmlnZ2VyIiwiY2xlYXJUaW1lb3V0IiwiZGVsYXkiLCJwb3BvdmVyQ29udGVudHMiLCJTY3JvbGxTcHkiLCJ0YXJnZXREYXRhIiwib2Zmc2V0RGF0YSIsInNweVRhcmdldCIsInNjcm9sbFRhcmdldCIsInVwZGF0ZVRhcmdldHMiLCJsaW5rcyIsIml0ZW1zIiwidGFyZ2V0cyIsInRhcmdldEl0ZW0iLCJjaGFyQXQiLCJ1cGRhdGVJdGVtIiwiaXRlbSIsImRyb3BtZW51IiwiZHJvcExpbmsiLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwibmV4dFNpYmxpbmciLCJuZXh0RWxlbWVudFNpYmxpbmciLCJhY3RpdmVTaWJsaW5nIiwidGFyZ2V0UmVjdCIsImlzV2luZG93IiwiaXNBY3RpdmUiLCJ0b3BFZGdlIiwic2Nyb2xsT2Zmc2V0Iiwib2Zmc2V0IiwiYm90dG9tRWRnZSIsImluc2lkZSIsInVwZGF0ZUl0ZW1zIiwibCIsInJlZnJlc2giLCJUYWIiLCJoZWlnaHREYXRhIiwidGFicyIsImRyb3Bkb3duIiwidGFic0NvbnRlbnRDb250YWluZXIiLCJhY3RpdmVUYWIiLCJhY3RpdmVDb250ZW50IiwibmV4dENvbnRlbnQiLCJjb250YWluZXJIZWlnaHQiLCJlcXVhbENvbnRlbnRzIiwibmV4dEhlaWdodCIsImFuaW1hdGVIZWlnaHQiLCJ0cmlnZ2VyRW5kIiwiZ2V0QWN0aXZlVGFiIiwiYWN0aXZlVGFicyIsImdldEFjdGl2ZUNvbnRlbnQiLCJUb2FzdCIsInRvYXN0IiwiYXV0b2hpZGVEYXRhIiwic2hvd0NvbXBsZXRlIiwiYXV0b2hpZGUiLCJoaWRlQ29tcGxldGUiLCJkaXNwb3NlQ29tcGxldGUiLCJub1RpbWVyIiwiVG9vbHRpcCIsInRvb2x0aXAiLCJnZXRUaXRsZSIsInJlbW92ZVRvb2xUaXAiLCJjcmVhdGVUb29sVGlwIiwidG9vbHRpcE1hcmt1cCIsInRvb2x0aXBBcnJvdyIsInRvb2x0aXBJbm5lciIsInVwZGF0ZVRvb2x0aXAiLCJzaG93VG9vbHRpcCIsInRvZ2dsZUFjdGlvbiIsInNob3dBY3Rpb24iLCJoaWRlQWN0aW9uIiwiY29tcG9uZW50c0luaXQiLCJpbml0aWFsaXplRGF0YUFQSSIsIkNvbnN0cnVjdG9yIiwiY29sbGVjdGlvbiIsImluaXRDYWxsYmFjayIsImNvbXBvbmVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJpbml0V3JhcHBlciIsInJlbW92ZUVsZW1lbnREYXRhQVBJIiwiQ29uc3RydWN0b3JOYW1lIiwicmVtb3ZlRGF0YUFQSSIsInZlcnNpb24iLCJWZXJzaW9uIiwiYmluZCIsImZuIiwidGhpc0FyZyIsImFyZ3MiLCJhcmd1bWVudHMiLCJpIiwiYXBwbHkiLCJ0b1N0cmluZyIsInByb3RvdHlwZSIsImlzQXJyYXkiLCJ2YWwiLCJpc1VuZGVmaW5lZCIsImlzQnVmZmVyIiwiY29uc3RydWN0b3IiLCJpc0FycmF5QnVmZmVyIiwiaXNGb3JtRGF0YSIsIkZvcm1EYXRhIiwiaXNBcnJheUJ1ZmZlclZpZXciLCJBcnJheUJ1ZmZlciIsImlzVmlldyIsImJ1ZmZlciIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc09iamVjdCIsImlzUGxhaW5PYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsImlzRGF0ZSIsImlzRmlsZSIsImlzQmxvYiIsImlzRnVuY3Rpb24iLCJpc1N0cmVhbSIsInBpcGUiLCJpc1VSTFNlYXJjaFBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsInN0ciIsImlzU3RhbmRhcmRCcm93c2VyRW52IiwicHJvZHVjdCIsImZvckVhY2giLCJvYmoiLCJoYXNPd25Qcm9wZXJ0eSIsIm1lcmdlIiwiYXNzaWduVmFsdWUiLCJleHRlbmQiLCJhIiwiYiIsInN0cmlwQk9NIiwiY2hhckNvZGVBdCIsImVuY29kZSIsImVuY29kZVVSSUNvbXBvbmVudCIsImJ1aWxkVVJMIiwidXJsIiwicGFyYW1zIiwicGFyYW1zU2VyaWFsaXplciIsInNlcmlhbGl6ZWRQYXJhbXMiLCJ1dGlscyIsInBhcnRzIiwic2VyaWFsaXplIiwicGFyc2VWYWx1ZSIsInYiLCJ0b0lTT1N0cmluZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJqb2luIiwiaGFzaG1hcmtJbmRleCIsIkludGVyY2VwdG9yTWFuYWdlciIsImhhbmRsZXJzIiwidXNlIiwiZnVsZmlsbGVkIiwicmVqZWN0ZWQiLCJlamVjdCIsImZvckVhY2hIYW5kbGVyIiwidHJhbnNmb3JtRGF0YSIsImRhdGEiLCJoZWFkZXJzIiwiZm5zIiwidHJhbnNmb3JtIiwiaXNDYW5jZWwiLCJ2YWx1ZSIsIl9fQ0FOQ0VMX18iLCJub3JtYWxpemVIZWFkZXJOYW1lIiwibm9ybWFsaXplZE5hbWUiLCJwcm9jZXNzSGVhZGVyIiwibmFtZSIsInRvVXBwZXJDYXNlIiwiZW5oYW5jZUVycm9yIiwiZXJyb3IiLCJjb25maWciLCJjb2RlIiwicmVxdWVzdCIsInJlc3BvbnNlIiwiaXNBeGlvc0Vycm9yIiwidG9KU09OIiwibWVzc2FnZSIsImRlc2NyaXB0aW9uIiwibnVtYmVyIiwiZmlsZU5hbWUiLCJsaW5lTnVtYmVyIiwiY29sdW1uTnVtYmVyIiwic3RhY2siLCJjcmVhdGVFcnJvciIsIkVycm9yIiwic2V0dGxlIiwicmVzb2x2ZSIsInJlamVjdCIsInZhbGlkYXRlU3RhdHVzIiwic3RhdHVzIiwic3RhbmRhcmRCcm93c2VyRW52Iiwid3JpdGUiLCJleHBpcmVzIiwicGF0aCIsImRvbWFpbiIsInNlY3VyZSIsImNvb2tpZSIsIkRhdGUiLCJ0b0dNVFN0cmluZyIsInJlYWQiLCJtYXRjaCIsIlJlZ0V4cCIsImRlY29kZVVSSUNvbXBvbmVudCIsIm5vdyIsIm5vblN0YW5kYXJkQnJvd3NlckVudiIsImlzQWJzb2x1dGVVUkwiLCJjb21iaW5lVVJMcyIsImJhc2VVUkwiLCJyZWxhdGl2ZVVSTCIsImJ1aWxkRnVsbFBhdGgiLCJyZXF1ZXN0ZWRVUkwiLCJpZ25vcmVEdXBsaWNhdGVPZiIsInBhcnNlSGVhZGVycyIsInBhcnNlZCIsInNwbGl0IiwicGFyc2VyIiwibGluZSIsInN1YnN0ciIsInRvTG93ZXJDYXNlIiwibXNpZSIsInVybFBhcnNpbmdOb2RlIiwib3JpZ2luVVJMIiwicmVzb2x2ZVVSTCIsInByb3RvY29sIiwiaG9zdCIsInNlYXJjaCIsImhhc2giLCJob3N0bmFtZSIsInBvcnQiLCJwYXRobmFtZSIsImxvY2F0aW9uIiwiaXNVUkxTYW1lT3JpZ2luIiwicmVxdWVzdFVSTCIsInhockFkYXB0ZXIiLCJQcm9taXNlIiwiZGlzcGF0Y2hYaHJSZXF1ZXN0IiwicmVxdWVzdERhdGEiLCJyZXF1ZXN0SGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0IiwiYXV0aCIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJ1bmVzY2FwZSIsIkF1dGhvcml6YXRpb24iLCJidG9hIiwiZnVsbFBhdGgiLCJtZXRob2QiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJoYW5kbGVMb2FkIiwicmVhZHlTdGF0ZSIsInJlc3BvbnNlVVJMIiwicmVzcG9uc2VIZWFkZXJzIiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwicmVzcG9uc2VEYXRhIiwicmVzcG9uc2VUeXBlIiwicmVzcG9uc2VUZXh0Iiwic3RhdHVzVGV4dCIsIm9uYWJvcnQiLCJoYW5kbGVBYm9ydCIsIm9uZXJyb3IiLCJoYW5kbGVFcnJvciIsIm9udGltZW91dCIsImhhbmRsZVRpbWVvdXQiLCJ0aW1lb3V0RXJyb3JNZXNzYWdlIiwieHNyZlZhbHVlIiwid2l0aENyZWRlbnRpYWxzIiwieHNyZkNvb2tpZU5hbWUiLCJjb29raWVzIiwidW5kZWZpbmVkIiwieHNyZkhlYWRlck5hbWUiLCJzZXRSZXF1ZXN0SGVhZGVyIiwib25Eb3dubG9hZFByb2dyZXNzIiwib25VcGxvYWRQcm9ncmVzcyIsInVwbG9hZCIsImNhbmNlbFRva2VuIiwicHJvbWlzZSIsInRoZW4iLCJvbkNhbmNlbGVkIiwiY2FuY2VsIiwiYWJvcnQiLCJzZW5kIiwiREVGQVVMVF9DT05URU5UX1RZUEUiLCJzZXRDb250ZW50VHlwZUlmVW5zZXQiLCJnZXREZWZhdWx0QWRhcHRlciIsImFkYXB0ZXIiLCJyZXF1aXJlJCQwIiwicHJvY2VzcyIsInJlcXVpcmUkJDEiLCJkZWZhdWx0cyIsInRyYW5zZm9ybVJlcXVlc3QiLCJ0cmFuc2Zvcm1SZXNwb25zZSIsInBhcnNlIiwibWF4Q29udGVudExlbmd0aCIsIm1heEJvZHlMZW5ndGgiLCJjb21tb24iLCJmb3JFYWNoTWV0aG9kTm9EYXRhIiwiZm9yRWFjaE1ldGhvZFdpdGhEYXRhIiwidGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZCIsInRocm93SWZSZXF1ZXN0ZWQiLCJkaXNwYXRjaFJlcXVlc3QiLCJjbGVhbkhlYWRlckNvbmZpZyIsIm9uQWRhcHRlclJlc29sdXRpb24iLCJvbkFkYXB0ZXJSZWplY3Rpb24iLCJyZWFzb24iLCJtZXJnZUNvbmZpZyIsImNvbmZpZzEiLCJjb25maWcyIiwidmFsdWVGcm9tQ29uZmlnMktleXMiLCJtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyIsImRlZmF1bHRUb0NvbmZpZzJLZXlzIiwiZGlyZWN0TWVyZ2VLZXlzIiwiZ2V0TWVyZ2VkVmFsdWUiLCJzb3VyY2UiLCJtZXJnZURlZXBQcm9wZXJ0aWVzIiwicHJvcCIsInZhbHVlRnJvbUNvbmZpZzIiLCJkZWZhdWx0VG9Db25maWcyIiwiYXhpb3NLZXlzIiwib3RoZXJLZXlzIiwia2V5cyIsImZpbHRlciIsImZpbHRlckF4aW9zS2V5cyIsIkF4aW9zIiwiaW5zdGFuY2VDb25maWciLCJpbnRlcmNlcHRvcnMiLCJjaGFpbiIsInVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzIiwiaW50ZXJjZXB0b3IiLCJ1bnNoaWZ0IiwicHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzIiwic2hpZnQiLCJnZXRVcmkiLCJDYW5jZWwiLCJDYW5jZWxUb2tlbiIsImV4ZWN1dG9yIiwiVHlwZUVycm9yIiwicmVzb2x2ZVByb21pc2UiLCJwcm9taXNlRXhlY3V0b3IiLCJ0b2tlbiIsImMiLCJzcHJlYWQiLCJjYWxsYmFjayIsImFyciIsImNyZWF0ZUluc3RhbmNlIiwiZGVmYXVsdENvbmZpZyIsImNvbnRleHQiLCJpbnN0YW5jZSIsImF4aW9zIiwiY3JlYXRlIiwicmVxdWlyZSQkMiIsImFsbCIsInByb21pc2VzIiwicmVxdWlyZSQkMyIsImF0dHJpYnV0ZVRvU3RyaW5nIiwiYXR0cmlidXRlIiwiYXhpb3NDb25maWciLCJnZXRDYXJ0IiwiZ2V0UHJvZHVjdCIsImhhbmRsZSIsImNsZWFyQ2FydCIsInBvc3QiLCJ1cGRhdGVDYXJ0RnJvbUZvcm0iLCJmb3JtIiwiY2hhbmdlSXRlbUJ5S2V5T3JJZCIsImtleU9ySWQiLCJxdWFudGl0eSIsInJlbW92ZUl0ZW1CeUtleU9ySWQiLCJjaGFuZ2VJdGVtQnlMaW5lIiwicmVtb3ZlSXRlbUJ5TGluZSIsImFkZEl0ZW0iLCJwcm9wZXJ0aWVzIiwiYWRkSXRlbUZyb21Gb3JtIiwidXBkYXRlQ2FydEF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVzIiwidXBkYXRlQ2FydE5vdGUiLCJub3RlIiwiZGF0b21hciIsIkJTTiIsImFwaSIsImFqYXhBUElDcmVhdG9yIl0sIm1hcHBpbmdzIjoiOzs7OztFQUFBOzs7OztFQUtBLElBQUlBLGtCQUFrQixHQUFHLHNCQUFzQkMsUUFBUSxDQUFDQyxJQUFULENBQWNDLEtBQXBDLEdBQTRDLHFCQUE1QyxHQUFvRSxlQUE3RjtFQUVBLElBQUlDLGlCQUFpQixHQUFHLHNCQUFzQkgsUUFBUSxDQUFDQyxJQUFULENBQWNDLEtBQXBDLElBQTZDLGdCQUFnQkYsUUFBUSxDQUFDQyxJQUFULENBQWNDLEtBQW5HO0VBRUEsSUFBSUUsa0JBQWtCLEdBQUcsc0JBQXNCSixRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBcEMsR0FBNEMsMEJBQTVDLEdBQXlFLG9CQUFsRzs7RUFFQSxTQUFTRyw0QkFBVCxDQUFzQ0MsT0FBdEMsRUFBK0M7RUFDN0MsTUFBSUMsUUFBUSxHQUFHSixpQkFBaUIsR0FBR0ssVUFBVSxDQUFDQyxnQkFBZ0IsQ0FBQ0gsT0FBRCxDQUFoQixDQUEwQkYsa0JBQTFCLENBQUQsQ0FBYixHQUErRCxDQUEvRjtFQUNBRyxFQUFBQSxRQUFRLEdBQUcsT0FBT0EsUUFBUCxLQUFvQixRQUFwQixJQUFnQyxDQUFDRyxLQUFLLENBQUNILFFBQUQsQ0FBdEMsR0FBbURBLFFBQVEsR0FBRyxJQUE5RCxHQUFxRSxDQUFoRjtFQUNBLFNBQU9BLFFBQVA7RUFDRDs7RUFFRCxTQUFTSSxvQkFBVCxDQUE4QkwsT0FBOUIsRUFBc0NNLE9BQXRDLEVBQThDO0VBQzVDLE1BQUlDLE1BQU0sR0FBRyxDQUFiO0VBQUEsTUFBZ0JOLFFBQVEsR0FBR0YsNEJBQTRCLENBQUNDLE9BQUQsQ0FBdkQ7RUFDQUMsRUFBQUEsUUFBUSxHQUFHRCxPQUFPLENBQUNRLGdCQUFSLENBQTBCZixrQkFBMUIsRUFBOEMsU0FBU2dCLG9CQUFULENBQThCQyxDQUE5QixFQUFnQztFQUM3RSxLQUFDSCxN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
