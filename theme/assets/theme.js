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

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ib290c3RyYXAubmF0aXZlL2Rpc3QvYm9vdHN0cmFwLW5hdGl2ZS5lc20uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gICogTmF0aXZlIEphdmFTY3JpcHQgZm9yIEJvb3RzdHJhcCB2My4wLjkgKGh0dHBzOi8vdGhlZG5wLmdpdGh1Yi5pby9ib290c3RyYXAubmF0aXZlLylcbiAgKiBDb3B5cmlnaHQgMjAxNS0yMDIwIMKpIGRucF90aGVtZVxuICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3RoZWRucC9ib290c3RyYXAubmF0aXZlL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gICovXG52YXIgdHJhbnNpdGlvbkVuZEV2ZW50ID0gJ3dlYmtpdFRyYW5zaXRpb24nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgPyAnd2Via2l0VHJhbnNpdGlvbkVuZCcgOiAndHJhbnNpdGlvbmVuZCc7XG5cbnZhciBzdXBwb3J0VHJhbnNpdGlvbiA9ICd3ZWJraXRUcmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICd0cmFuc2l0aW9uJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlO1xuXG52YXIgdHJhbnNpdGlvbkR1cmF0aW9uID0gJ3dlYmtpdFRyYW5zaXRpb24nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgPyAnd2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uJyA6ICd0cmFuc2l0aW9uRHVyYXRpb24nO1xuXG5mdW5jdGlvbiBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGR1cmF0aW9uID0gc3VwcG9ydFRyYW5zaXRpb24gPyBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoZWxlbWVudClbdHJhbnNpdGlvbkR1cmF0aW9uXSkgOiAwO1xuICBkdXJhdGlvbiA9IHR5cGVvZiBkdXJhdGlvbiA9PT0gJ251bWJlcicgJiYgIWlzTmFOKGR1cmF0aW9uKSA/IGR1cmF0aW9uICogMTAwMCA6IDA7XG4gIHJldHVybiBkdXJhdGlvbjtcbn1cblxuZnVuY3Rpb24gZW11bGF0ZVRyYW5zaXRpb25FbmQoZWxlbWVudCxoYW5kbGVyKXtcbiAgdmFyIGNhbGxlZCA9IDAsIGR1cmF0aW9uID0gZ2V0RWxlbWVudFRyYW5zaXRpb25EdXJhdGlvbihlbGVtZW50KTtcbiAgZHVyYXRpb24gPyBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoIHRyYW5zaXRpb25FbmRFdmVudCwgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZFdyYXBwZXIoZSl7XG4gICAgICAgICAgICAgICFjYWxsZWQgJiYgaGFuZGxlcihlKSwgY2FsbGVkID0gMTtcbiAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCB0cmFuc2l0aW9uRW5kRXZlbnQsIHRyYW5zaXRpb25FbmRXcmFwcGVyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgIDogc2V0VGltZW91dChmdW5jdGlvbigpIHsgIWNhbGxlZCAmJiBoYW5kbGVyKCksIGNhbGxlZCA9IDE7IH0sIDE3KTtcbn1cblxuZnVuY3Rpb24gcXVlcnlFbGVtZW50KHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgdmFyIGxvb2tVcCA9IHBhcmVudCAmJiBwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogZG9jdW1lbnQ7XG4gIHJldHVybiBzZWxlY3RvciBpbnN0YW5jZW9mIEVsZW1lbnQgPyBzZWxlY3RvciA6IGxvb2tVcC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCBjb21wb25lbnROYW1lLCByZWxhdGVkKSB7XG4gIHZhciBPcmlnaW5hbEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCBldmVudE5hbWUgKyAnLmJzLicgKyBjb21wb25lbnROYW1lLCB7Y2FuY2VsYWJsZTogdHJ1ZX0pO1xuICBPcmlnaW5hbEN1c3RvbUV2ZW50LnJlbGF0ZWRUYXJnZXQgPSByZWxhdGVkO1xuICByZXR1cm4gT3JpZ2luYWxDdXN0b21FdmVudDtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hDdXN0b21FdmVudChjdXN0b21FdmVudCl7XG4gIHRoaXMgJiYgdGhpcy5kaXNwYXRjaEV2ZW50KGN1c3RvbUV2ZW50KTtcbn1cblxuZnVuY3Rpb24gQWxlcnQoZWxlbWVudCkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgYWxlcnQsXG4gICAgY2xvc2VDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdjbG9zZScsJ2FsZXJ0JyksXG4gICAgY2xvc2VkQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnY2xvc2VkJywnYWxlcnQnKTtcbiAgZnVuY3Rpb24gdHJpZ2dlckhhbmRsZXIoKSB7XG4gICAgYWxlcnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChhbGVydCx0cmFuc2l0aW9uRW5kSGFuZGxlcikgOiB0cmFuc2l0aW9uRW5kSGFuZGxlcigpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pe1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0oJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgYWxlcnQgPSBlICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuYWxlcnRcIik7XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudCgnW2RhdGEtZGlzbWlzcz1cImFsZXJ0XCJdJyxhbGVydCk7XG4gICAgZWxlbWVudCAmJiBhbGVydCAmJiAoZWxlbWVudCA9PT0gZS50YXJnZXQgfHwgZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkpICYmIHNlbGYuY2xvc2UoKTtcbiAgfVxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kSGFuZGxlcigpIHtcbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBhbGVydC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGFsZXJ0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoYWxlcnQsY2xvc2VkQ3VzdG9tRXZlbnQpO1xuICB9XG4gIHNlbGYuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBhbGVydCAmJiBlbGVtZW50ICYmIGFsZXJ0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFsZXJ0LGNsb3NlQ3VzdG9tRXZlbnQpO1xuICAgICAgaWYgKCBjbG9zZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgICAgc2VsZi5kaXNwb3NlKCk7XG4gICAgICBhbGVydC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICB0cmlnZ2VySGFuZGxlcigpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkFsZXJ0O1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBhbGVydCA9IGVsZW1lbnQuY2xvc2VzdCgnLmFsZXJ0Jyk7XG4gIGVsZW1lbnQuQWxlcnQgJiYgZWxlbWVudC5BbGVydC5kaXNwb3NlKCk7XG4gIGlmICggIWVsZW1lbnQuQWxlcnQgKSB7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICB9XG4gIHNlbGYuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIGVsZW1lbnQuQWxlcnQgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBCdXR0b24oZWxlbWVudCkge1xuICB2YXIgc2VsZiA9IHRoaXMsIGxhYmVscyxcbiAgICAgIGNoYW5nZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2NoYW5nZScsICdidXR0b24nKTtcbiAgZnVuY3Rpb24gdG9nZ2xlKGUpIHtcbiAgICB2YXIgaW5wdXQsXG4gICAgICAgIGxhYmVsID0gZS50YXJnZXQudGFnTmFtZSA9PT0gJ0xBQkVMJyA/IGUudGFyZ2V0XG4gICAgICAgICAgICAgIDogZS50YXJnZXQuY2xvc2VzdCgnTEFCRUwnKSA/IGUudGFyZ2V0LmNsb3Nlc3QoJ0xBQkVMJykgOiBudWxsO1xuICAgIGlucHV0ID0gbGFiZWwgJiYgbGFiZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0lOUFVUJylbMF07XG4gICAgaWYgKCAhaW5wdXQgKSB7IHJldHVybjsgfVxuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChpbnB1dCwgY2hhbmdlQ3VzdG9tRXZlbnQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBjaGFuZ2VDdXN0b21FdmVudCk7XG4gICAgaWYgKCBpbnB1dC50eXBlID09PSAnY2hlY2tib3gnICkge1xuICAgICAgaWYgKCBjaGFuZ2VDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgIGlmICggIWlucHV0LmNoZWNrZWQgKSB7XG4gICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKCdjaGVja2VkJywnY2hlY2tlZCcpO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcbiAgICAgICAgaW5wdXQucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudC50b2dnbGVkKSB7XG4gICAgICAgIGVsZW1lbnQudG9nZ2xlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggaW5wdXQudHlwZSA9PT0gJ3JhZGlvJyAmJiAhZWxlbWVudC50b2dnbGVkICkge1xuICAgICAgaWYgKCBjaGFuZ2VDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgIGlmICggIWlucHV0LmNoZWNrZWQgfHwgKGUuc2NyZWVuWCA9PT0gMCAmJiBlLnNjcmVlblkgPT0gMCkgKSB7XG4gICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdmb2N1cycpO1xuICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCdjaGVja2VkJyk7XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBlbGVtZW50LnRvZ2dsZWQgPSB0cnVlO1xuICAgICAgICBBcnJheS5mcm9tKGxhYmVscykubWFwKGZ1bmN0aW9uIChvdGhlckxhYmVsKXtcbiAgICAgICAgICB2YXIgb3RoZXJJbnB1dCA9IG90aGVyTGFiZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0lOUFVUJylbMF07XG4gICAgICAgICAgaWYgKCBvdGhlckxhYmVsICE9PSBsYWJlbCAmJiBvdGhlckxhYmVsLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgKSAge1xuICAgICAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG90aGVySW5wdXQsIGNoYW5nZUN1c3RvbUV2ZW50KTtcbiAgICAgICAgICAgIG90aGVyTGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICBvdGhlcklucHV0LnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgb3RoZXJJbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkgeyBlbGVtZW50LnRvZ2dsZWQgPSBmYWxzZTsgfSwgNTAgKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlIYW5kbGVyKGUpIHtcbiAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAga2V5ID09PSAzMiAmJiBlLnRhcmdldCA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiB0b2dnbGUoZSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJldmVudFNjcm9sbChlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGtleSA9PT0gMzIgJiYgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIGZ1bmN0aW9uIGZvY3VzVG9nZ2xlKGUpIHtcbiAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0lOUFVUJyApIHtcbiAgICAgIHZhciBhY3Rpb24gPSBlLnR5cGUgPT09ICdmb2N1c2luJyA/ICdhZGQnIDogJ3JlbW92ZSc7XG4gICAgICBlLnRhcmdldC5jbG9zZXN0KCcuYnRuJykuY2xhc3NMaXN0W2FjdGlvbl0oJ2ZvY3VzJyk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUV2ZW50cyhhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgZWxlbWVudFthY3Rpb25dKCdjbGljaycsdG9nZ2xlLGZhbHNlICk7XG4gICAgZWxlbWVudFthY3Rpb25dKCdrZXl1cCcsa2V5SGFuZGxlcixmYWxzZSksIGVsZW1lbnRbYWN0aW9uXSgna2V5ZG93bicscHJldmVudFNjcm9sbCxmYWxzZSk7XG4gICAgZWxlbWVudFthY3Rpb25dKCdmb2N1c2luJyxmb2N1c1RvZ2dsZSxmYWxzZSksIGVsZW1lbnRbYWN0aW9uXSgnZm9jdXNvdXQnLGZvY3VzVG9nZ2xlLGZhbHNlKTtcbiAgfVxuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgZGVsZXRlIGVsZW1lbnQuQnV0dG9uO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LkJ1dHRvbiAmJiBlbGVtZW50LkJ1dHRvbi5kaXNwb3NlKCk7XG4gIGxhYmVscyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYnRuJyk7XG4gIGlmICghbGFiZWxzLmxlbmd0aCkgeyByZXR1cm47IH1cbiAgaWYgKCAhZWxlbWVudC5CdXR0b24gKSB7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICB9XG4gIGVsZW1lbnQudG9nZ2xlZCA9IGZhbHNlO1xuICBlbGVtZW50LkJ1dHRvbiA9IHNlbGY7XG4gIEFycmF5LmZyb20obGFiZWxzKS5tYXAoZnVuY3Rpb24gKGJ0bil7XG4gICAgIWJ0bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpXG4gICAgICAmJiBxdWVyeUVsZW1lbnQoJ2lucHV0OmNoZWNrZWQnLGJ0bilcbiAgICAgICYmIGJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBidG4uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKVxuICAgICAgJiYgIXF1ZXJ5RWxlbWVudCgnaW5wdXQ6Y2hlY2tlZCcsYnRuKVxuICAgICAgJiYgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICB9KTtcbn1cblxudmFyIG1vdXNlSG92ZXJFdmVudHMgPSAoJ29ubW91c2VsZWF2ZScgaW4gZG9jdW1lbnQpID8gWyAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gOiBbICdtb3VzZW92ZXInLCAnbW91c2VvdXQnIF07XG5cbnZhciBzdXBwb3J0UGFzc2l2ZSA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiB3cmFwKCl7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgd3JhcCwgb3B0cyk7XG4gICAgfSwgb3B0cyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHJldHVybiByZXN1bHQ7XG59KSgpO1xuXG52YXIgcGFzc2l2ZUhhbmRsZXIgPSBzdXBwb3J0UGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2U7XG5cbmZ1bmN0aW9uIGlzRWxlbWVudEluU2Nyb2xsUmFuZ2UoZWxlbWVudCkge1xuICB2YXIgYmNyID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gIHJldHVybiBiY3IudG9wIDw9IHZpZXdwb3J0SGVpZ2h0ICYmIGJjci5ib3R0b20gPj0gMDtcbn1cblxuZnVuY3Rpb24gQ2Fyb3VzZWwgKGVsZW1lbnQsb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIHZhcnMsIG9wcyxcbiAgICBzbGlkZUN1c3RvbUV2ZW50LCBzbGlkQ3VzdG9tRXZlbnQsXG4gICAgc2xpZGVzLCBsZWZ0QXJyb3csIHJpZ2h0QXJyb3csIGluZGljYXRvciwgaW5kaWNhdG9ycztcbiAgZnVuY3Rpb24gcGF1c2VIYW5kbGVyKCkge1xuICAgIGlmICggb3BzLmludGVydmFsICE9PWZhbHNlICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncGF1c2VkJykgKSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3BhdXNlZCcpO1xuICAgICAgIXZhcnMuaXNTbGlkaW5nICYmICggY2xlYXJJbnRlcnZhbCh2YXJzLnRpbWVyKSwgdmFycy50aW1lciA9IG51bGwgKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVzdW1lSGFuZGxlcigpIHtcbiAgICBpZiAoIG9wcy5pbnRlcnZhbCAhPT0gZmFsc2UgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BhdXNlZCcpICkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdwYXVzZWQnKTtcbiAgICAgICF2YXJzLmlzU2xpZGluZyAmJiAoIGNsZWFySW50ZXJ2YWwodmFycy50aW1lciksIHZhcnMudGltZXIgPSBudWxsICk7XG4gICAgICAhdmFycy5pc1NsaWRpbmcgJiYgc2VsZi5jeWNsZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBpbmRpY2F0b3JIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHZhciBldmVudFRhcmdldCA9IGUudGFyZ2V0O1xuICAgIGlmICggZXZlbnRUYXJnZXQgJiYgIWV2ZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgJiYgZXZlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNsaWRlLXRvJykgKSB7XG4gICAgICB2YXJzLmluZGV4ID0gcGFyc2VJbnQoIGV2ZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zbGlkZS10bycpKTtcbiAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBzZWxmLnNsaWRlVG8oIHZhcnMuaW5kZXggKTtcbiAgfVxuICBmdW5jdGlvbiBjb250cm9sc0hhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodmFycy5pc1NsaWRpbmcpIHsgcmV0dXJuOyB9XG4gICAgdmFyIGV2ZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZiAoIGV2ZW50VGFyZ2V0ID09PSByaWdodEFycm93ICkge1xuICAgICAgdmFycy5pbmRleCsrO1xuICAgIH0gZWxzZSBpZiAoIGV2ZW50VGFyZ2V0ID09PSBsZWZ0QXJyb3cgKSB7XG4gICAgICB2YXJzLmluZGV4LS07XG4gICAgfVxuICAgIHNlbGYuc2xpZGVUbyggdmFycy5pbmRleCApO1xuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIocmVmKSB7XG4gICAgdmFyIHdoaWNoID0gcmVmLndoaWNoO1xuICAgIGlmICh2YXJzLmlzU2xpZGluZykgeyByZXR1cm47IH1cbiAgICBzd2l0Y2ggKHdoaWNoKSB7XG4gICAgICBjYXNlIDM5OlxuICAgICAgICB2YXJzLmluZGV4Kys7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzNzpcbiAgICAgICAgdmFycy5pbmRleC0tO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5zbGlkZVRvKCB2YXJzLmluZGV4ICk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBpZiAoIG9wcy5wYXVzZSAmJiBvcHMuaW50ZXJ2YWwgKSB7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMF0sIHBhdXNlSGFuZGxlciwgZmFsc2UgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggbW91c2VIb3ZlckV2ZW50c1sxXSwgcmVzdW1lSGFuZGxlciwgZmFsc2UgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggJ3RvdWNoc3RhcnQnLCBwYXVzZUhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaGVuZCcsIHJlc3VtZUhhbmRsZXIsIHBhc3NpdmVIYW5kbGVyICk7XG4gICAgfVxuICAgIG9wcy50b3VjaCAmJiBzbGlkZXMubGVuZ3RoID4gMSAmJiBlbGVtZW50W2FjdGlvbl0oICd0b3VjaHN0YXJ0JywgdG91Y2hEb3duSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICByaWdodEFycm93ICYmIHJpZ2h0QXJyb3dbYWN0aW9uXSggJ2NsaWNrJywgY29udHJvbHNIYW5kbGVyLGZhbHNlICk7XG4gICAgbGVmdEFycm93ICYmIGxlZnRBcnJvd1thY3Rpb25dKCAnY2xpY2snLCBjb250cm9sc0hhbmRsZXIsZmFsc2UgKTtcbiAgICBpbmRpY2F0b3IgJiYgaW5kaWNhdG9yW2FjdGlvbl0oICdjbGljaycsIGluZGljYXRvckhhbmRsZXIsZmFsc2UgKTtcbiAgICBvcHMua2V5Ym9hcmQgJiYgd2luZG93W2FjdGlvbl0oICdrZXlkb3duJywga2V5SGFuZGxlcixmYWxzZSApO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZVRvdWNoRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBlbGVtZW50W2FjdGlvbl0oICd0b3VjaG1vdmUnLCB0b3VjaE1vdmVIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIGVsZW1lbnRbYWN0aW9uXSggJ3RvdWNoZW5kJywgdG91Y2hFbmRIYW5kbGVyLCBwYXNzaXZlSGFuZGxlciApO1xuICB9XG4gIGZ1bmN0aW9uIHRvdWNoRG93bkhhbmRsZXIoZSkge1xuICAgIGlmICggdmFycy5pc1RvdWNoICkgeyByZXR1cm47IH1cbiAgICB2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcbiAgICBpZiAoIGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpICkge1xuICAgICAgdmFycy5pc1RvdWNoID0gdHJ1ZTtcbiAgICAgIHRvZ2dsZVRvdWNoRXZlbnRzKDEpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b3VjaE1vdmVIYW5kbGVyKGUpIHtcbiAgICBpZiAoICF2YXJzLmlzVG91Y2ggKSB7IGUucHJldmVudERlZmF1bHQoKTsgcmV0dXJuOyB9XG4gICAgdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcbiAgICBpZiAoIGUudHlwZSA9PT0gJ3RvdWNobW92ZScgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPiAxICkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b3VjaEVuZEhhbmRsZXIgKGUpIHtcbiAgICBpZiAoICF2YXJzLmlzVG91Y2ggfHwgdmFycy5pc1NsaWRpbmcgKSB7IHJldHVybiB9XG4gICAgdmFycy50b3VjaFBvc2l0aW9uLmVuZFggPSB2YXJzLnRvdWNoUG9zaXRpb24uY3VycmVudFggfHwgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcbiAgICBpZiAoIHZhcnMuaXNUb3VjaCApIHtcbiAgICAgIGlmICggKCFlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSB8fCAhZWxlbWVudC5jb250YWlucyhlLnJlbGF0ZWRUYXJnZXQpIClcbiAgICAgICAgICAmJiBNYXRoLmFicyh2YXJzLnRvdWNoUG9zaXRpb24uc3RhcnRYIC0gdmFycy50b3VjaFBvc2l0aW9uLmVuZFgpIDwgNzUgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICggdmFycy50b3VjaFBvc2l0aW9uLmN1cnJlbnRYIDwgdmFycy50b3VjaFBvc2l0aW9uLnN0YXJ0WCApIHtcbiAgICAgICAgICB2YXJzLmluZGV4Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoIHZhcnMudG91Y2hQb3NpdGlvbi5jdXJyZW50WCA+IHZhcnMudG91Y2hQb3NpdGlvbi5zdGFydFggKSB7XG4gICAgICAgICAgdmFycy5pbmRleC0tO1xuICAgICAgICB9XG4gICAgICAgIHZhcnMuaXNUb3VjaCA9IGZhbHNlO1xuICAgICAgICBzZWxmLnNsaWRlVG8odmFycy5pbmRleCk7XG4gICAgICB9XG4gICAgICB0b2dnbGVUb3VjaEV2ZW50cygpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBzZXRBY3RpdmVQYWdlKHBhZ2VJbmRleCkge1xuICAgIEFycmF5LmZyb20oaW5kaWNhdG9ycykubWFwKGZ1bmN0aW9uICh4KXt4LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO30pO1xuICAgIGluZGljYXRvcnNbcGFnZUluZGV4XSAmJiBpbmRpY2F0b3JzW3BhZ2VJbmRleF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gIH1cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZEhhbmRsZXIoZSl7XG4gICAgaWYgKHZhcnMudG91Y2hQb3NpdGlvbil7XG4gICAgICB2YXIgbmV4dCA9IHZhcnMuaW5kZXgsXG4gICAgICAgICAgdGltZW91dCA9IGUgJiYgZS50YXJnZXQgIT09IHNsaWRlc1tuZXh0XSA/IGUuZWxhcHNlZFRpbWUqMTAwMCsxMDAgOiAyMCxcbiAgICAgICAgICBhY3RpdmVJdGVtID0gc2VsZi5nZXRBY3RpdmVJbmRleCgpLFxuICAgICAgICAgIG9yaWVudGF0aW9uID0gdmFycy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICduZXh0JyA6ICdwcmV2JztcbiAgICAgIHZhcnMuaXNTbGlkaW5nICYmIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodmFycy50b3VjaFBvc2l0aW9uKXtcbiAgICAgICAgICB2YXJzLmlzU2xpZGluZyA9IGZhbHNlO1xuICAgICAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArIG9yaWVudGF0aW9uKSk7XG4gICAgICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgICAgICBzbGlkZXNbYWN0aXZlSXRlbV0uY2xhc3NMaXN0LnJlbW92ZSgoXCJjYXJvdXNlbC1pdGVtLVwiICsgKHZhcnMuZGlyZWN0aW9uKSkpO1xuICAgICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkQ3VzdG9tRXZlbnQpO1xuICAgICAgICAgIGlmICggIWRvY3VtZW50LmhpZGRlbiAmJiBvcHMuaW50ZXJ2YWwgJiYgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgICAgICAgIHNlbGYuY3ljbGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH1cbiAgfVxuICBzZWxmLmN5Y2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh2YXJzLnRpbWVyKSB7XG4gICAgICBjbGVhckludGVydmFsKHZhcnMudGltZXIpO1xuICAgICAgdmFycy50aW1lciA9IG51bGw7XG4gICAgfVxuICAgIHZhcnMudGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaWR4ID0gdmFycy5pbmRleCB8fCBzZWxmLmdldEFjdGl2ZUluZGV4KCk7XG4gICAgICBpc0VsZW1lbnRJblNjcm9sbFJhbmdlKGVsZW1lbnQpICYmIChpZHgrKywgc2VsZi5zbGlkZVRvKCBpZHggKSApO1xuICAgIH0sIG9wcy5pbnRlcnZhbCk7XG4gIH07XG4gIHNlbGYuc2xpZGVUbyA9IGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgaWYgKHZhcnMuaXNTbGlkaW5nKSB7IHJldHVybjsgfVxuICAgIHZhciBhY3RpdmVJdGVtID0gc2VsZi5nZXRBY3RpdmVJbmRleCgpLCBvcmllbnRhdGlvbjtcbiAgICBpZiAoIGFjdGl2ZUl0ZW0gPT09IG5leHQgKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICAoIChhY3RpdmVJdGVtIDwgbmV4dCApIHx8IChhY3RpdmVJdGVtID09PSAwICYmIG5leHQgPT09IHNsaWRlcy5sZW5ndGggLTEgKSApIHtcbiAgICAgIHZhcnMuZGlyZWN0aW9uID0gJ2xlZnQnO1xuICAgIH0gZWxzZSBpZiAgKCAoYWN0aXZlSXRlbSA+IG5leHQpIHx8IChhY3RpdmVJdGVtID09PSBzbGlkZXMubGVuZ3RoIC0gMSAmJiBuZXh0ID09PSAwICkgKSB7XG4gICAgICB2YXJzLmRpcmVjdGlvbiA9ICdyaWdodCc7XG4gICAgfVxuICAgIGlmICggbmV4dCA8IDAgKSB7IG5leHQgPSBzbGlkZXMubGVuZ3RoIC0gMTsgfVxuICAgIGVsc2UgaWYgKCBuZXh0ID49IHNsaWRlcy5sZW5ndGggKXsgbmV4dCA9IDA7IH1cbiAgICBvcmllbnRhdGlvbiA9IHZhcnMuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAnbmV4dCcgOiAncHJldic7XG4gICAgc2xpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzbGlkZScsICdjYXJvdXNlbCcsIHNsaWRlc1tuZXh0XSk7XG4gICAgc2xpZEN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3NsaWQnLCAnY2Fyb3VzZWwnLCBzbGlkZXNbbmV4dF0pO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoc2xpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgIHZhcnMuaW5kZXggPSBuZXh0O1xuICAgIHZhcnMuaXNTbGlkaW5nID0gdHJ1ZTtcbiAgICBjbGVhckludGVydmFsKHZhcnMudGltZXIpO1xuICAgIHZhcnMudGltZXIgPSBudWxsO1xuICAgIHNldEFjdGl2ZVBhZ2UoIG5leHQgKTtcbiAgICBpZiAoIGdldEVsZW1lbnRUcmFuc2l0aW9uRHVyYXRpb24oc2xpZGVzW25leHRdKSAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnc2xpZGUnKSApIHtcbiAgICAgIHNsaWRlc1tuZXh0XS5jbGFzc0xpc3QuYWRkKChcImNhcm91c2VsLWl0ZW0tXCIgKyBvcmllbnRhdGlvbikpO1xuICAgICAgc2xpZGVzW25leHRdLm9mZnNldFdpZHRoO1xuICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5hZGQoKFwiY2Fyb3VzZWwtaXRlbS1cIiArICh2YXJzLmRpcmVjdGlvbikpKTtcbiAgICAgIHNsaWRlc1thY3RpdmVJdGVtXS5jbGFzc0xpc3QuYWRkKChcImNhcm91c2VsLWl0ZW0tXCIgKyAodmFycy5kaXJlY3Rpb24pKSk7XG4gICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChzbGlkZXNbbmV4dF0sIHRyYW5zaXRpb25FbmRIYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xpZGVzW25leHRdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgc2xpZGVzW25leHRdLm9mZnNldFdpZHRoO1xuICAgICAgc2xpZGVzW2FjdGl2ZUl0ZW1dLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhcnMuaXNTbGlkaW5nID0gZmFsc2U7XG4gICAgICAgIGlmICggb3BzLmludGVydmFsICYmIGVsZW1lbnQgJiYgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYXVzZWQnKSApIHtcbiAgICAgICAgICBzZWxmLmN5Y2xlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNsaWRDdXN0b21FdmVudCk7XG4gICAgICB9LCAxMDAgKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuZ2V0QWN0aXZlSW5kZXggPSBmdW5jdGlvbiAoKSB7IHJldHVybiBBcnJheS5mcm9tKHNsaWRlcykuaW5kZXhPZihlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWl0ZW0gYWN0aXZlJylbMF0pIHx8IDA7IH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXRlbUNsYXNzZXMgPSBbJ2xlZnQnLCdyaWdodCcsJ3ByZXYnLCduZXh0J107XG4gICAgQXJyYXkuZnJvbShzbGlkZXMpLm1hcChmdW5jdGlvbiAoc2xpZGUsaWR4KSB7XG4gICAgICBzbGlkZS5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmIHNldEFjdGl2ZVBhZ2UoIGlkeCApO1xuICAgICAgaXRlbUNsYXNzZXMubWFwKGZ1bmN0aW9uIChjbHMpIHsgcmV0dXJuIHNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoKFwiY2Fyb3VzZWwtaXRlbS1cIiArIGNscykpOyB9KTtcbiAgICB9KTtcbiAgICBjbGVhckludGVydmFsKHZhcnMudGltZXIpO1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIHZhcnMgPSB7fTtcbiAgICBvcHMgPSB7fTtcbiAgICBkZWxldGUgZWxlbWVudC5DYXJvdXNlbDtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuICBlbGVtZW50LkNhcm91c2VsICYmIGVsZW1lbnQuQ2Fyb3VzZWwuZGlzcG9zZSgpO1xuICBzbGlkZXMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsLWl0ZW0nKTtcbiAgbGVmdEFycm93ID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYXJvdXNlbC1jb250cm9sLXByZXYnKVswXTtcbiAgcmlnaHRBcnJvdyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtY29udHJvbC1uZXh0JylbMF07XG4gIGluZGljYXRvciA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWwtaW5kaWNhdG9ycycpWzBdO1xuICBpbmRpY2F0b3JzID0gaW5kaWNhdG9yICYmIGluZGljYXRvci5nZXRFbGVtZW50c0J5VGFnTmFtZSggXCJMSVwiICkgfHwgW107XG4gIGlmIChzbGlkZXMubGVuZ3RoIDwgMikgeyByZXR1cm4gfVxuICB2YXJcbiAgICBpbnRlcnZhbEF0dHJpYnV0ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWludGVydmFsJyksXG4gICAgaW50ZXJ2YWxEYXRhID0gaW50ZXJ2YWxBdHRyaWJ1dGUgPT09ICdmYWxzZScgPyAwIDogcGFyc2VJbnQoaW50ZXJ2YWxBdHRyaWJ1dGUpLFxuICAgIHRvdWNoRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRvdWNoJykgPT09ICdmYWxzZScgPyAwIDogMSxcbiAgICBwYXVzZURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXVzZScpID09PSAnaG92ZXInIHx8IGZhbHNlLFxuICAgIGtleWJvYXJkRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWtleWJvYXJkJykgPT09ICd0cnVlJyB8fCBmYWxzZSxcbiAgICBpbnRlcnZhbE9wdGlvbiA9IG9wdGlvbnMuaW50ZXJ2YWwsXG4gICAgdG91Y2hPcHRpb24gPSBvcHRpb25zLnRvdWNoO1xuICBvcHMgPSB7fTtcbiAgb3BzLmtleWJvYXJkID0gb3B0aW9ucy5rZXlib2FyZCA9PT0gdHJ1ZSB8fCBrZXlib2FyZERhdGE7XG4gIG9wcy5wYXVzZSA9IChvcHRpb25zLnBhdXNlID09PSAnaG92ZXInIHx8IHBhdXNlRGF0YSkgPyAnaG92ZXInIDogZmFsc2U7XG4gIG9wcy50b3VjaCA9IHRvdWNoT3B0aW9uIHx8IHRvdWNoRGF0YTtcbiAgb3BzLmludGVydmFsID0gdHlwZW9mIGludGVydmFsT3B0aW9uID09PSAnbnVtYmVyJyA/IGludGVydmFsT3B0aW9uXG4gICAgICAgICAgICAgIDogaW50ZXJ2YWxPcHRpb24gPT09IGZhbHNlIHx8IGludGVydmFsRGF0YSA9PT0gMCB8fCBpbnRlcnZhbERhdGEgPT09IGZhbHNlID8gMFxuICAgICAgICAgICAgICA6IGlzTmFOKGludGVydmFsRGF0YSkgPyA1MDAwXG4gICAgICAgICAgICAgIDogaW50ZXJ2YWxEYXRhO1xuICBpZiAoc2VsZi5nZXRBY3RpdmVJbmRleCgpPDApIHtcbiAgICBzbGlkZXMubGVuZ3RoICYmIHNsaWRlc1swXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBpbmRpY2F0b3JzLmxlbmd0aCAmJiBzZXRBY3RpdmVQYWdlKDApO1xuICB9XG4gIHZhcnMgPSB7fTtcbiAgdmFycy5kaXJlY3Rpb24gPSAnbGVmdCc7XG4gIHZhcnMuaW5kZXggPSAwO1xuICB2YXJzLnRpbWVyID0gbnVsbDtcbiAgdmFycy5pc1NsaWRpbmcgPSBmYWxzZTtcbiAgdmFycy5pc1RvdWNoID0gZmFsc2U7XG4gIHZhcnMudG91Y2hQb3NpdGlvbiA9IHtcbiAgICBzdGFydFggOiAwLFxuICAgIGN1cnJlbnRYIDogMCxcbiAgICBlbmRYIDogMFxuICB9O1xuICB0b2dnbGVFdmVudHMoMSk7XG4gIGlmICggb3BzLmludGVydmFsICl7IHNlbGYuY3ljbGUoKTsgfVxuICBlbGVtZW50LkNhcm91c2VsID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gQ29sbGFwc2UoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBhY2NvcmRpb24gPSBudWxsLFxuICAgICAgY29sbGFwc2UgPSBudWxsLFxuICAgICAgYWN0aXZlQ29sbGFwc2UsXG4gICAgICBhY3RpdmVFbGVtZW50LFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50O1xuICBmdW5jdGlvbiBvcGVuQWN0aW9uKGNvbGxhcHNlRWxlbWVudCwgdG9nZ2xlKSB7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBjb2xsYXBzZUVsZW1lbnQuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzaW5nJyk7XG4gICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlJyk7XG4gICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9IChjb2xsYXBzZUVsZW1lbnQuc2Nyb2xsSGVpZ2h0KSArIFwicHhcIjtcbiAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChjb2xsYXBzZUVsZW1lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgY29sbGFwc2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ3RydWUnKTtcbiAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCd0cnVlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2luZycpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgc2hvd25DdXN0b21FdmVudCk7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VBY3Rpb24oY29sbGFwc2VFbGVtZW50LCB0b2dnbGUpIHtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBoaWRlQ3VzdG9tRXZlbnQpO1xuICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIGNvbGxhcHNlRWxlbWVudC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgY29sbGFwc2VFbGVtZW50LnN0eWxlLmhlaWdodCA9IChjb2xsYXBzZUVsZW1lbnQuc2Nyb2xsSGVpZ2h0KSArIFwicHhcIjtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2UnKTtcbiAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzaW5nJyk7XG4gICAgY29sbGFwc2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMHB4JztcbiAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChjb2xsYXBzZUVsZW1lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgY29sbGFwc2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsJ2ZhbHNlJyk7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywnZmFsc2UnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzaW5nJyk7XG4gICAgICBjb2xsYXBzZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2UnKTtcbiAgICAgIGNvbGxhcHNlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgICB9KTtcbiAgfVxuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUgJiYgZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gJ0EnKSB7ZS5wcmV2ZW50RGVmYXVsdCgpO31cbiAgICBpZiAoZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkgfHwgZS50YXJnZXQgPT09IGVsZW1lbnQpIHtcbiAgICAgIGlmICghY29sbGFwc2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHsgc2VsZi5zaG93KCk7IH1cbiAgICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICAgIH1cbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggY29sbGFwc2UuaXNBbmltYXRpbmcgKSB7IHJldHVybjsgfVxuICAgIGNsb3NlQWN0aW9uKGNvbGxhcHNlLGVsZW1lbnQpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2VkJyk7XG4gIH07XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIGFjY29yZGlvbiApIHtcbiAgICAgIGFjdGl2ZUNvbGxhcHNlID0gYWNjb3JkaW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjb2xsYXBzZSBzaG93XCIpWzBdO1xuICAgICAgYWN0aXZlRWxlbWVudCA9IGFjdGl2ZUNvbGxhcHNlICYmIChxdWVyeUVsZW1lbnQoKFwiW2RhdGEtdGFyZ2V0PVxcXCIjXCIgKyAoYWN0aXZlQ29sbGFwc2UuaWQpICsgXCJcXFwiXVwiKSxhY2NvcmRpb24pXG4gICAgICAgICAgICAgICAgICAgIHx8IHF1ZXJ5RWxlbWVudCgoXCJbaHJlZj1cXFwiI1wiICsgKGFjdGl2ZUNvbGxhcHNlLmlkKSArIFwiXFxcIl1cIiksYWNjb3JkaW9uKSApO1xuICAgIH1cbiAgICBpZiAoICFjb2xsYXBzZS5pc0FuaW1hdGluZyApIHtcbiAgICAgIGlmICggYWN0aXZlRWxlbWVudCAmJiBhY3RpdmVDb2xsYXBzZSAhPT0gY29sbGFwc2UgKSB7XG4gICAgICAgIGNsb3NlQWN0aW9uKGFjdGl2ZUNvbGxhcHNlLGFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICBhY3RpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICAgICAgfVxuICAgICAgb3BlbkFjdGlvbihjb2xsYXBzZSxlbGVtZW50KTtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29sbGFwc2VkJyk7XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsc2VsZi50b2dnbGUsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LkNvbGxhcHNlO1xuICB9O1xuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gICAgZWxlbWVudC5Db2xsYXBzZSAmJiBlbGVtZW50LkNvbGxhcHNlLmRpc3Bvc2UoKTtcbiAgICB2YXIgYWNjb3JkaW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXBhcmVudCcpO1xuICAgIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ2NvbGxhcHNlJyk7XG4gICAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICdjb2xsYXBzZScpO1xuICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRlJywgJ2NvbGxhcHNlJyk7XG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZGVuJywgJ2NvbGxhcHNlJyk7XG4gICAgY29sbGFwc2UgPSBxdWVyeUVsZW1lbnQob3B0aW9ucy50YXJnZXQgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgY29sbGFwc2UuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICBhY2NvcmRpb24gPSBlbGVtZW50LmNsb3Nlc3Qob3B0aW9ucy5wYXJlbnQgfHwgYWNjb3JkaW9uRGF0YSk7XG4gICAgaWYgKCAhZWxlbWVudC5Db2xsYXBzZSApIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYudG9nZ2xlLGZhbHNlKTtcbiAgICB9XG4gICAgZWxlbWVudC5Db2xsYXBzZSA9IHNlbGY7XG59XG5cbmZ1bmN0aW9uIHNldEZvY3VzIChlbGVtZW50KXtcbiAgZWxlbWVudC5mb2N1cyA/IGVsZW1lbnQuZm9jdXMoKSA6IGVsZW1lbnQuc2V0QWN0aXZlKCk7XG59XG5cbmZ1bmN0aW9uIERyb3Bkb3duKGVsZW1lbnQsb3B0aW9uKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBudWxsLFxuICAgICAgcGFyZW50LCBtZW51LCBtZW51SXRlbXMgPSBbXSxcbiAgICAgIHBlcnNpc3Q7XG4gIGZ1bmN0aW9uIHByZXZlbnRFbXB0eUFuY2hvcihhbmNob3IpIHtcbiAgICAoYW5jaG9yLmhyZWYgJiYgYW5jaG9yLmhyZWYuc2xpY2UoLTEpID09PSAnIycgfHwgYW5jaG9yLnBhcmVudE5vZGUgJiYgYW5jaG9yLnBhcmVudE5vZGUuaHJlZlxuICAgICAgJiYgYW5jaG9yLnBhcmVudE5vZGUuaHJlZi5zbGljZSgtMSkgPT09ICcjJykgJiYgdGhpcy5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZURpc21pc3MoKSB7XG4gICAgdmFyIGFjdGlvbiA9IGVsZW1lbnQub3BlbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBkb2N1bWVudFthY3Rpb25dKCdjbGljaycsZGlzbWlzc0hhbmRsZXIsZmFsc2UpO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oJ2tleWRvd24nLHByZXZlbnRTY3JvbGwsZmFsc2UpO1xuICAgIGRvY3VtZW50W2FjdGlvbl0oJ2tleXVwJyxrZXlIYW5kbGVyLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCdmb2N1cycsZGlzbWlzc0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGRpc21pc3NIYW5kbGVyKGUpIHtcbiAgICB2YXIgZXZlbnRUYXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgICBoYXNEYXRhID0gZXZlbnRUYXJnZXQgJiYgKGV2ZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBldmVudFRhcmdldC5wYXJlbnROb2RlICYmIGV2ZW50VGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGV2ZW50VGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRvZ2dsZScpKTtcbiAgICBpZiAoIGUudHlwZSA9PT0gJ2ZvY3VzJyAmJiAoZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQgfHwgZXZlbnRUYXJnZXQgPT09IG1lbnUgfHwgbWVudS5jb250YWlucyhldmVudFRhcmdldCkgKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCAoZXZlbnRUYXJnZXQgPT09IG1lbnUgfHwgbWVudS5jb250YWlucyhldmVudFRhcmdldCkpICYmIChwZXJzaXN0IHx8IGhhc0RhdGEpICkgeyByZXR1cm47IH1cbiAgICBlbHNlIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBldmVudFRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50LmNvbnRhaW5zKGV2ZW50VGFyZ2V0KSA/IGVsZW1lbnQgOiBudWxsO1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICAgIHByZXZlbnRFbXB0eUFuY2hvci5jYWxsKGUsZXZlbnRUYXJnZXQpO1xuICB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgcmVsYXRlZFRhcmdldCA9IGVsZW1lbnQ7XG4gICAgc2VsZi5zaG93KCk7XG4gICAgcHJldmVudEVtcHR5QW5jaG9yLmNhbGwoZSxlLnRhcmdldCk7XG4gIH1cbiAgZnVuY3Rpb24gcHJldmVudFNjcm9sbChlKSB7XG4gICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGlmKCBrZXkgPT09IDM4IHx8IGtleSA9PT0gNDAgKSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICB9XG4gIGZ1bmN0aW9uIGtleUhhbmRsZXIoZSkge1xuICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZSxcbiAgICAgICAgYWN0aXZlSXRlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsXG4gICAgICAgIGlzU2FtZUVsZW1lbnQgPSBhY3RpdmVJdGVtID09PSBlbGVtZW50LFxuICAgICAgICBpc0luc2lkZU1lbnUgPSBtZW51LmNvbnRhaW5zKGFjdGl2ZUl0ZW0pLFxuICAgICAgICBpc01lbnVJdGVtID0gYWN0aXZlSXRlbS5wYXJlbnROb2RlID09PSBtZW51IHx8IGFjdGl2ZUl0ZW0ucGFyZW50Tm9kZS5wYXJlbnROb2RlID09PSBtZW51LFxuICAgICAgICBpZHggPSBtZW51SXRlbXMuaW5kZXhPZihhY3RpdmVJdGVtKTtcbiAgICBpZiAoIGlzTWVudUl0ZW0gKSB7XG4gICAgICBpZHggPSBpc1NhbWVFbGVtZW50ID8gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtleSA9PT0gMzggPyAoaWR4PjE/aWR4LTE6MClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBrZXkgPT09IDQwID8gKGlkeDxtZW51SXRlbXMubGVuZ3RoLTE/aWR4KzE6aWR4KSA6IGlkeDtcbiAgICAgIG1lbnVJdGVtc1tpZHhdICYmIHNldEZvY3VzKG1lbnVJdGVtc1tpZHhdKTtcbiAgICB9XG4gICAgaWYgKCAobWVudUl0ZW1zLmxlbmd0aCAmJiBpc01lbnVJdGVtXG4gICAgICAgICAgfHwgIW1lbnVJdGVtcy5sZW5ndGggJiYgKGlzSW5zaWRlTWVudSB8fCBpc1NhbWVFbGVtZW50KVxuICAgICAgICAgIHx8ICFpc0luc2lkZU1lbnUgKVxuICAgICAgICAgICYmIGVsZW1lbnQub3BlbiAmJiBrZXkgPT09IDI3XG4gICAgKSB7XG4gICAgICBzZWxmLnRvZ2dsZSgpO1xuICAgICAgcmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgfVxuICB9XG4gIHNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICdkcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIHNob3dDdXN0b21FdmVudCk7XG4gICAgaWYgKCBzaG93Q3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbWVudS5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgcGFyZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsdHJ1ZSk7XG4gICAgZWxlbWVudC5vcGVuID0gdHJ1ZTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc2V0Rm9jdXMoIG1lbnUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0lOUFVUJylbMF0gfHwgZWxlbWVudCApO1xuICAgICAgdG9nZ2xlRGlzbWlzcygpO1xuICAgICAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnc2hvd24nLCAnZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIHNob3duQ3VzdG9tRXZlbnQpO1xuICAgIH0sMSk7XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICdkcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgaWYgKCBoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCApIHsgcmV0dXJuOyB9XG4gICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgcGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsZmFsc2UpO1xuICAgIGVsZW1lbnQub3BlbiA9IGZhbHNlO1xuICAgIHRvZ2dsZURpc21pc3MoKTtcbiAgICBzZXRGb2N1cyhlbGVtZW50KTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsZW1lbnQuRHJvcGRvd24gJiYgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICB9LDEpO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdkcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfTtcbiAgc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSAmJiBlbGVtZW50Lm9wZW4pIHsgc2VsZi5oaWRlKCk7IH1cbiAgICBlbHNlIHsgc2VsZi5zaG93KCk7IH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgZWxlbWVudC5vcGVuKSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgICBkZWxldGUgZWxlbWVudC5Ecm9wZG93bjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5Ecm9wZG93biAmJiBlbGVtZW50LkRyb3Bkb3duLmRpc3Bvc2UoKTtcbiAgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICBtZW51ID0gcXVlcnlFbGVtZW50KCcuZHJvcGRvd24tbWVudScsIHBhcmVudCk7XG4gIEFycmF5LmZyb20obWVudS5jaGlsZHJlbikubWFwKGZ1bmN0aW9uIChjaGlsZCl7XG4gICAgY2hpbGQuY2hpbGRyZW4ubGVuZ3RoICYmIChjaGlsZC5jaGlsZHJlblswXS50YWdOYW1lID09PSAnQScgJiYgbWVudUl0ZW1zLnB1c2goY2hpbGQuY2hpbGRyZW5bMF0pKTtcbiAgICBjaGlsZC50YWdOYW1lID09PSAnQScgJiYgbWVudUl0ZW1zLnB1c2goY2hpbGQpO1xuICB9KTtcbiAgaWYgKCAhZWxlbWVudC5Ecm9wZG93biApIHtcbiAgICAhKCd0YWJpbmRleCcgaW4gbWVudSkgJiYgbWVudS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIHBlcnNpc3QgPSBvcHRpb24gPT09IHRydWUgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGVyc2lzdCcpID09PSAndHJ1ZScgfHwgZmFsc2U7XG4gIGVsZW1lbnQub3BlbiA9IGZhbHNlO1xuICBlbGVtZW50LkRyb3Bkb3duID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gTW9kYWwoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsIG1vZGFsLFxuICAgIHNob3dDdXN0b21FdmVudCxcbiAgICBzaG93bkN1c3RvbUV2ZW50LFxuICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbCxcbiAgICBzY3JvbGxCYXJXaWR0aCxcbiAgICBvdmVybGF5LFxuICAgIG92ZXJsYXlEZWxheSxcbiAgICBmaXhlZEl0ZW1zLFxuICAgIG9wcyA9IHt9O1xuICBmdW5jdGlvbiBzZXRTY3JvbGxiYXIoKSB7XG4gICAgdmFyIG9wZW5Nb2RhbCA9IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2RhbC1vcGVuJyksXG4gICAgICAgIGJvZHlQYWQgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLnBhZGRpbmdSaWdodCksXG4gICAgICAgIGJvZHlPdmVyZmxvdyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgIT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgIT09IGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0LFxuICAgICAgICBtb2RhbE92ZXJmbG93ID0gbW9kYWwuY2xpZW50SGVpZ2h0ICE9PSBtb2RhbC5zY3JvbGxIZWlnaHQ7XG4gICAgc2Nyb2xsQmFyV2lkdGggPSBtZWFzdXJlU2Nyb2xsYmFyKCk7XG4gICAgbW9kYWwuc3R5bGUucGFkZGluZ1JpZ2h0ID0gIW1vZGFsT3ZlcmZsb3cgJiYgc2Nyb2xsQmFyV2lkdGggPyAoc2Nyb2xsQmFyV2lkdGggKyBcInB4XCIpIDogJyc7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBtb2RhbE92ZXJmbG93IHx8IGJvZHlPdmVyZmxvdyA/ICgoYm9keVBhZCArIChvcGVuTW9kYWwgPyAwOnNjcm9sbEJhcldpZHRoKSkgKyBcInB4XCIpIDogJyc7XG4gICAgZml4ZWRJdGVtcy5sZW5ndGggJiYgZml4ZWRJdGVtcy5tYXAoZnVuY3Rpb24gKGZpeGVkKXtcbiAgICAgIHZhciBpdGVtUGFkID0gZ2V0Q29tcHV0ZWRTdHlsZShmaXhlZCkucGFkZGluZ1JpZ2h0O1xuICAgICAgZml4ZWQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gbW9kYWxPdmVyZmxvdyB8fCBib2R5T3ZlcmZsb3cgPyAoKHBhcnNlSW50KGl0ZW1QYWQpICsgKG9wZW5Nb2RhbD8wOnNjcm9sbEJhcldpZHRoKSkgKyBcInB4XCIpIDogKChwYXJzZUludChpdGVtUGFkKSkgKyBcInB4XCIpO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIHJlc2V0U2Nyb2xsYmFyKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJyc7XG4gICAgbW9kYWwuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJyc7XG4gICAgZml4ZWRJdGVtcy5sZW5ndGggJiYgZml4ZWRJdGVtcy5tYXAoZnVuY3Rpb24gKGZpeGVkKXtcbiAgICAgIGZpeGVkLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIG1lYXN1cmVTY3JvbGxiYXIoKSB7XG4gICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLCB3aWR0aFZhbHVlO1xuICAgIHNjcm9sbERpdi5jbGFzc05hbWUgPSAnbW9kYWwtc2Nyb2xsYmFyLW1lYXN1cmUnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgICB3aWR0aFZhbHVlID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoO1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgICByZXR1cm4gd2lkdGhWYWx1ZTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVPdmVybGF5KCkge1xuICAgIHZhciBuZXdPdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3ZlcmxheSA9IHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWJhY2tkcm9wJyk7XG4gICAgaWYgKCBvdmVybGF5ID09PSBudWxsICkge1xuICAgICAgbmV3T3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ21vZGFsLWJhY2tkcm9wJyArIChvcHMuYW5pbWF0aW9uID8gJyBmYWRlJyA6ICcnKSk7XG4gICAgICBvdmVybGF5ID0gbmV3T3ZlcmxheTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG4gICAgfVxuICAgIHJldHVybiBvdmVybGF5O1xuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZU92ZXJsYXkgKCkge1xuICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy5tb2RhbC1iYWNrZHJvcCcpO1xuICAgIGlmICggb3ZlcmxheSAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdICkge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChvdmVybGF5KTsgb3ZlcmxheSA9IG51bGw7XG4gICAgfVxuICAgIG92ZXJsYXkgPT09IG51bGwgJiYgKGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtb3BlbicpLCByZXNldFNjcm9sbGJhcigpKTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIHdpbmRvd1thY3Rpb25dKCAncmVzaXplJywgc2VsZi51cGRhdGUsIHBhc3NpdmVIYW5kbGVyKTtcbiAgICBtb2RhbFthY3Rpb25dKCAnY2xpY2snLGRpc21pc3NIYW5kbGVyLGZhbHNlKTtcbiAgICBkb2N1bWVudFthY3Rpb25dKCAna2V5ZG93bicsa2V5SGFuZGxlcixmYWxzZSk7XG4gIH1cbiAgZnVuY3Rpb24gYmVmb3JlU2hvdygpIHtcbiAgICBtb2RhbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBzZXRTY3JvbGxiYXIoKTtcbiAgICAhZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwgc2hvdycpWzBdICYmIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtb3BlbicpO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuICAgIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpID8gZW11bGF0ZVRyYW5zaXRpb25FbmQobW9kYWwsIHRyaWdnZXJTaG93KSA6IHRyaWdnZXJTaG93KCk7XG4gIH1cbiAgZnVuY3Rpb24gdHJpZ2dlclNob3coKSB7XG4gICAgc2V0Rm9jdXMobW9kYWwpO1xuICAgIG1vZGFsLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgdG9nZ2xlRXZlbnRzKDEpO1xuICAgIHNob3duQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvd24nLCAnbW9kYWwnLCByZWxhdGVkVGFyZ2V0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIHNob3duQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJIaWRlKGZvcmNlKSB7XG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIGVsZW1lbnQgJiYgKHNldEZvY3VzKGVsZW1lbnQpKTtcbiAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcubW9kYWwtYmFja2Ryb3AnKTtcbiAgICBpZiAoZm9yY2UgIT09IDEgJiYgb3ZlcmxheSAmJiBvdmVybGF5LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICFkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbCBzaG93JylbMF0pIHtcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQob3ZlcmxheSxyZW1vdmVPdmVybGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlT3ZlcmxheSgpO1xuICAgIH1cbiAgICB0b2dnbGVFdmVudHMoKTtcbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICdtb2RhbCcpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgaWYgKCBtb2RhbC5pc0FuaW1hdGluZyApIHsgcmV0dXJuOyB9XG4gICAgdmFyIGNsaWNrVGFyZ2V0ID0gZS50YXJnZXQsXG4gICAgICAgIG1vZGFsSUQgPSBcIiNcIiArIChtb2RhbC5nZXRBdHRyaWJ1dGUoJ2lkJykpLFxuICAgICAgICB0YXJnZXRBdHRyVmFsdWUgPSBjbGlja1RhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JykgfHwgY2xpY2tUYXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJyksXG4gICAgICAgIGVsZW1BdHRyVmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgIGlmICggIW1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpXG4gICAgICAgICYmIChjbGlja1RhcmdldCA9PT0gZWxlbWVudCAmJiB0YXJnZXRBdHRyVmFsdWUgPT09IG1vZGFsSURcbiAgICAgICAgfHwgZWxlbWVudC5jb250YWlucyhjbGlja1RhcmdldCkgJiYgZWxlbUF0dHJWYWx1ZSA9PT0gbW9kYWxJRCkgKSB7XG4gICAgICBtb2RhbC5tb2RhbFRyaWdnZXIgPSBlbGVtZW50O1xuICAgICAgcmVsYXRlZFRhcmdldCA9IGVsZW1lbnQ7XG4gICAgICBzZWxmLnNob3coKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24ga2V5SGFuZGxlcihyZWYpIHtcbiAgICB2YXIgd2hpY2ggPSByZWYud2hpY2g7XG4gICAgaWYgKCFtb2RhbC5pc0FuaW1hdGluZyAmJiBvcHMua2V5Ym9hcmQgJiYgd2hpY2ggPT0gMjcgJiYgbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7XG4gICAgICBzZWxmLmhpZGUoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZGlzbWlzc0hhbmRsZXIoZSkge1xuICAgIGlmICggbW9kYWwuaXNBbmltYXRpbmcgKSB7IHJldHVybjsgfVxuICAgIHZhciBjbGlja1RhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICBoYXNEYXRhID0gY2xpY2tUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRpc21pc3MnKSA9PT0gJ21vZGFsJyxcbiAgICAgICAgcGFyZW50V2l0aERhdGEgPSBjbGlja1RhcmdldC5jbG9zZXN0KCdbZGF0YS1kaXNtaXNzPVwibW9kYWxcIl0nKTtcbiAgICBpZiAoIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICggcGFyZW50V2l0aERhdGEgfHwgaGFzRGF0YVxuICAgICAgICB8fCBjbGlja1RhcmdldCA9PT0gbW9kYWwgJiYgb3BzLmJhY2tkcm9wICE9PSAnc3RhdGljJyApICkge1xuICAgICAgc2VsZi5oaWRlKCk7IHJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICkge3NlbGYuaGlkZSgpO30gZWxzZSB7c2VsZi5zaG93KCk7fVxuICB9O1xuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG1vZGFsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICEhbW9kYWwuaXNBbmltYXRpbmcgKSB7cmV0dXJufVxuICAgIHNob3dDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93JywgJ21vZGFsJywgcmVsYXRlZFRhcmdldCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgIGlmICggc2hvd0N1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgIG1vZGFsLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudE9wZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbCBzaG93JylbMF07XG4gICAgaWYgKGN1cnJlbnRPcGVuICYmIGN1cnJlbnRPcGVuICE9PSBtb2RhbCkge1xuICAgICAgY3VycmVudE9wZW4ubW9kYWxUcmlnZ2VyICYmIGN1cnJlbnRPcGVuLm1vZGFsVHJpZ2dlci5Nb2RhbC5oaWRlKCk7XG4gICAgICBjdXJyZW50T3Blbi5Nb2RhbCAmJiBjdXJyZW50T3Blbi5Nb2RhbC5oaWRlKCk7XG4gICAgfVxuICAgIGlmICggb3BzLmJhY2tkcm9wICkge1xuICAgICAgb3ZlcmxheSA9IGNyZWF0ZU92ZXJsYXkoKTtcbiAgICB9XG4gICAgaWYgKCBvdmVybGF5ICYmICFjdXJyZW50T3BlbiAmJiAhb3ZlcmxheS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSApIHtcbiAgICAgIG92ZXJsYXkub2Zmc2V0V2lkdGg7XG4gICAgICBvdmVybGF5RGVsYXkgPSBnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uKG92ZXJsYXkpO1xuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgfVxuICAgICFjdXJyZW50T3BlbiA/IHNldFRpbWVvdXQoIGJlZm9yZVNob3csIG92ZXJsYXkgJiYgb3ZlcmxheURlbGF5ID8gb3ZlcmxheURlbGF5OjAgKSA6IGJlZm9yZVNob3coKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKGZvcmNlKSB7XG4gICAgaWYgKCAhbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgKSB7cmV0dXJufVxuICAgIGhpZGVDdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnaGlkZScsICdtb2RhbCcpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICBpZiAoIGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBtb2RhbC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIG1vZGFsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICBtb2RhbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZhZGUnKSAmJiBmb3JjZSAhPT0gMSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKG1vZGFsLCB0cmlnZ2VySGlkZSkgOiB0cmlnZ2VySGlkZSgpO1xuICB9O1xuICBzZWxmLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoY29udGVudCkge1xuICAgIHF1ZXJ5RWxlbWVudCgnLm1vZGFsLWNvbnRlbnQnLG1vZGFsKS5pbm5lckhUTUwgPSBjb250ZW50O1xuICB9O1xuICBzZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAobW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgIHNldFNjcm9sbGJhcigpO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuaGlkZSgxKTtcbiAgICBpZiAoZWxlbWVudCkge2VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsaWNrSGFuZGxlcixmYWxzZSk7IGRlbGV0ZSBlbGVtZW50Lk1vZGFsOyB9XG4gICAgZWxzZSB7ZGVsZXRlIG1vZGFsLk1vZGFsO31cbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgdmFyIGNoZWNrTW9kYWwgPSBxdWVyeUVsZW1lbnQoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykgKTtcbiAgbW9kYWwgPSBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbW9kYWwnKSA/IGVsZW1lbnQgOiBjaGVja01vZGFsO1xuICBmaXhlZEl0ZW1zID0gQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaXhlZC10b3AnKSlcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChBcnJheS5mcm9tKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ZpeGVkLWJvdHRvbScpKSk7XG4gIGlmICggZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGFsJykgKSB7IGVsZW1lbnQgPSBudWxsOyB9XG4gIGVsZW1lbnQgJiYgZWxlbWVudC5Nb2RhbCAmJiBlbGVtZW50Lk1vZGFsLmRpc3Bvc2UoKTtcbiAgbW9kYWwgJiYgbW9kYWwuTW9kYWwgJiYgbW9kYWwuTW9kYWwuZGlzcG9zZSgpO1xuICBvcHMua2V5Ym9hcmQgPSBvcHRpb25zLmtleWJvYXJkID09PSBmYWxzZSB8fCBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEta2V5Ym9hcmQnKSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZTtcbiAgb3BzLmJhY2tkcm9wID0gb3B0aW9ucy5iYWNrZHJvcCA9PT0gJ3N0YXRpYycgfHwgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJhY2tkcm9wJykgPT09ICdzdGF0aWMnID8gJ3N0YXRpYycgOiB0cnVlO1xuICBvcHMuYmFja2Ryb3AgPSBvcHRpb25zLmJhY2tkcm9wID09PSBmYWxzZSB8fCBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmFja2Ryb3AnKSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogb3BzLmJhY2tkcm9wO1xuICBvcHMuYW5pbWF0aW9uID0gbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykgPyB0cnVlIDogZmFsc2U7XG4gIG9wcy5jb250ZW50ID0gb3B0aW9ucy5jb250ZW50O1xuICBtb2RhbC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICBpZiAoIGVsZW1lbnQgJiYgIWVsZW1lbnQuTW9kYWwgKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2xpY2tIYW5kbGVyLGZhbHNlKTtcbiAgfVxuICBpZiAoIG9wcy5jb250ZW50ICkge1xuICAgIHNlbGYuc2V0Q29udGVudCggb3BzLmNvbnRlbnQudHJpbSgpICk7XG4gIH1cbiAgaWYgKGVsZW1lbnQpIHtcbiAgICBtb2RhbC5tb2RhbFRyaWdnZXIgPSBlbGVtZW50O1xuICAgIGVsZW1lbnQuTW9kYWwgPSBzZWxmO1xuICB9IGVsc2Uge1xuICAgIG1vZGFsLk1vZGFsID0gc2VsZjtcbiAgfVxufVxuXG52YXIgbW91c2VDbGlja0V2ZW50cyA9IHsgZG93bjogJ21vdXNlZG93bicsIHVwOiAnbW91c2V1cCcgfTtcblxuZnVuY3Rpb24gZ2V0U2Nyb2xsKCkge1xuICByZXR1cm4ge1xuICAgIHkgOiB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCxcbiAgICB4IDogd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0XG4gIH1cbn1cblxuZnVuY3Rpb24gc3R5bGVUaXAobGluayxlbGVtZW50LHBvc2l0aW9uLHBhcmVudCkge1xuICB2YXIgdGlwUG9zaXRpb25zID0gL1xcYih0b3B8Ym90dG9tfGxlZnR8cmlnaHQpKy8sXG4gICAgICBlbGVtZW50RGltZW5zaW9ucyA9IHsgdyA6IGVsZW1lbnQub2Zmc2V0V2lkdGgsIGg6IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IH0sXG4gICAgICB3aW5kb3dXaWR0aCA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCksXG4gICAgICB3aW5kb3dIZWlnaHQgPSAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCksXG4gICAgICByZWN0ID0gbGluay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHNjcm9sbCA9IHBhcmVudCA9PT0gZG9jdW1lbnQuYm9keSA/IGdldFNjcm9sbCgpIDogeyB4OiBwYXJlbnQub2Zmc2V0TGVmdCArIHBhcmVudC5zY3JvbGxMZWZ0LCB5OiBwYXJlbnQub2Zmc2V0VG9wICsgcGFyZW50LnNjcm9sbFRvcCB9LFxuICAgICAgbGlua0RpbWVuc2lvbnMgPSB7IHc6IHJlY3QucmlnaHQgLSByZWN0LmxlZnQsIGg6IHJlY3QuYm90dG9tIC0gcmVjdC50b3AgfSxcbiAgICAgIGlzUG9wb3ZlciA9IGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwb3BvdmVyJyksXG4gICAgICBhcnJvdyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYXJyb3cnKVswXSxcbiAgICAgIGhhbGZUb3BFeGNlZWQgPSByZWN0LnRvcCArIGxpbmtEaW1lbnNpb25zLmgvMiAtIGVsZW1lbnREaW1lbnNpb25zLmgvMiA8IDAsXG4gICAgICBoYWxmTGVmdEV4Y2VlZCA9IHJlY3QubGVmdCArIGxpbmtEaW1lbnNpb25zLncvMiAtIGVsZW1lbnREaW1lbnNpb25zLncvMiA8IDAsXG4gICAgICBoYWxmUmlnaHRFeGNlZWQgPSByZWN0LmxlZnQgKyBlbGVtZW50RGltZW5zaW9ucy53LzIgKyBsaW5rRGltZW5zaW9ucy53LzIgPj0gd2luZG93V2lkdGgsXG4gICAgICBoYWxmQm90dG9tRXhjZWVkID0gcmVjdC50b3AgKyBlbGVtZW50RGltZW5zaW9ucy5oLzIgKyBsaW5rRGltZW5zaW9ucy5oLzIgPj0gd2luZG93SGVpZ2h0LFxuICAgICAgdG9wRXhjZWVkID0gcmVjdC50b3AgLSBlbGVtZW50RGltZW5zaW9ucy5oIDwgMCxcbiAgICAgIGxlZnRFeGNlZWQgPSByZWN0LmxlZnQgLSBlbGVtZW50RGltZW5zaW9ucy53IDwgMCxcbiAgICAgIGJvdHRvbUV4Y2VlZCA9IHJlY3QudG9wICsgZWxlbWVudERpbWVuc2lvbnMuaCArIGxpbmtEaW1lbnNpb25zLmggPj0gd2luZG93SGVpZ2h0LFxuICAgICAgcmlnaHRFeGNlZWQgPSByZWN0LmxlZnQgKyBlbGVtZW50RGltZW5zaW9ucy53ICsgbGlua0RpbWVuc2lvbnMudyA+PSB3aW5kb3dXaWR0aDtcbiAgcG9zaXRpb24gPSAocG9zaXRpb24gPT09ICdsZWZ0JyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JykgJiYgbGVmdEV4Y2VlZCAmJiByaWdodEV4Y2VlZCA/ICd0b3AnIDogcG9zaXRpb247XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gPT09ICd0b3AnICYmIHRvcEV4Y2VlZCA/ICdib3R0b20nIDogcG9zaXRpb247XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gPT09ICdib3R0b20nICYmIGJvdHRvbUV4Y2VlZCA/ICd0b3AnIDogcG9zaXRpb247XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gPT09ICdsZWZ0JyAmJiBsZWZ0RXhjZWVkID8gJ3JpZ2h0JyA6IHBvc2l0aW9uO1xuICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSAncmlnaHQnICYmIHJpZ2h0RXhjZWVkID8gJ2xlZnQnIDogcG9zaXRpb247XG4gIHZhciB0b3BQb3NpdGlvbixcbiAgICBsZWZ0UG9zaXRpb24sXG4gICAgYXJyb3dUb3AsXG4gICAgYXJyb3dMZWZ0LFxuICAgIGFycm93V2lkdGgsXG4gICAgYXJyb3dIZWlnaHQ7XG4gIGVsZW1lbnQuY2xhc3NOYW1lLmluZGV4T2YocG9zaXRpb24pID09PSAtMSAmJiAoZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKHRpcFBvc2l0aW9ucyxwb3NpdGlvbikpO1xuICBhcnJvd1dpZHRoID0gYXJyb3cub2Zmc2V0V2lkdGg7IGFycm93SGVpZ2h0ID0gYXJyb3cub2Zmc2V0SGVpZ2h0O1xuICBpZiAoIHBvc2l0aW9uID09PSAnbGVmdCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcgKSB7XG4gICAgaWYgKCBwb3NpdGlvbiA9PT0gJ2xlZnQnICkge1xuICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdC5sZWZ0ICsgc2Nyb2xsLnggLSBlbGVtZW50RGltZW5zaW9ucy53IC0gKCBpc1BvcG92ZXIgPyBhcnJvd1dpZHRoIDogMCApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSByZWN0LmxlZnQgKyBzY3JvbGwueCArIGxpbmtEaW1lbnNpb25zLnc7XG4gICAgfVxuICAgIGlmIChoYWxmVG9wRXhjZWVkKSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnk7XG4gICAgICBhcnJvd1RvcCA9IGxpbmtEaW1lbnNpb25zLmgvMiAtIGFycm93V2lkdGg7XG4gICAgfSBlbHNlIGlmIChoYWxmQm90dG9tRXhjZWVkKSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oICsgbGlua0RpbWVuc2lvbnMuaDtcbiAgICAgIGFycm93VG9wID0gZWxlbWVudERpbWVuc2lvbnMuaCAtIGxpbmtEaW1lbnNpb25zLmgvMiAtIGFycm93V2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gcmVjdC50b3AgKyBzY3JvbGwueSAtIGVsZW1lbnREaW1lbnNpb25zLmgvMiArIGxpbmtEaW1lbnNpb25zLmgvMjtcbiAgICAgIGFycm93VG9wID0gZWxlbWVudERpbWVuc2lvbnMuaC8yIC0gKGlzUG9wb3ZlciA/IGFycm93SGVpZ2h0KjAuOSA6IGFycm93SGVpZ2h0LzIpO1xuICAgIH1cbiAgfSBlbHNlIGlmICggcG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJyApIHtcbiAgICBpZiAoIHBvc2l0aW9uID09PSAndG9wJykge1xuICAgICAgdG9wUG9zaXRpb24gPSAgcmVjdC50b3AgKyBzY3JvbGwueSAtIGVsZW1lbnREaW1lbnNpb25zLmggLSAoIGlzUG9wb3ZlciA/IGFycm93SGVpZ2h0IDogMCApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHJlY3QudG9wICsgc2Nyb2xsLnkgKyBsaW5rRGltZW5zaW9ucy5oO1xuICAgIH1cbiAgICBpZiAoaGFsZkxlZnRFeGNlZWQpIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IDA7XG4gICAgICBhcnJvd0xlZnQgPSByZWN0LmxlZnQgKyBsaW5rRGltZW5zaW9ucy53LzIgLSBhcnJvd1dpZHRoO1xuICAgIH0gZWxzZSBpZiAoaGFsZlJpZ2h0RXhjZWVkKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSB3aW5kb3dXaWR0aCAtIGVsZW1lbnREaW1lbnNpb25zLncqMS4wMTtcbiAgICAgIGFycm93TGVmdCA9IGVsZW1lbnREaW1lbnNpb25zLncgLSAoIHdpbmRvd1dpZHRoIC0gcmVjdC5sZWZ0ICkgKyBsaW5rRGltZW5zaW9ucy53LzIgLSBhcnJvd1dpZHRoLzI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3QubGVmdCArIHNjcm9sbC54IC0gZWxlbWVudERpbWVuc2lvbnMudy8yICsgbGlua0RpbWVuc2lvbnMudy8yO1xuICAgICAgYXJyb3dMZWZ0ID0gZWxlbWVudERpbWVuc2lvbnMudy8yIC0gKCBpc1BvcG92ZXIgPyBhcnJvd1dpZHRoIDogYXJyb3dXaWR0aC8yICk7XG4gICAgfVxuICB9XG4gIGVsZW1lbnQuc3R5bGUudG9wID0gdG9wUG9zaXRpb24gKyAncHgnO1xuICBlbGVtZW50LnN0eWxlLmxlZnQgPSBsZWZ0UG9zaXRpb24gKyAncHgnO1xuICBhcnJvd1RvcCAmJiAoYXJyb3cuc3R5bGUudG9wID0gYXJyb3dUb3AgKyAncHgnKTtcbiAgYXJyb3dMZWZ0ICYmIChhcnJvdy5zdHlsZS5sZWZ0ID0gYXJyb3dMZWZ0ICsgJ3B4Jyk7XG59XG5cbmZ1bmN0aW9uIFBvcG92ZXIoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBwb3BvdmVyID0gbnVsbCxcbiAgICAgIHRpbWVyID0gMCxcbiAgICAgIGlzSXBob25lID0gLyhpUGhvbmV8aVBvZHxpUGFkKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSxcbiAgICAgIHRpdGxlU3RyaW5nLFxuICAgICAgY29udGVudFN0cmluZyxcbiAgICAgIG9wcyA9IHt9O1xuICB2YXIgdHJpZ2dlckRhdGEsXG4gICAgICBhbmltYXRpb25EYXRhLFxuICAgICAgcGxhY2VtZW50RGF0YSxcbiAgICAgIGRpc21pc3NpYmxlRGF0YSxcbiAgICAgIGRlbGF5RGF0YSxcbiAgICAgIGNvbnRhaW5lckRhdGEsXG4gICAgICBjbG9zZUJ0bixcbiAgICAgIHNob3dDdXN0b21FdmVudCxcbiAgICAgIHNob3duQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgICBoaWRkZW5DdXN0b21FdmVudCxcbiAgICAgIGNvbnRhaW5lckVsZW1lbnQsXG4gICAgICBjb250YWluZXJEYXRhRWxlbWVudCxcbiAgICAgIG1vZGFsLFxuICAgICAgbmF2YmFyRml4ZWRUb3AsXG4gICAgICBuYXZiYXJGaXhlZEJvdHRvbSxcbiAgICAgIHBsYWNlbWVudENsYXNzO1xuICBmdW5jdGlvbiBkaXNtaXNzaWJsZUhhbmRsZXIoZSkge1xuICAgIGlmIChwb3BvdmVyICE9PSBudWxsICYmIGUudGFyZ2V0ID09PSBxdWVyeUVsZW1lbnQoJy5jbG9zZScscG9wb3ZlcikpIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBnZXRDb250ZW50cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgMCA6IG9wdGlvbnMudGl0bGUgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSB8fCBudWxsLFxuICAgICAgMSA6IG9wdGlvbnMuY29udGVudCB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jb250ZW50JykgfHwgbnVsbFxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiByZW1vdmVQb3BvdmVyKCkge1xuICAgIG9wcy5jb250YWluZXIucmVtb3ZlQ2hpbGQocG9wb3Zlcik7XG4gICAgdGltZXIgPSBudWxsOyBwb3BvdmVyID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVQb3BvdmVyKCkge1xuICAgIHRpdGxlU3RyaW5nID0gZ2V0Q29udGVudHMoKVswXSB8fCBudWxsO1xuICAgIGNvbnRlbnRTdHJpbmcgPSBnZXRDb250ZW50cygpWzFdO1xuICAgIGNvbnRlbnRTdHJpbmcgPSAhIWNvbnRlbnRTdHJpbmcgPyBjb250ZW50U3RyaW5nLnRyaW0oKSA6IG51bGw7XG4gICAgcG9wb3ZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBwb3BvdmVyQXJyb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwb3BvdmVyQXJyb3cuY2xhc3NMaXN0LmFkZCgnYXJyb3cnKTtcbiAgICBwb3BvdmVyLmFwcGVuZENoaWxkKHBvcG92ZXJBcnJvdyk7XG4gICAgaWYgKCBjb250ZW50U3RyaW5nICE9PSBudWxsICYmIG9wcy50ZW1wbGF0ZSA9PT0gbnVsbCApIHtcbiAgICAgIHBvcG92ZXIuc2V0QXR0cmlidXRlKCdyb2xlJywndG9vbHRpcCcpO1xuICAgICAgaWYgKHRpdGxlU3RyaW5nICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBwb3BvdmVyVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICAgICBwb3BvdmVyVGl0bGUuY2xhc3NMaXN0LmFkZCgncG9wb3Zlci1oZWFkZXInKTtcbiAgICAgICAgcG9wb3ZlclRpdGxlLmlubmVySFRNTCA9IG9wcy5kaXNtaXNzaWJsZSA/IHRpdGxlU3RyaW5nICsgY2xvc2VCdG4gOiB0aXRsZVN0cmluZztcbiAgICAgICAgcG9wb3Zlci5hcHBlbmRDaGlsZChwb3BvdmVyVGl0bGUpO1xuICAgICAgfVxuICAgICAgdmFyIHBvcG92ZXJCb2R5TWFya3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBwb3BvdmVyQm9keU1hcmt1cC5jbGFzc0xpc3QuYWRkKCdwb3BvdmVyLWJvZHknKTtcbiAgICAgIHBvcG92ZXJCb2R5TWFya3VwLmlubmVySFRNTCA9IG9wcy5kaXNtaXNzaWJsZSAmJiB0aXRsZVN0cmluZyA9PT0gbnVsbCA/IGNvbnRlbnRTdHJpbmcgKyBjbG9zZUJ0biA6IGNvbnRlbnRTdHJpbmc7XG4gICAgICBwb3BvdmVyLmFwcGVuZENoaWxkKHBvcG92ZXJCb2R5TWFya3VwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHBvcG92ZXJUZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgcG9wb3ZlclRlbXBsYXRlLmlubmVySFRNTCA9IG9wcy50ZW1wbGF0ZS50cmltKCk7XG4gICAgICBwb3BvdmVyLmNsYXNzTmFtZSA9IHBvcG92ZXJUZW1wbGF0ZS5maXJzdENoaWxkLmNsYXNzTmFtZTtcbiAgICAgIHBvcG92ZXIuaW5uZXJIVE1MID0gcG9wb3ZlclRlbXBsYXRlLmZpcnN0Q2hpbGQuaW5uZXJIVE1MO1xuICAgICAgdmFyIHBvcG92ZXJIZWFkZXIgPSBxdWVyeUVsZW1lbnQoJy5wb3BvdmVyLWhlYWRlcicscG9wb3ZlciksXG4gICAgICAgICAgcG9wb3ZlckJvZHkgPSBxdWVyeUVsZW1lbnQoJy5wb3BvdmVyLWJvZHknLHBvcG92ZXIpO1xuICAgICAgdGl0bGVTdHJpbmcgJiYgcG9wb3ZlckhlYWRlciAmJiAocG9wb3ZlckhlYWRlci5pbm5lckhUTUwgPSB0aXRsZVN0cmluZy50cmltKCkpO1xuICAgICAgY29udGVudFN0cmluZyAmJiBwb3BvdmVyQm9keSAmJiAocG9wb3ZlckJvZHkuaW5uZXJIVE1MID0gY29udGVudFN0cmluZy50cmltKCkpO1xuICAgIH1cbiAgICBvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKHBvcG92ZXIpO1xuICAgIHBvcG92ZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgIXBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCAncG9wb3ZlcicpICYmIHBvcG92ZXIuY2xhc3NMaXN0LmFkZCgncG9wb3ZlcicpO1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucyggb3BzLmFuaW1hdGlvbikgJiYgcG9wb3Zlci5jbGFzc0xpc3QuYWRkKG9wcy5hbmltYXRpb24pO1xuICAgICFwb3BvdmVyLmNsYXNzTGlzdC5jb250YWlucyggcGxhY2VtZW50Q2xhc3MpICYmIHBvcG92ZXIuY2xhc3NMaXN0LmFkZChwbGFjZW1lbnRDbGFzcyk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd1BvcG92ZXIoKSB7XG4gICAgIXBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgJiYgKCBwb3BvdmVyLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKSApO1xuICB9XG4gIGZ1bmN0aW9uIHVwZGF0ZVBvcG92ZXIoKSB7XG4gICAgc3R5bGVUaXAoZWxlbWVudCwgcG9wb3Zlciwgb3BzLnBsYWNlbWVudCwgb3BzLmNvbnRhaW5lcik7XG4gIH1cbiAgZnVuY3Rpb24gZm9yY2VGb2N1cyAoKSB7XG4gICAgaWYgKHBvcG92ZXIgPT09IG51bGwpIHsgZWxlbWVudC5mb2N1cygpOyB9XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBpZiAob3BzLnRyaWdnZXIgPT09ICdob3ZlcicpIHtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggbW91c2VDbGlja0V2ZW50cy5kb3duLCBzZWxmLnNob3cgKTtcbiAgICAgIGVsZW1lbnRbYWN0aW9uXSggbW91c2VIb3ZlckV2ZW50c1swXSwgc2VsZi5zaG93ICk7XG4gICAgICBpZiAoIW9wcy5kaXNtaXNzaWJsZSkgeyBlbGVtZW50W2FjdGlvbl0oIG1vdXNlSG92ZXJFdmVudHNbMV0sIHNlbGYuaGlkZSApOyB9XG4gICAgfSBlbHNlIGlmICgnY2xpY2snID09IG9wcy50cmlnZ2VyKSB7XG4gICAgICBlbGVtZW50W2FjdGlvbl0oIG9wcy50cmlnZ2VyLCBzZWxmLnRvZ2dsZSApO1xuICAgIH0gZWxzZSBpZiAoJ2ZvY3VzJyA9PSBvcHMudHJpZ2dlcikge1xuICAgICAgaXNJcGhvbmUgJiYgZWxlbWVudFthY3Rpb25dKCAnY2xpY2snLCBmb3JjZUZvY3VzLCBmYWxzZSApO1xuICAgICAgZWxlbWVudFthY3Rpb25dKCBvcHMudHJpZ2dlciwgc2VsZi50b2dnbGUgKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG91Y2hIYW5kbGVyKGUpe1xuICAgIGlmICggcG9wb3ZlciAmJiBwb3BvdmVyLmNvbnRhaW5zKGUudGFyZ2V0KSB8fCBlLnRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSkgOyBlbHNlIHtcbiAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkaXNtaXNzSGFuZGxlclRvZ2dsZShhY3Rpb24pIHtcbiAgICBhY3Rpb24gPSBhY3Rpb24gPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgaWYgKG9wcy5kaXNtaXNzaWJsZSkge1xuICAgICAgZG9jdW1lbnRbYWN0aW9uXSgnY2xpY2snLCBkaXNtaXNzaWJsZUhhbmRsZXIsIGZhbHNlICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICdmb2N1cycgPT0gb3BzLnRyaWdnZXIgJiYgZWxlbWVudFthY3Rpb25dKCAnYmx1cicsIHNlbGYuaGlkZSApO1xuICAgICAgJ2hvdmVyJyA9PSBvcHMudHJpZ2dlciAmJiBkb2N1bWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHRvdWNoSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB9XG4gICAgd2luZG93W2FjdGlvbl0oJ3Jlc2l6ZScsIHNlbGYuaGlkZSwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93VHJpZ2dlcigpIHtcbiAgICBkaXNtaXNzSGFuZGxlclRvZ2dsZSgxKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gaGlkZVRyaWdnZXIoKSB7XG4gICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUoKTtcbiAgICByZW1vdmVQb3BvdmVyKCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBzZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkgeyBzZWxmLnNob3coKTsgfVxuICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICB9O1xuICBzZWxmLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChwb3BvdmVyID09PSBudWxsKSB7XG4gICAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93Q3VzdG9tRXZlbnQpO1xuICAgICAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICAgICAgY3JlYXRlUG9wb3ZlcigpO1xuICAgICAgICB1cGRhdGVQb3BvdmVyKCk7XG4gICAgICAgIHNob3dQb3BvdmVyKCk7XG4gICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHBvcG92ZXIsIHNob3dUcmlnZ2VyKSA6IHNob3dUcmlnZ2VyKCk7XG4gICAgICB9XG4gICAgfSwgMjAgKTtcbiAgfTtcbiAgc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocG9wb3ZlciAmJiBwb3BvdmVyICE9PSBudWxsICYmIHBvcG92ZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgICAgIGlmICggaGlkZUN1c3RvbUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7IHJldHVybjsgfVxuICAgICAgICBwb3BvdmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgICAgISFvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQocG9wb3ZlciwgaGlkZVRyaWdnZXIpIDogaGlkZVRyaWdnZXIoKTtcbiAgICAgIH1cbiAgICB9LCBvcHMuZGVsYXkgKTtcbiAgfTtcbiAgc2VsZi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuaGlkZSgpO1xuICAgIHRvZ2dsZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlBvcG92ZXI7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuUG9wb3ZlciAmJiBlbGVtZW50LlBvcG92ZXIuZGlzcG9zZSgpO1xuICB0cmlnZ2VyRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRyaWdnZXInKTtcbiAgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicpO1xuICBwbGFjZW1lbnREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGxhY2VtZW50Jyk7XG4gIGRpc21pc3NpYmxlRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWRpc21pc3NpYmxlJyk7XG4gIGRlbGF5RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWRlbGF5Jyk7XG4gIGNvbnRhaW5lckRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jb250YWluZXInKTtcbiAgY2xvc2VCdG4gPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiPsOXPC9idXR0b24+JztcbiAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAncG9wb3ZlcicpO1xuICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ3BvcG92ZXInKTtcbiAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAncG9wb3ZlcicpO1xuICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAncG9wb3ZlcicpO1xuICBjb250YWluZXJFbGVtZW50ID0gcXVlcnlFbGVtZW50KG9wdGlvbnMuY29udGFpbmVyKTtcbiAgY29udGFpbmVyRGF0YUVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoY29udGFpbmVyRGF0YSk7XG4gIG1vZGFsID0gZWxlbWVudC5jbG9zZXN0KCcubW9kYWwnKTtcbiAgbmF2YmFyRml4ZWRUb3AgPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC10b3AnKTtcbiAgbmF2YmFyRml4ZWRCb3R0b20gPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC1ib3R0b20nKTtcbiAgb3BzLnRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZSA/IG9wdGlvbnMudGVtcGxhdGUgOiBudWxsO1xuICBvcHMudHJpZ2dlciA9IG9wdGlvbnMudHJpZ2dlciA/IG9wdGlvbnMudHJpZ2dlciA6IHRyaWdnZXJEYXRhIHx8ICdob3Zlcic7XG4gIG9wcy5hbmltYXRpb24gPSBvcHRpb25zLmFuaW1hdGlvbiAmJiBvcHRpb25zLmFuaW1hdGlvbiAhPT0gJ2ZhZGUnID8gb3B0aW9ucy5hbmltYXRpb24gOiBhbmltYXRpb25EYXRhIHx8ICdmYWRlJztcbiAgb3BzLnBsYWNlbWVudCA9IG9wdGlvbnMucGxhY2VtZW50ID8gb3B0aW9ucy5wbGFjZW1lbnQgOiBwbGFjZW1lbnREYXRhIHx8ICd0b3AnO1xuICBvcHMuZGVsYXkgPSBwYXJzZUludChvcHRpb25zLmRlbGF5IHx8IGRlbGF5RGF0YSkgfHwgMjAwO1xuICBvcHMuZGlzbWlzc2libGUgPSBvcHRpb25zLmRpc21pc3NpYmxlIHx8IGRpc21pc3NpYmxlRGF0YSA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlO1xuICBvcHMuY29udGFpbmVyID0gY29udGFpbmVyRWxlbWVudCA/IGNvbnRhaW5lckVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBjb250YWluZXJEYXRhRWxlbWVudCA/IGNvbnRhaW5lckRhdGFFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRUb3AgPyBuYXZiYXJGaXhlZFRvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkQm90dG9tID8gbmF2YmFyRml4ZWRCb3R0b21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBtb2RhbCA/IG1vZGFsIDogZG9jdW1lbnQuYm9keTtcbiAgcGxhY2VtZW50Q2xhc3MgPSBcImJzLXBvcG92ZXItXCIgKyAob3BzLnBsYWNlbWVudCk7XG4gIHZhciBwb3BvdmVyQ29udGVudHMgPSBnZXRDb250ZW50cygpO1xuICB0aXRsZVN0cmluZyA9IHBvcG92ZXJDb250ZW50c1swXTtcbiAgY29udGVudFN0cmluZyA9IHBvcG92ZXJDb250ZW50c1sxXTtcbiAgaWYgKCAhY29udGVudFN0cmluZyAmJiAhb3BzLnRlbXBsYXRlICkgeyByZXR1cm47IH1cbiAgaWYgKCAhZWxlbWVudC5Qb3BvdmVyICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBlbGVtZW50LlBvcG92ZXIgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBTY3JvbGxTcHkoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgdmFycyxcbiAgICB0YXJnZXREYXRhLFxuICAgIG9mZnNldERhdGEsXG4gICAgc3B5VGFyZ2V0LFxuICAgIHNjcm9sbFRhcmdldCxcbiAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gdXBkYXRlVGFyZ2V0cygpe1xuICAgIHZhciBsaW5rcyA9IHNweVRhcmdldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQScpO1xuICAgIGlmICh2YXJzLmxlbmd0aCAhPT0gbGlua3MubGVuZ3RoKSB7XG4gICAgICB2YXJzLml0ZW1zID0gW107XG4gICAgICB2YXJzLnRhcmdldHMgPSBbXTtcbiAgICAgIEFycmF5LmZyb20obGlua3MpLm1hcChmdW5jdGlvbiAobGluayl7XG4gICAgICAgIHZhciBocmVmID0gbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSxcbiAgICAgICAgICB0YXJnZXRJdGVtID0gaHJlZiAmJiBocmVmLmNoYXJBdCgwKSA9PT0gJyMnICYmIGhyZWYuc2xpY2UoLTEpICE9PSAnIycgJiYgcXVlcnlFbGVtZW50KGhyZWYpO1xuICAgICAgICBpZiAoIHRhcmdldEl0ZW0gKSB7XG4gICAgICAgICAgdmFycy5pdGVtcy5wdXNoKGxpbmspO1xuICAgICAgICAgIHZhcnMudGFyZ2V0cy5wdXNoKHRhcmdldEl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHZhcnMubGVuZ3RoID0gbGlua3MubGVuZ3RoO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVJdGVtKGluZGV4KSB7XG4gICAgdmFyIGl0ZW0gPSB2YXJzLml0ZW1zW2luZGV4XSxcbiAgICAgIHRhcmdldEl0ZW0gPSB2YXJzLnRhcmdldHNbaW5kZXhdLFxuICAgICAgZHJvcG1lbnUgPSBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24taXRlbScpICYmIGl0ZW0uY2xvc2VzdCgnLmRyb3Bkb3duLW1lbnUnKSxcbiAgICAgIGRyb3BMaW5rID0gZHJvcG1lbnUgJiYgZHJvcG1lbnUucHJldmlvdXNFbGVtZW50U2libGluZyxcbiAgICAgIG5leHRTaWJsaW5nID0gaXRlbS5uZXh0RWxlbWVudFNpYmxpbmcsXG4gICAgICBhY3RpdmVTaWJsaW5nID0gbmV4dFNpYmxpbmcgJiYgbmV4dFNpYmxpbmcuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWN0aXZlJykubGVuZ3RoLFxuICAgICAgdGFyZ2V0UmVjdCA9IHZhcnMuaXNXaW5kb3cgJiYgdGFyZ2V0SXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIGlzQWN0aXZlID0gaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpIHx8IGZhbHNlLFxuICAgICAgdG9wRWRnZSA9ICh2YXJzLmlzV2luZG93ID8gdGFyZ2V0UmVjdC50b3AgKyB2YXJzLnNjcm9sbE9mZnNldCA6IHRhcmdldEl0ZW0ub2Zmc2V0VG9wKSAtIG9wcy5vZmZzZXQsXG4gICAgICBib3R0b21FZGdlID0gdmFycy5pc1dpbmRvdyA/IHRhcmdldFJlY3QuYm90dG9tICsgdmFycy5zY3JvbGxPZmZzZXQgLSBvcHMub2Zmc2V0XG4gICAgICAgICAgICAgICAgIDogdmFycy50YXJnZXRzW2luZGV4KzFdID8gdmFycy50YXJnZXRzW2luZGV4KzFdLm9mZnNldFRvcCAtIG9wcy5vZmZzZXRcbiAgICAgICAgICAgICAgICAgOiBlbGVtZW50LnNjcm9sbEhlaWdodCxcbiAgICAgIGluc2lkZSA9IGFjdGl2ZVNpYmxpbmcgfHwgdmFycy5zY3JvbGxPZmZzZXQgPj0gdG9wRWRnZSAmJiBib3R0b21FZGdlID4gdmFycy5zY3JvbGxPZmZzZXQ7XG4gICAgIGlmICggIWlzQWN0aXZlICYmIGluc2lkZSApIHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICBpZiAoZHJvcExpbmsgJiYgIWRyb3BMaW5rLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykgKSB7XG4gICAgICAgIGRyb3BMaW5rLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgfVxuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGJvb3RzdHJhcEN1c3RvbUV2ZW50KCAnYWN0aXZhdGUnLCAnc2Nyb2xsc3B5JywgdmFycy5pdGVtc1tpbmRleF0pKTtcbiAgICB9IGVsc2UgaWYgKCBpc0FjdGl2ZSAmJiAhaW5zaWRlICkge1xuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIGlmIChkcm9wTGluayAmJiBkcm9wTGluay5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmICFpdGVtLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWN0aXZlJykubGVuZ3RoICkge1xuICAgICAgICBkcm9wTGluay5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCBpc0FjdGl2ZSAmJiBpbnNpZGUgfHwgIWluc2lkZSAmJiAhaXNBY3RpdmUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHVwZGF0ZUl0ZW1zKCkge1xuICAgIHVwZGF0ZVRhcmdldHMoKTtcbiAgICB2YXJzLnNjcm9sbE9mZnNldCA9IHZhcnMuaXNXaW5kb3cgPyBnZXRTY3JvbGwoKS55IDogZWxlbWVudC5zY3JvbGxUb3A7XG4gICAgdmFycy5pdGVtcy5tYXAoZnVuY3Rpb24gKGwsaWR4KXsgcmV0dXJuIHVwZGF0ZUl0ZW0oaWR4KTsgfSk7XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlRXZlbnRzKGFjdGlvbikge1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBzY3JvbGxUYXJnZXRbYWN0aW9uXSgnc2Nyb2xsJywgc2VsZi5yZWZyZXNoLCBwYXNzaXZlSGFuZGxlciApO1xuICAgIHdpbmRvd1thY3Rpb25dKCAncmVzaXplJywgc2VsZi5yZWZyZXNoLCBwYXNzaXZlSGFuZGxlciApO1xuICB9XG4gIHNlbGYucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1cGRhdGVJdGVtcygpO1xuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgZGVsZXRlIGVsZW1lbnQuU2Nyb2xsU3B5O1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlNjcm9sbFNweSAmJiBlbGVtZW50LlNjcm9sbFNweS5kaXNwb3NlKCk7XG4gIHRhcmdldERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKTtcbiAgb2Zmc2V0RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnNldCcpO1xuICBzcHlUYXJnZXQgPSBxdWVyeUVsZW1lbnQob3B0aW9ucy50YXJnZXQgfHwgdGFyZ2V0RGF0YSk7XG4gIHNjcm9sbFRhcmdldCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IDwgZWxlbWVudC5zY3JvbGxIZWlnaHQgPyBlbGVtZW50IDogd2luZG93O1xuICBpZiAoIXNweVRhcmdldCkgeyByZXR1cm4gfVxuICBvcHMudGFyZ2V0ID0gc3B5VGFyZ2V0O1xuICBvcHMub2Zmc2V0ID0gcGFyc2VJbnQob3B0aW9ucy5vZmZzZXQgfHwgb2Zmc2V0RGF0YSkgfHwgMTA7XG4gIHZhcnMgPSB7fTtcbiAgdmFycy5sZW5ndGggPSAwO1xuICB2YXJzLml0ZW1zID0gW107XG4gIHZhcnMudGFyZ2V0cyA9IFtdO1xuICB2YXJzLmlzV2luZG93ID0gc2Nyb2xsVGFyZ2V0ID09PSB3aW5kb3c7XG4gIGlmICggIWVsZW1lbnQuU2Nyb2xsU3B5ICkge1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBzZWxmLnJlZnJlc2goKTtcbiAgZWxlbWVudC5TY3JvbGxTcHkgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBUYWIoZWxlbWVudCxvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgaGVpZ2h0RGF0YSxcbiAgICB0YWJzLCBkcm9wZG93bixcbiAgICBzaG93Q3VzdG9tRXZlbnQsXG4gICAgc2hvd25DdXN0b21FdmVudCxcbiAgICBoaWRlQ3VzdG9tRXZlbnQsXG4gICAgaGlkZGVuQ3VzdG9tRXZlbnQsXG4gICAgbmV4dCxcbiAgICB0YWJzQ29udGVudENvbnRhaW5lciA9IGZhbHNlLFxuICAgIGFjdGl2ZVRhYixcbiAgICBhY3RpdmVDb250ZW50LFxuICAgIG5leHRDb250ZW50LFxuICAgIGNvbnRhaW5lckhlaWdodCxcbiAgICBlcXVhbENvbnRlbnRzLFxuICAgIG5leHRIZWlnaHQsXG4gICAgYW5pbWF0ZUhlaWdodDtcbiAgZnVuY3Rpb24gdHJpZ2dlckVuZCgpIHtcbiAgICB0YWJzQ29udGVudENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICB0YWJzQ29udGVudENvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzaW5nJyk7XG4gICAgdGFicy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICB9XG4gIGZ1bmN0aW9uIHRyaWdnZXJTaG93KCkge1xuICAgIGlmICh0YWJzQ29udGVudENvbnRhaW5lcikge1xuICAgICAgaWYgKCBlcXVhbENvbnRlbnRzICkge1xuICAgICAgICB0cmlnZ2VyRW5kKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0YWJzQ29udGVudENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBuZXh0SGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyLm9mZnNldFdpZHRoO1xuICAgICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRhYnNDb250ZW50Q29udGFpbmVyLCB0cmlnZ2VyRW5kKTtcbiAgICAgICAgfSw1MCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhYnMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgc2hvd25DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdzaG93bicsICd0YWInLCBhY3RpdmVUYWIpO1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChuZXh0LCBzaG93bkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiB0cmlnZ2VySGlkZSgpIHtcbiAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgIGFjdGl2ZUNvbnRlbnQuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XG4gICAgICBuZXh0Q29udGVudC5zdHlsZS5mbG9hdCA9ICdsZWZ0JztcbiAgICAgIGNvbnRhaW5lckhlaWdodCA9IGFjdGl2ZUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cbiAgICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICd0YWInLCBhY3RpdmVUYWIpO1xuICAgIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICd0YWInLCBuZXh0KTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwobmV4dCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICBpZiAoIHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkICkgeyByZXR1cm47IH1cbiAgICBuZXh0Q29udGVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBhY3RpdmVDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIGlmICh0YWJzQ29udGVudENvbnRhaW5lcikge1xuICAgICAgbmV4dEhlaWdodCA9IG5leHRDb250ZW50LnNjcm9sbEhlaWdodDtcbiAgICAgIGVxdWFsQ29udGVudHMgPSBuZXh0SGVpZ2h0ID09PSBjb250YWluZXJIZWlnaHQ7XG4gICAgICB0YWJzQ29udGVudENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzaW5nJyk7XG4gICAgICB0YWJzQ29udGVudENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XG4gICAgICB0YWJzQ29udGVudENvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgICBhY3RpdmVDb250ZW50LnN0eWxlLmZsb2F0ID0gJyc7XG4gICAgICBuZXh0Q29udGVudC5zdHlsZS5mbG9hdCA9ICcnO1xuICAgIH1cbiAgICBpZiAoIG5leHRDb250ZW50LmNsYXNzTGlzdC5jb250YWlucygnZmFkZScpICkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5leHRDb250ZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQobmV4dENvbnRlbnQsdHJpZ2dlclNob3cpO1xuICAgICAgfSwyMCk7XG4gICAgfSBlbHNlIHsgdHJpZ2dlclNob3coKTsgfVxuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbChhY3RpdmVUYWIsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoKSB7XG4gICAgdmFyIGFjdGl2ZVRhYnMgPSB0YWJzLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLCBhY3RpdmVUYWI7XG4gICAgaWYgKCBhY3RpdmVUYWJzLmxlbmd0aCA9PT0gMSAmJiAhYWN0aXZlVGFic1swXS5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24nKSApIHtcbiAgICAgIGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbMF07XG4gICAgfSBlbHNlIGlmICggYWN0aXZlVGFicy5sZW5ndGggPiAxICkge1xuICAgICAgYWN0aXZlVGFiID0gYWN0aXZlVGFic1thY3RpdmVUYWJzLmxlbmd0aC0xXTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGl2ZVRhYjtcbiAgfVxuICBmdW5jdGlvbiBnZXRBY3RpdmVDb250ZW50KCkgeyByZXR1cm4gcXVlcnlFbGVtZW50KGdldEFjdGl2ZVRhYigpLmdldEF0dHJpYnV0ZSgnaHJlZicpKSB9XG4gIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIG5leHQgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgIXRhYnMuaXNBbmltYXRpbmcgJiYgc2VsZi5zaG93KCk7XG4gIH1cbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIG5leHQgPSBuZXh0IHx8IGVsZW1lbnQ7XG4gICAgaWYgKCFuZXh0LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgIG5leHRDb250ZW50ID0gcXVlcnlFbGVtZW50KG5leHQuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuICAgICAgYWN0aXZlVGFiID0gZ2V0QWN0aXZlVGFiKCk7XG4gICAgICBhY3RpdmVDb250ZW50ID0gZ2V0QWN0aXZlQ29udGVudCgpO1xuICAgICAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoICdoaWRlJywgJ3RhYicsIG5leHQpO1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGFjdGl2ZVRhYiwgaGlkZUN1c3RvbUV2ZW50KTtcbiAgICAgIGlmIChoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgIHRhYnMuaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgYWN0aXZlVGFiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgYWN0aXZlVGFiLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsJ2ZhbHNlJyk7XG4gICAgICBuZXh0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgbmV4dC5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCd0cnVlJyk7XG4gICAgICBpZiAoIGRyb3Bkb3duICkge1xuICAgICAgICBpZiAoICFlbGVtZW50LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdkcm9wZG93bi1tZW51JykgKSB7XG4gICAgICAgICAgaWYgKGRyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHsgZHJvcGRvd24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7IH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIWRyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHsgZHJvcGRvd24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGFjdGl2ZUNvbnRlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmYWRlJykpIHtcbiAgICAgICAgYWN0aXZlQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGFjdGl2ZUNvbnRlbnQsIHRyaWdnZXJIaWRlKTtcbiAgICAgIH0gZWxzZSB7IHRyaWdnZXJIaWRlKCk7IH1cbiAgICB9XG4gIH07XG4gIHNlbGYuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICAgIGRlbGV0ZSBlbGVtZW50LlRhYjtcbiAgfTtcbiAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgZWxlbWVudC5UYWIgJiYgZWxlbWVudC5UYWIuZGlzcG9zZSgpO1xuICBoZWlnaHREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0Jyk7XG4gIHRhYnMgPSBlbGVtZW50LmNsb3Nlc3QoJy5uYXYnKTtcbiAgZHJvcGRvd24gPSB0YWJzICYmIHF1ZXJ5RWxlbWVudCgnLmRyb3Bkb3duLXRvZ2dsZScsdGFicyk7XG4gIGFuaW1hdGVIZWlnaHQgPSAhc3VwcG9ydFRyYW5zaXRpb24gfHwgKG9wdGlvbnMuaGVpZ2h0ID09PSBmYWxzZSB8fCBoZWlnaHREYXRhID09PSAnZmFsc2UnKSA/IGZhbHNlIDogdHJ1ZTtcbiAgdGFicy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICBpZiAoICFlbGVtZW50LlRhYiApIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjbGlja0hhbmRsZXIsZmFsc2UpO1xuICB9XG4gIGlmIChhbmltYXRlSGVpZ2h0KSB7IHRhYnNDb250ZW50Q29udGFpbmVyID0gZ2V0QWN0aXZlQ29udGVudCgpLnBhcmVudE5vZGU7IH1cbiAgZWxlbWVudC5UYWIgPSBzZWxmO1xufVxuXG5mdW5jdGlvbiBUb2FzdChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHRvYXN0LCB0aW1lciA9IDAsXG4gICAgICBhbmltYXRpb25EYXRhLFxuICAgICAgYXV0b2hpZGVEYXRhLFxuICAgICAgZGVsYXlEYXRhLFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgaGlkZUN1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgICAgb3BzID0ge307XG4gIGZ1bmN0aW9uIHNob3dDb21wbGV0ZSgpIHtcbiAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCAnc2hvd2luZycgKTtcbiAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCAnc2hvdycgKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3Qsc2hvd25DdXN0b21FdmVudCk7XG4gICAgaWYgKG9wcy5hdXRvaGlkZSkgeyBzZWxmLmhpZGUoKTsgfVxuICB9XG4gIGZ1bmN0aW9uIGhpZGVDb21wbGV0ZSgpIHtcbiAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCAnaGlkZScgKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3QsaGlkZGVuQ3VzdG9tRXZlbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlICgpIHtcbiAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93JyApO1xuICAgIG9wcy5hbmltYXRpb24gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b2FzdCwgaGlkZUNvbXBsZXRlKSA6IGhpZGVDb21wbGV0ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGRpc3Bvc2VDb21wbGV0ZSgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLHNlbGYuaGlkZSxmYWxzZSk7XG4gICAgZGVsZXRlIGVsZW1lbnQuVG9hc3Q7XG4gIH1cbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0b2FzdCAmJiAhdG9hc3QuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnQuY2FsbCh0b2FzdCxzaG93Q3VzdG9tRXZlbnQpO1xuICAgICAgaWYgKHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgb3BzLmFuaW1hdGlvbiAmJiB0b2FzdC5jbGFzc0xpc3QuYWRkKCAnZmFkZScgKTtcbiAgICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnICk7XG4gICAgICB0b2FzdC5vZmZzZXRXaWR0aDtcbiAgICAgIHRvYXN0LmNsYXNzTGlzdC5hZGQoJ3Nob3dpbmcnICk7XG4gICAgICBvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9hc3QsIHNob3dDb21wbGV0ZSkgOiBzaG93Q29tcGxldGUoKTtcbiAgICB9XG4gIH07XG4gIHNlbGYuaGlkZSA9IGZ1bmN0aW9uIChub1RpbWVyKSB7XG4gICAgaWYgKHRvYXN0ICYmIHRvYXN0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKSB7XG4gICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwodG9hc3QsaGlkZUN1c3RvbUV2ZW50KTtcbiAgICAgIGlmKGhpZGVDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgbm9UaW1lciA/IGNsb3NlKCkgOiAodGltZXIgPSBzZXRUaW1lb3V0KCBjbG9zZSwgb3BzLmRlbGF5KSk7XG4gICAgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvYXN0LCBkaXNwb3NlQ29tcGxldGUpIDogZGlzcG9zZUNvbXBsZXRlKCk7XG4gIH07XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIGVsZW1lbnQuVG9hc3QgJiYgZWxlbWVudC5Ub2FzdC5kaXNwb3NlKCk7XG4gIHRvYXN0ID0gZWxlbWVudC5jbG9zZXN0KCcudG9hc3QnKTtcbiAgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicpO1xuICBhdXRvaGlkZURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hdXRvaGlkZScpO1xuICBkZWxheURhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kZWxheScpO1xuICBzaG93Q3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnc2hvdycsICd0b2FzdCcpO1xuICBoaWRlQ3VzdG9tRXZlbnQgPSBib290c3RyYXBDdXN0b21FdmVudCgnaGlkZScsICd0b2FzdCcpO1xuICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ3RvYXN0Jyk7XG4gIGhpZGRlbkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGRlbicsICd0b2FzdCcpO1xuICBvcHMuYW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRpb24gPT09IGZhbHNlIHx8IGFuaW1hdGlvbkRhdGEgPT09ICdmYWxzZScgPyAwIDogMTtcbiAgb3BzLmF1dG9oaWRlID0gb3B0aW9ucy5hdXRvaGlkZSA9PT0gZmFsc2UgfHwgYXV0b2hpZGVEYXRhID09PSAnZmFsc2UnID8gMCA6IDE7XG4gIG9wcy5kZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuZGVsYXkgfHwgZGVsYXlEYXRhKSB8fCA1MDA7XG4gIGlmICggIWVsZW1lbnQuVG9hc3QgKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsc2VsZi5oaWRlLGZhbHNlKTtcbiAgfVxuICBlbGVtZW50LlRvYXN0ID0gc2VsZjtcbn1cblxuZnVuY3Rpb24gVG9vbHRpcChlbGVtZW50LG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHRvb2x0aXAgPSBudWxsLCB0aW1lciA9IDAsIHRpdGxlU3RyaW5nLFxuICAgICAgYW5pbWF0aW9uRGF0YSxcbiAgICAgIHBsYWNlbWVudERhdGEsXG4gICAgICBkZWxheURhdGEsXG4gICAgICBjb250YWluZXJEYXRhLFxuICAgICAgc2hvd0N1c3RvbUV2ZW50LFxuICAgICAgc2hvd25DdXN0b21FdmVudCxcbiAgICAgIGhpZGVDdXN0b21FdmVudCxcbiAgICAgIGhpZGRlbkN1c3RvbUV2ZW50LFxuICAgICAgY29udGFpbmVyRWxlbWVudCxcbiAgICAgIGNvbnRhaW5lckRhdGFFbGVtZW50LFxuICAgICAgbW9kYWwsXG4gICAgICBuYXZiYXJGaXhlZFRvcCxcbiAgICAgIG5hdmJhckZpeGVkQm90dG9tLFxuICAgICAgcGxhY2VtZW50Q2xhc3MsXG4gICAgICBvcHMgPSB7fTtcbiAgZnVuY3Rpb24gZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0aXRsZScpXG4gICAgICAgIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJylcbiAgICAgICAgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZVRvb2xUaXAoKSB7XG4gICAgb3BzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCh0b29sdGlwKTtcbiAgICB0b29sdGlwID0gbnVsbDsgdGltZXIgPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVRvb2xUaXAoKSB7XG4gICAgdGl0bGVTdHJpbmcgPSBnZXRUaXRsZSgpO1xuICAgIGlmICggdGl0bGVTdHJpbmcgKSB7XG4gICAgICB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBpZiAob3BzLnRlbXBsYXRlKSB7XG4gICAgICAgIHZhciB0b29sdGlwTWFya3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2x0aXBNYXJrdXAuaW5uZXJIVE1MID0gb3BzLnRlbXBsYXRlLnRyaW0oKTtcbiAgICAgICAgdG9vbHRpcC5jbGFzc05hbWUgPSB0b29sdGlwTWFya3VwLmZpcnN0Q2hpbGQuY2xhc3NOYW1lO1xuICAgICAgICB0b29sdGlwLmlubmVySFRNTCA9IHRvb2x0aXBNYXJrdXAuZmlyc3RDaGlsZC5pbm5lckhUTUw7XG4gICAgICAgIHF1ZXJ5RWxlbWVudCgnLnRvb2x0aXAtaW5uZXInLHRvb2x0aXApLmlubmVySFRNTCA9IHRpdGxlU3RyaW5nLnRyaW0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0b29sdGlwQXJyb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbHRpcEFycm93LmNsYXNzTGlzdC5hZGQoJ2Fycm93Jyk7XG4gICAgICAgIHRvb2x0aXAuYXBwZW5kQ2hpbGQodG9vbHRpcEFycm93KTtcbiAgICAgICAgdmFyIHRvb2x0aXBJbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b29sdGlwSW5uZXIuY2xhc3NMaXN0LmFkZCgndG9vbHRpcC1pbm5lcicpO1xuICAgICAgICB0b29sdGlwLmFwcGVuZENoaWxkKHRvb2x0aXBJbm5lcik7XG4gICAgICAgIHRvb2x0aXBJbm5lci5pbm5lckhUTUwgPSB0aXRsZVN0cmluZztcbiAgICAgIH1cbiAgICAgIHRvb2x0aXAuc3R5bGUubGVmdCA9ICcwJztcbiAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0gJzAnO1xuICAgICAgdG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCd0b29sdGlwJyk7XG4gICAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMoJ3Rvb2x0aXAnKSAmJiB0b29sdGlwLmNsYXNzTGlzdC5hZGQoJ3Rvb2x0aXAnKTtcbiAgICAgICF0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucyhvcHMuYW5pbWF0aW9uKSAmJiB0b29sdGlwLmNsYXNzTGlzdC5hZGQob3BzLmFuaW1hdGlvbik7XG4gICAgICAhdG9vbHRpcC5jbGFzc0xpc3QuY29udGFpbnMocGxhY2VtZW50Q2xhc3MpICYmIHRvb2x0aXAuY2xhc3NMaXN0LmFkZChwbGFjZW1lbnRDbGFzcyk7XG4gICAgICBvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRvb2x0aXApO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVUb29sdGlwKCkge1xuICAgIHN0eWxlVGlwKGVsZW1lbnQsIHRvb2x0aXAsIG9wcy5wbGFjZW1lbnQsIG9wcy5jb250YWluZXIpO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dUb29sdGlwKCkge1xuICAgICF0b29sdGlwLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpICYmICggdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCdzaG93JykgKTtcbiAgfVxuICBmdW5jdGlvbiB0b3VjaEhhbmRsZXIoZSl7XG4gICAgaWYgKCB0b29sdGlwICYmIHRvb2x0aXAuY29udGFpbnMoZS50YXJnZXQpIHx8IGUudGFyZ2V0ID09PSBlbGVtZW50IHx8IGVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpKSA7IGVsc2Uge1xuICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZUFjdGlvbihhY3Rpb24pe1xuICAgIGFjdGlvbiA9IGFjdGlvbiA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICBkb2N1bWVudFthY3Rpb25dKCAndG91Y2hzdGFydCcsIHRvdWNoSGFuZGxlciwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgICB3aW5kb3dbYWN0aW9uXSggJ3Jlc2l6ZScsIHNlbGYuaGlkZSwgcGFzc2l2ZUhhbmRsZXIgKTtcbiAgfVxuICBmdW5jdGlvbiBzaG93QWN0aW9uKCkge1xuICAgIHRvZ2dsZUFjdGlvbigxKTtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd25DdXN0b21FdmVudCk7XG4gIH1cbiAgZnVuY3Rpb24gaGlkZUFjdGlvbigpIHtcbiAgICB0b2dnbGVBY3Rpb24oKTtcbiAgICByZW1vdmVUb29sVGlwKCk7XG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGRlbkN1c3RvbUV2ZW50KTtcbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVFdmVudHMoYWN0aW9uKSB7XG4gICAgYWN0aW9uID0gYWN0aW9uID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgIGVsZW1lbnRbYWN0aW9uXShtb3VzZUNsaWNrRXZlbnRzLmRvd24sIHNlbGYuc2hvdyxmYWxzZSk7XG4gICAgZWxlbWVudFthY3Rpb25dKG1vdXNlSG92ZXJFdmVudHNbMF0sIHNlbGYuc2hvdyxmYWxzZSk7XG4gICAgZWxlbWVudFthY3Rpb25dKG1vdXNlSG92ZXJFdmVudHNbMV0sIHNlbGYuaGlkZSxmYWxzZSk7XG4gIH1cbiAgc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodG9vbHRpcCA9PT0gbnVsbCkge1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd0N1c3RvbUV2ZW50KTtcbiAgICAgICAgaWYgKHNob3dDdXN0b21FdmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxuICAgICAgICBpZihjcmVhdGVUb29sVGlwKCkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgdXBkYXRlVG9vbHRpcCgpO1xuICAgICAgICAgIHNob3dUb29sdGlwKCk7XG4gICAgICAgICAgISFvcHMuYW5pbWF0aW9uID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9vbHRpcCwgc2hvd0FjdGlvbikgOiBzaG93QWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAyMCApO1xuICB9O1xuICBzZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0b29sdGlwICYmIHRvb2x0aXAuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykpIHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGVDdXN0b21FdmVudCk7XG4gICAgICAgIGlmIChoaWRlQ3VzdG9tRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cbiAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgICEhb3BzLmFuaW1hdGlvbiA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRvb2x0aXAsIGhpZGVBY3Rpb24pIDogaGlkZUFjdGlvbigpO1xuICAgICAgfVxuICAgIH0sIG9wcy5kZWxheSk7XG4gIH07XG4gIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdG9vbHRpcCkgeyBzZWxmLnNob3coKTsgfVxuICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICB9O1xuICBzZWxmLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdG9nZ2xlRXZlbnRzKCk7XG4gICAgc2VsZi5oaWRlKCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKSk7XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKTtcbiAgICBkZWxldGUgZWxlbWVudC5Ub29sdGlwO1xuICB9O1xuICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBlbGVtZW50LlRvb2x0aXAgJiYgZWxlbWVudC5Ub29sdGlwLmRpc3Bvc2UoKTtcbiAgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicpO1xuICBwbGFjZW1lbnREYXRhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGxhY2VtZW50Jyk7XG4gIGRlbGF5RGF0YSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWRlbGF5Jyk7XG4gIGNvbnRhaW5lckRhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jb250YWluZXInKTtcbiAgc2hvd0N1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3cnLCAndG9vbHRpcCcpO1xuICBzaG93bkN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ3Nob3duJywgJ3Rvb2x0aXAnKTtcbiAgaGlkZUN1c3RvbUV2ZW50ID0gYm9vdHN0cmFwQ3VzdG9tRXZlbnQoJ2hpZGUnLCAndG9vbHRpcCcpO1xuICBoaWRkZW5DdXN0b21FdmVudCA9IGJvb3RzdHJhcEN1c3RvbUV2ZW50KCdoaWRkZW4nLCAndG9vbHRpcCcpO1xuICBjb250YWluZXJFbGVtZW50ID0gcXVlcnlFbGVtZW50KG9wdGlvbnMuY29udGFpbmVyKTtcbiAgY29udGFpbmVyRGF0YUVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoY29udGFpbmVyRGF0YSk7XG4gIG1vZGFsID0gZWxlbWVudC5jbG9zZXN0KCcubW9kYWwnKTtcbiAgbmF2YmFyRml4ZWRUb3AgPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC10b3AnKTtcbiAgbmF2YmFyRml4ZWRCb3R0b20gPSBlbGVtZW50LmNsb3Nlc3QoJy5maXhlZC1ib3R0b20nKTtcbiAgb3BzLmFuaW1hdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uICYmIG9wdGlvbnMuYW5pbWF0aW9uICE9PSAnZmFkZScgPyBvcHRpb25zLmFuaW1hdGlvbiA6IGFuaW1hdGlvbkRhdGEgfHwgJ2ZhZGUnO1xuICBvcHMucGxhY2VtZW50ID0gb3B0aW9ucy5wbGFjZW1lbnQgPyBvcHRpb25zLnBsYWNlbWVudCA6IHBsYWNlbWVudERhdGEgfHwgJ3RvcCc7XG4gIG9wcy50ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUgPyBvcHRpb25zLnRlbXBsYXRlIDogbnVsbDtcbiAgb3BzLmRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5kZWxheSB8fCBkZWxheURhdGEpIHx8IDIwMDtcbiAgb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lckVsZW1lbnQgPyBjb250YWluZXJFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogY29udGFpbmVyRGF0YUVsZW1lbnQgPyBjb250YWluZXJEYXRhRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkVG9wID8gbmF2YmFyRml4ZWRUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZEJvdHRvbSA/IG5hdmJhckZpeGVkQm90dG9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbW9kYWwgPyBtb2RhbCA6IGRvY3VtZW50LmJvZHk7XG4gIHBsYWNlbWVudENsYXNzID0gXCJicy10b29sdGlwLVwiICsgKG9wcy5wbGFjZW1lbnQpO1xuICB0aXRsZVN0cmluZyA9IGdldFRpdGxlKCk7XG4gIGlmICggIXRpdGxlU3RyaW5nICkgeyByZXR1cm47IH1cbiAgaWYgKCFlbGVtZW50LlRvb2x0aXApIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbC10aXRsZScsdGl0bGVTdHJpbmcpO1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpO1xuICAgIHRvZ2dsZUV2ZW50cygxKTtcbiAgfVxuICBlbGVtZW50LlRvb2x0aXAgPSBzZWxmO1xufVxuXG52YXIgY29tcG9uZW50c0luaXQgPSB7fTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZURhdGFBUEkoIENvbnN0cnVjdG9yLCBjb2xsZWN0aW9uICl7XG4gIEFycmF5LmZyb20oY29sbGVjdGlvbikubWFwKGZ1bmN0aW9uICh4KXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih4KTsgfSk7XG59XG5mdW5jdGlvbiBpbml0Q2FsbGJhY2sobG9va1VwKXtcbiAgbG9va1VwID0gbG9va1VwIHx8IGRvY3VtZW50O1xuICBmb3IgKHZhciBjb21wb25lbnQgaW4gY29tcG9uZW50c0luaXQpIHtcbiAgICBpbml0aWFsaXplRGF0YUFQSSggY29tcG9uZW50c0luaXRbY29tcG9uZW50XVswXSwgbG9va1VwLnF1ZXJ5U2VsZWN0b3JBbGwgKGNvbXBvbmVudHNJbml0W2NvbXBvbmVudF1bMV0pICk7XG4gIH1cbn1cblxuY29tcG9uZW50c0luaXQuQWxlcnQgPSBbIEFsZXJ0LCAnW2RhdGEtZGlzbWlzcz1cImFsZXJ0XCJdJ107XG5jb21wb25lbnRzSW5pdC5CdXR0b24gPSBbIEJ1dHRvbiwgJ1tkYXRhLXRvZ2dsZT1cImJ1dHRvbnNcIl0nIF07XG5jb21wb25lbnRzSW5pdC5DYXJvdXNlbCA9IFsgQ2Fyb3VzZWwsICdbZGF0YS1yaWRlPVwiY2Fyb3VzZWxcIl0nIF07XG5jb21wb25lbnRzSW5pdC5Db2xsYXBzZSA9IFsgQ29sbGFwc2UsICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXScgXTtcbmNvbXBvbmVudHNJbml0LkRyb3Bkb3duID0gWyBEcm9wZG93biwgJ1tkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCJdJ107XG5jb21wb25lbnRzSW5pdC5Nb2RhbCA9IFsgTW9kYWwsICdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScgXTtcbmNvbXBvbmVudHNJbml0LlBvcG92ZXIgPSBbIFBvcG92ZXIsICdbZGF0YS10b2dnbGU9XCJwb3BvdmVyXCJdLFtkYXRhLXRpcD1cInBvcG92ZXJcIl0nIF07XG5jb21wb25lbnRzSW5pdC5TY3JvbGxTcHkgPSBbIFNjcm9sbFNweSwgJ1tkYXRhLXNweT1cInNjcm9sbFwiXScgXTtcbmNvbXBvbmVudHNJbml0LlRhYiA9IFsgVGFiLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJyBdO1xuY29tcG9uZW50c0luaXQuVG9hc3QgPSBbIFRvYXN0LCAnW2RhdGEtZGlzbWlzcz1cInRvYXN0XCJdJyBdO1xuY29tcG9uZW50c0luaXQuVG9vbHRpcCA9IFsgVG9vbHRpcCwgJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0sW2RhdGEtdGlwPVwidG9vbHRpcFwiXScgXTtcbmRvY3VtZW50LmJvZHkgPyBpbml0Q2FsbGJhY2soKSA6IGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gaW5pdFdyYXBwZXIoKXtcblx0aW5pdENhbGxiYWNrKCk7XG5cdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLGluaXRXcmFwcGVyLGZhbHNlKTtcbn0sIGZhbHNlICk7XG5cbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnREYXRhQVBJKCBDb25zdHJ1Y3Rvck5hbWUsIGNvbGxlY3Rpb24gKXtcbiAgQXJyYXkuZnJvbShjb2xsZWN0aW9uKS5tYXAoZnVuY3Rpb24gKHgpeyByZXR1cm4geFtDb25zdHJ1Y3Rvck5hbWVdLmRpc3Bvc2UoKTsgfSk7XG59XG5mdW5jdGlvbiByZW1vdmVEYXRhQVBJKGxvb2tVcCkge1xuICBsb29rVXAgPSBsb29rVXAgfHwgZG9jdW1lbnQ7XG4gIGZvciAodmFyIGNvbXBvbmVudCBpbiBjb21wb25lbnRzSW5pdCkge1xuICAgIHJlbW92ZUVsZW1lbnREYXRhQVBJKCBjb21wb25lbnQsIGxvb2tVcC5xdWVyeVNlbGVjdG9yQWxsIChjb21wb25lbnRzSW5pdFtjb21wb25lbnRdWzFdKSApO1xuICB9XG59XG5cbnZhciB2ZXJzaW9uID0gXCIzLjAuOVwiO1xuXG52YXIgaW5kZXggPSB7XG4gIEFsZXJ0OiBBbGVydCxcbiAgQnV0dG9uOiBCdXR0b24sXG4gIENhcm91c2VsOiBDYXJvdXNlbCxcbiAgQ29sbGFwc2U6IENvbGxhcHNlLFxuICBEcm9wZG93bjogRHJvcGRvd24sXG4gIE1vZGFsOiBNb2RhbCxcbiAgUG9wb3ZlcjogUG9wb3ZlcixcbiAgU2Nyb2xsU3B5OiBTY3JvbGxTcHksXG4gIFRhYjogVGFiLFxuICBUb2FzdDogVG9hc3QsXG4gIFRvb2x0aXA6IFRvb2x0aXAsXG4gIGluaXRDYWxsYmFjazogaW5pdENhbGxiYWNrLFxuICByZW1vdmVEYXRhQVBJOiByZW1vdmVEYXRhQVBJLFxuICBjb21wb25lbnRzSW5pdDogY29tcG9uZW50c0luaXQsXG4gIFZlcnNpb246IHZlcnNpb25cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGluZGV4O1xuIl0sIm5hbWVzIjpbInRyYW5zaXRpb25FbmRFdmVudCIsImRvY3VtZW50IiwiYm9keSIsInN0eWxlIiwic3VwcG9ydFRyYW5zaXRpb24iLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJnZXRFbGVtZW50VHJhbnNpdGlvbkR1cmF0aW9uIiwiZWxlbWVudCIsImR1cmF0aW9uIiwicGFyc2VGbG9hdCIsImdldENvbXB1dGVkU3R5bGUiLCJpc05hTiIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiaGFuZGxlciIsImNhbGxlZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ0cmFuc2l0aW9uRW5kV3JhcHBlciIsImUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2V0VGltZW91dCIsInF1ZXJ5RWxlbWVudCIsInNlbGVjdG9yIiwicGFyZW50IiwibG9va1VwIiwiRWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJib290c3RyYXBDdXN0b21FdmVudCIsImV2ZW50TmFtZSIsImNvbXBvbmVudE5hbWUiLCJyZWxhdGVkIiwiT3JpZ2luYWxDdXN0b21FdmVudCIsIkN1c3RvbUV2ZW50IiwiY2FuY2VsYWJsZSIsInJlbGF0ZWRUYXJnZXQiLCJkaXNwYXRjaEN1c3RvbUV2ZW50IiwiY3VzdG9tRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiQWxlcnQiLCJzZWxmIiwiYWxlcnQiLCJjbG9zZUN1c3RvbUV2ZW50IiwiY2xvc2VkQ3VzdG9tRXZlbnQiLCJ0cmlnZ2VySGFuZGxlciIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwidHJhbnNpdGlvbkVuZEhhbmRsZXIiLCJ0b2dnbGVFdmVudHMiLCJhY3Rpb24iLCJjbGlja0hhbmRsZXIiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiY2xvc2UiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJjYWxsIiwiZGVmYXVsdFByZXZlbnRlZCIsImRpc3Bvc2UiLCJyZW1vdmUiLCJCdXR0b24iLCJsYWJlbHMiLCJjaGFuZ2VDdXN0b21FdmVudCIsInRvZ2dsZSIsImlucHV0IiwibGFiZWwiLCJ0YWdOYW1lIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJ0eXBlIiwiY2hlY2tlZCIsImFkZCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInJlbW92ZUF0dHJpYnV0ZSIsInRvZ2dsZWQiLCJzY3JlZW5YIiwic2NyZWVuWSIsIkFycmF5IiwiZnJvbSIsIm1hcCIsIm90aGVyTGFiZWwiLCJvdGhlcklucHV0Iiwia2V5SGFuZGxlciIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsImFjdGl2ZUVsZW1lbnQiLCJwcmV2ZW50U2Nyb2xsIiwicHJldmVudERlZmF1bHQiLCJmb2N1c1RvZ2dsZSIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJsZW5ndGgiLCJidG4iLCJtb3VzZUhvdmVyRXZlbnRzIiwic3VwcG9ydFBhc3NpdmUiLCJyZXN1bHQiLCJvcHRzIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiLCJ3cmFwIiwicGFzc2l2ZUhhbmRsZXIiLCJwYXNzaXZlIiwiaXNFbGVtZW50SW5TY3JvbGxSYW5nZSIsImJjciIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInZpZXdwb3J0SGVpZ2h0Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRIZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJDYXJvdXNlbCIsIm9wdGlvbnMiLCJ2YXJzIiwib3BzIiwic2xpZGVDdXN0b21FdmVudCIsInNsaWRDdXN0b21FdmVudCIsInNsaWRlcyIsImxlZnRBcnJvdyIsInJpZ2h0QXJyb3ciLCJpbmRpY2F0b3IiLCJpbmRpY2F0b3JzIiwicGF1c2VIYW5kbGVyIiwiaW50ZXJ2YWwiLCJpc1NsaWRpbmciLCJjbGVhckludGVydmFsIiwidGltZXIiLCJyZXN1bWVIYW5kbGVyIiwiY3ljbGUiLCJpbmRpY2F0b3JIYW5kbGVyIiwiZXZlbnRUYXJnZXQiLCJpbmRleCIsInBhcnNlSW50Iiwic2xpZGVUbyIsImNvbnRyb2xzSGFuZGxlciIsImN1cnJlbnRUYXJnZXQiLCJzcmNFbGVtZW50IiwicmVmIiwicGF1c2UiLCJ0b3VjaCIsInRvdWNoRG93bkhhbmRsZXIiLCJrZXlib2FyZCIsInRvZ2dsZVRvdWNoRXZlbnRzIiwidG91Y2hNb3ZlSGFuZGxlciIsInRvdWNoRW5kSGFuZGxlciIsImlzVG91Y2giLCJ0b3VjaFBvc2l0aW9uIiwic3RhcnRYIiwiY2hhbmdlZFRvdWNoZXMiLCJwYWdlWCIsImN1cnJlbnRYIiwiZW5kWCIsIk1hdGgiLCJhYnMiLCJzZXRBY3RpdmVQYWdlIiwicGFnZUluZGV4IiwieCIsIm5leHQiLCJ0aW1lb3V0IiwiZWxhcHNlZFRpbWUiLCJhY3RpdmVJdGVtIiwiZ2V0QWN0aXZlSW5kZXgiLCJvcmllbnRhdGlvbiIsImRpcmVjdGlvbiIsImhpZGRlbiIsInNldEludGVydmFsIiwiaWR4Iiwib2Zmc2V0V2lkdGgiLCJpbmRleE9mIiwiaXRlbUNsYXNzZXMiLCJzbGlkZSIsImNscyIsImludGVydmFsQXR0cmlidXRlIiwiaW50ZXJ2YWxEYXRhIiwidG91Y2hEYXRhIiwicGF1c2VEYXRhIiwia2V5Ym9hcmREYXRhIiwiaW50ZXJ2YWxPcHRpb24iLCJ0b3VjaE9wdGlvbiIsIkNvbGxhcHNlIiwiYWNjb3JkaW9uIiwiY29sbGFwc2UiLCJhY3RpdmVDb2xsYXBzZSIsInNob3dDdXN0b21FdmVudCIsInNob3duQ3VzdG9tRXZlbnQiLCJoaWRlQ3VzdG9tRXZlbnQiLCJoaWRkZW5DdXN0b21FdmVudCIsIm9wZW5BY3Rpb24iLCJjb2xsYXBzZUVsZW1lbnQiLCJpc0FuaW1hdGluZyIsImhlaWdodCIsInNjcm9sbEhlaWdodCIsImNsb3NlQWN0aW9uIiwic2hvdyIsImhpZGUiLCJpZCIsImFjY29yZGlvbkRhdGEiLCJzZXRGb2N1cyIsImZvY3VzIiwic2V0QWN0aXZlIiwiRHJvcGRvd24iLCJvcHRpb24iLCJtZW51IiwibWVudUl0ZW1zIiwicGVyc2lzdCIsInByZXZlbnRFbXB0eUFuY2hvciIsImFuY2hvciIsImhyZWYiLCJzbGljZSIsInRvZ2dsZURpc21pc3MiLCJvcGVuIiwiZGlzbWlzc0hhbmRsZXIiLCJoYXNEYXRhIiwiaXNTYW1lRWxlbWVudCIsImlzSW5zaWRlTWVudSIsImlzTWVudUl0ZW0iLCJjaGlsZHJlbiIsImNoaWxkIiwicHVzaCIsIk1vZGFsIiwibW9kYWwiLCJzY3JvbGxCYXJXaWR0aCIsIm92ZXJsYXkiLCJvdmVybGF5RGVsYXkiLCJmaXhlZEl0ZW1zIiwic2V0U2Nyb2xsYmFyIiwib3Blbk1vZGFsIiwiYm9keVBhZCIsInBhZGRpbmdSaWdodCIsImJvZHlPdmVyZmxvdyIsIm1vZGFsT3ZlcmZsb3ciLCJtZWFzdXJlU2Nyb2xsYmFyIiwiZml4ZWQiLCJpdGVtUGFkIiwicmVzZXRTY3JvbGxiYXIiLCJzY3JvbGxEaXYiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGhWYWx1ZSIsImNsYXNzTmFtZSIsImFwcGVuZENoaWxkIiwiY2xpZW50V2lkdGgiLCJjcmVhdGVPdmVybGF5IiwibmV3T3ZlcmxheSIsImFuaW1hdGlvbiIsInJlbW92ZU92ZXJsYXkiLCJ1cGRhdGUiLCJiZWZvcmVTaG93IiwiZGlzcGxheSIsInRyaWdnZXJTaG93IiwidHJpZ2dlckhpZGUiLCJmb3JjZSIsImNsaWNrVGFyZ2V0IiwibW9kYWxJRCIsInRhcmdldEF0dHJWYWx1ZSIsImVsZW1BdHRyVmFsdWUiLCJtb2RhbFRyaWdnZXIiLCJwYXJlbnRXaXRoRGF0YSIsImJhY2tkcm9wIiwiY3VycmVudE9wZW4iLCJzZXRDb250ZW50IiwiY29udGVudCIsImlubmVySFRNTCIsImNoZWNrTW9kYWwiLCJjb25jYXQiLCJ0cmltIiwibW91c2VDbGlja0V2ZW50cyIsImRvd24iLCJ1cCIsImdldFNjcm9sbCIsInkiLCJwYWdlWU9mZnNldCIsInNjcm9sbFRvcCIsInBhZ2VYT2Zmc2V0Iiwic2Nyb2xsTGVmdCIsInN0eWxlVGlwIiwibGluayIsInBvc2l0aW9uIiwidGlwUG9zaXRpb25zIiwiZWxlbWVudERpbWVuc2lvbnMiLCJ3IiwiaCIsIm9mZnNldEhlaWdodCIsIndpbmRvd1dpZHRoIiwid2luZG93SGVpZ2h0IiwicmVjdCIsInNjcm9sbCIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJsaW5rRGltZW5zaW9ucyIsInJpZ2h0IiwibGVmdCIsImlzUG9wb3ZlciIsImFycm93IiwiaGFsZlRvcEV4Y2VlZCIsImhhbGZMZWZ0RXhjZWVkIiwiaGFsZlJpZ2h0RXhjZWVkIiwiaGFsZkJvdHRvbUV4Y2VlZCIsInRvcEV4Y2VlZCIsImxlZnRFeGNlZWQiLCJib3R0b21FeGNlZWQiLCJyaWdodEV4Y2VlZCIsInRvcFBvc2l0aW9uIiwibGVmdFBvc2l0aW9uIiwiYXJyb3dUb3AiLCJhcnJvd0xlZnQiLCJhcnJvd1dpZHRoIiwiYXJyb3dIZWlnaHQiLCJyZXBsYWNlIiwiUG9wb3ZlciIsInBvcG92ZXIiLCJpc0lwaG9uZSIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ0aXRsZVN0cmluZyIsImNvbnRlbnRTdHJpbmciLCJ0cmlnZ2VyRGF0YSIsImFuaW1hdGlvbkRhdGEiLCJwbGFjZW1lbnREYXRhIiwiZGlzbWlzc2libGVEYXRhIiwiZGVsYXlEYXRhIiwiY29udGFpbmVyRGF0YSIsImNsb3NlQnRuIiwiY29udGFpbmVyRWxlbWVudCIsImNvbnRhaW5lckRhdGFFbGVtZW50IiwibmF2YmFyRml4ZWRUb3AiLCJuYXZiYXJGaXhlZEJvdHRvbSIsInBsYWNlbWVudENsYXNzIiwiZGlzbWlzc2libGVIYW5kbGVyIiwiZ2V0Q29udGVudHMiLCJ0aXRsZSIsInJlbW92ZVBvcG92ZXIiLCJjb250YWluZXIiLCJjcmVhdGVQb3BvdmVyIiwicG9wb3ZlckFycm93IiwidGVtcGxhdGUiLCJwb3BvdmVyVGl0bGUiLCJkaXNtaXNzaWJsZSIsInBvcG92ZXJCb2R5TWFya3VwIiwicG9wb3ZlclRlbXBsYXRlIiwiZmlyc3RDaGlsZCIsInBvcG92ZXJIZWFkZXIiLCJwb3BvdmVyQm9keSIsInNob3dQb3BvdmVyIiwidXBkYXRlUG9wb3ZlciIsInBsYWNlbWVudCIsImZvcmNlRm9jdXMiLCJ0cmlnZ2VyIiwidG91Y2hIYW5kbGVyIiwiZGlzbWlzc0hhbmRsZXJUb2dnbGUiLCJzaG93VHJpZ2dlciIsImhpZGVUcmlnZ2VyIiwiY2xlYXJUaW1lb3V0IiwiZGVsYXkiLCJwb3BvdmVyQ29udGVudHMiLCJTY3JvbGxTcHkiLCJ0YXJnZXREYXRhIiwib2Zmc2V0RGF0YSIsInNweVRhcmdldCIsInNjcm9sbFRhcmdldCIsInVwZGF0ZVRhcmdldHMiLCJsaW5rcyIsIml0ZW1zIiwidGFyZ2V0cyIsInRhcmdldEl0ZW0iLCJjaGFyQXQiLCJ1cGRhdGVJdGVtIiwiaXRlbSIsImRyb3BtZW51IiwiZHJvcExpbmsiLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwibmV4dFNpYmxpbmciLCJuZXh0RWxlbWVudFNpYmxpbmciLCJhY3RpdmVTaWJsaW5nIiwidGFyZ2V0UmVjdCIsImlzV2luZG93IiwiaXNBY3RpdmUiLCJ0b3BFZGdlIiwic2Nyb2xsT2Zmc2V0Iiwib2Zmc2V0IiwiYm90dG9tRWRnZSIsImluc2lkZSIsInVwZGF0ZUl0ZW1zIiwibCIsInJlZnJlc2giLCJUYWIiLCJoZWlnaHREYXRhIiwidGFicyIsImRyb3Bkb3duIiwidGFic0NvbnRlbnRDb250YWluZXIiLCJhY3RpdmVUYWIiLCJhY3RpdmVDb250ZW50IiwibmV4dENvbnRlbnQiLCJjb250YWluZXJIZWlnaHQiLCJlcXVhbENvbnRlbnRzIiwibmV4dEhlaWdodCIsImFuaW1hdGVIZWlnaHQiLCJ0cmlnZ2VyRW5kIiwiZ2V0QWN0aXZlVGFiIiwiYWN0aXZlVGFicyIsImdldEFjdGl2ZUNvbnRlbnQiLCJUb2FzdCIsInRvYXN0IiwiYXV0b2hpZGVEYXRhIiwic2hvd0NvbXBsZXRlIiwiYXV0b2hpZGUiLCJoaWRlQ29tcGxldGUiLCJkaXNwb3NlQ29tcGxldGUiLCJub1RpbWVyIiwiVG9vbHRpcCIsInRvb2x0aXAiLCJnZXRUaXRsZSIsInJlbW92ZVRvb2xUaXAiLCJjcmVhdGVUb29sVGlwIiwidG9vbHRpcE1hcmt1cCIsInRvb2x0aXBBcnJvdyIsInRvb2x0aXBJbm5lciIsInVwZGF0ZVRvb2x0aXAiLCJzaG93VG9vbHRpcCIsInRvZ2dsZUFjdGlvbiIsInNob3dBY3Rpb24iLCJoaWRlQWN0aW9uIiwiY29tcG9uZW50c0luaXQiLCJpbml0aWFsaXplRGF0YUFQSSIsIkNvbnN0cnVjdG9yIiwiY29sbGVjdGlvbiIsImluaXRDYWxsYmFjayIsImNvbXBvbmVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJpbml0V3JhcHBlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7RUFBQTs7Ozs7RUFLQSxJQUFJQSxrQkFBa0IsR0FBRyxzQkFBc0JDLFFBQVEsQ0FBQ0MsSUFBVCxDQUFjQyxLQUFwQyxHQUE0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
