import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import SwiperDots from './SwiperDots';

export default class Swiper extends Component {
  static PropTypes = {
    className: PropTypes.string,
    prefix: PropTypes.string,
    autoplay: PropTypes.bool,
    autoplayIterval: PropTypes.number,
    dots: PropTypes.bool,
    dotsColor: PropTypes.oneOf(['default', 'primary', 'success', 'danger']),
    dotsSize: PropTypes.oneOf(['normal', 'small', 'large']),
    arrows: PropTypes.bool,
    onChange: PropTypes.func
  };

  static childContextTypes = {
    component: PropTypes.any
  };

  static defaultProps = {
    className: '',
    prefix: 'zent',
    autoplay: false,
    autoplayIterval: 3000,
    dots: true,
    dotsColor: 'default',
    dotsSize: 'normal',
    arrows: false
  };

  static setStyle(target, styles) {
    Object.keys(styles).forEach(attribute => {
      target.style[attribute] = styles[attribute];
    });
  }

  state = {
    currentIndex: 0
  };

  init = () => {
    this.setSwiperWidth();
    this.setInnerElements();

    this.constructor.setStyle(this.swiperContainer, {
      width: `${this.swiperWidth * this.innerElements.length}px`
    });

    for (let i = 0; i < this.innerElements.length; i++) {
      this.constructor.setStyle(this.innerElements[i], {
        width: `${100 / this.innerElements.length}%`
      });
    }

    this.translate(0, true);
  };

  setSwiperWidth() {
    this.swiperWidth = this.swiper.getBoundingClientRect().width;
  }

  setInnerElements() {
    this.innerElements = [].slice.call(this.swiperContainer.children);
  }

  startAutoplay = () => {
    const { autoplayIterval } = this.props;
    this.autoplayTimer = setInterval(this.next, Number(autoplayIterval));
  };

  clearAutoplay = () => {
    clearInterval(this.autoplayTimer);
  };

  next = () => {
    const { currentIndex } = this.state;
    this.swipeTo(currentIndex + 1);
  };

  prev = () => {
    const { currentIndex } = this.state;
    this.swipeTo(currentIndex - 1);
  };

  swipeTo = index => {
    let currentIndex = index;
    this.setState({ currentIndex });
  };

  translate = (currentIndex = 0, isSilent = false) => {
    const initIndex = -1;
    const itemWidth = this.swiperWidth;
    const translateDistance = itemWidth * (initIndex - currentIndex);

    this.constructor.setStyle(this.swiperContainer, {
      transform: `translateX(${translateDistance}px)`,
      'transition-duration': isSilent ? '0ms' : '300ms'
    });
  };

  resetPosition = currentIndex => {
    const length = this.innerElements.length - 2;
    if (currentIndex < 0) {
      setTimeout(
        () =>
          this.setState({
            currentIndex: length - 1
          }),
        300
      );
    } else {
      setTimeout(
        () =>
          this.setState({
            currentIndex: 0
          }),
        300
      );
    }
  };

  getRealPrevIndex = index => {
    const length = this.innerElements.length - 2;
    let realIndex = index;

    if (realIndex > length - 1) {
      realIndex = length - 2;
    } else if (realIndex < 0) {
      realIndex = 0;
    }

    return realIndex;
  };

  handleMouseEnter = () => {
    const { autoplay } = this.props;
    autoplay && this.clearAutoplay();
  };

  handleMouseLeave = () => {
    const { autoplay } = this.props;
    autoplay && this.startAutoplay();
  };

  handleDotsClick = index => {
    this.setState({ currentIndex: index });
  };

  componentDidMount() {
    const { autoplay } = this.props;
    autoplay && this.startAutoplay();
    this.init();
    this.isFirstedMounted = true;
  }

  componentDidUpdate(prevProps, prevState) {
    const { onChange } = this.props;
    const { currentIndex } = this.state;
    const prevIndex = prevState.currentIndex;

    const length = this.innerElements.length - 2;

    if (prevIndex !== currentIndex) {
      const isSilent = prevIndex > length - 1 || prevIndex < 0;
      this.translate(currentIndex, isSilent);
    }

    if (currentIndex > length - 1 || currentIndex < 0) {
      return this.resetPosition(currentIndex);
    }

    onChange && onChange(currentIndex, this.getRealPrevIndex(prevIndex));
  }

  componentWillUnmount() {
    this.clearAutoplay();
  }

  render() {
    const {
      className,
      prefix,
      dots,
      dotsColor,
      dotsSize,
      arrows,
      children
    } = this.props;
    const { currentIndex } = this.state;

    if (!this.isFirstedMounted) {
      children.push(children[0]);
      children.unshift(children[children.length - 2]);
    }

    const classString = cx(`${prefix}-swiper`, className);

    return (
      <div
        ref={swiper => (this.swiper = swiper)}
        className={classString}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {arrows &&
          <div
            className={`${prefix}-swiper__arrow ${prefix}-swiper__arrow-left`}
            onClick={this.prev}
          >
            左
            <i className={`${prefix}-swiper__arrow-icon-left`} />
          </div>}
        {arrows &&
          <div
            className={`${prefix}-swiper__arrow ${prefix}-swiper__arrow-right`}
            onClick={this.next}
          >
            右
            <i className={`${prefix}-swiper__arrow-icon-right`} />
          </div>}
        <div
          ref={swiperContainer => (this.swiperContainer = swiperContainer)}
          className={`${prefix}-swiper__container`}
        >
          {Children.map(children, (child, index) => {
            return cloneElement(child, {
              key: index,
              style: { float: 'left', width: '100%', height: '100%' }
            });
          })}
        </div>
        {dots &&
          children.length > 1 &&
          <SwiperDots
            prefix={prefix}
            dotsColor={dotsColor}
            dotsSize={dotsSize}
            items={children}
            currentIndex={currentIndex}
            onDotsClick={this.handleDotsClick}
          />}
      </div>
    );
  }
}
