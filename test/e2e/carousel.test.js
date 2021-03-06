/* eslint-disable max-nested-callbacks */
describe('Nuka Carousel', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:8080');
  });

  describe('Button Navigation and Loading', () => {
    it('should load the carousel page with the initial slide.', async () => {
      await expect(page).toMatch('Nuka Carousel: Slide 1');
    });

    it('should show the next slide when the Next button is clicked.', async () => {
      await expect(page).toClick('button', { text: 'NEXT' });
      await expect(page).toMatch('Nuka Carousel: Slide 2');
    });

    it('should show the previous slide when the Previous button is clicked.', async () => {
      await expect(page).toClick('button', { text: 'NEXT' });
      await expect(page).toMatch('Nuka Carousel: Slide 2');
      await expect(page).toClick('button', { text: 'PREV' });
      await expect(page).toMatch('Nuka Carousel: Slide 1');
    });

    it('should navigate to the last slide from the first in wrapAround mode.', async () => {
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      await expect(page).toMatch('Nuka Carousel: Slide 1');
      await expect(page).toClick('button', { text: 'PREV' });
      await expect(page).toMatch('Nuka Carousel: Slide 6');
    });

    it('should navigate to the first slide from the last in wrapAround mode.', async () => {
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      await expect(page).toClick('button', { text: '6' });
      await expect(page).toMatch('Nuka Carousel: Slide 6');
      await expect(page).toClick('button', { text: 'NEXT' });
      await expect(page).toMatch('Nuka Carousel: Slide 1');
    });

    it('should navigate to the first slide from the second in wrapAround mode with only 2 slides.', async () => {
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      await expect(page).toClick('button', { text: '2 Slides Only' });
      await expect(page).toClick('button', { text: '2' });
      await expect(page).toMatch('Nuka Carousel: Slide 2');
      await expect(page).toClick('button', { text: 'NEXT' });
      await expect(page).toMatch('Nuka Carousel: Slide 1');
    });
  });

  describe('Swipe and Drag Events', () => {
    beforeEach(async () => {
      await page.setViewport({
        width: 1024,
        height: 768,
        hasTouch: true,
        isMobile: true
      });
    });

    it('should show the next slide when swiped to the left.', async () => {
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const startX = metrics.x + metrics.width / 2.0;
      const startY = metrics.y + metrics.height / 2.0;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX - metrics.width / 3.0, startY);
      await page.mouse.up();
      await expect(page).toMatch('Nuka Carousel: Slide 2');
    });

    it('should show the previous slide when swiped to the right.', async () => {
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const startX = metrics.x + metrics.width / 2.0;
      const startY = metrics.y + metrics.height / 2.0;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX - metrics.width / 3.0, startY);
      await page.mouse.up();
      await expect(page).toMatch('Nuka Carousel: Slide 2');
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + metrics.width / 3.0, startY);
      await page.mouse.up();
      await expect(page).toMatch('Nuka Carousel: Slide 1');
    });

    it('should show the last slide when swiped right from the first.', async () => {
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const startX = metrics.x + metrics.width / 2.0;
      const startY = metrics.y + metrics.height / 2.0;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + metrics.width / 3.0, startY);
      await page.mouse.up();
      await expect(page).toMatch('Nuka Carousel: Slide 6');
    });

    it('should show the first slide when swiped left from the last.', async () => {
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const startX = metrics.x + metrics.width / 2.0;
      const startY = metrics.y + metrics.height / 2.0;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + metrics.width / 3.0, startY);
      await page.mouse.up();
      await expect(page).toMatch('Nuka Carousel: Slide 6');
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX - metrics.width / 3.0, startY);
      await page.mouse.up();
      await expect(page).toMatch('Nuka Carousel: Slide 1');
    });

    it('should maintain left position of last slide on drag start when wrapping around from first -> last', async () => {
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const pointX = metrics.x + metrics.width / 2.0;
      const pointY = metrics.y + metrics.height / 2.0;
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      await expect(page).toClick('button', { text: 'PREV' });
      await expect(page).toMatch('Nuka Carousel: Slide 6');
      await page.waitFor(600); // need to let slide transition complete
      const getComputedStyleLeft = () => {
        const e = document.querySelector('.slider-slide:last-child');
        return window.getComputedStyle(e).left;
      };
      const mouseUpLeft = await page.evaluate(getComputedStyleLeft);
      await page.mouse.move(pointX, pointY);
      await page.mouse.down();
      const mouseUpDown = await page.evaluate(getComputedStyleLeft);
      expect(mouseUpLeft).toMatch(mouseUpDown);
    });

    it('should maintain left position of first slide on drag start when wrapping around from last -> first', async () => {
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const pointX = metrics.x + metrics.width / 2.0;
      const pointY = metrics.y + metrics.height / 2.0;
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      await expect(page).toClick('button', { text: '6' });
      await expect(page).toMatch('Nuka Carousel: Slide 6');
      await expect(page).toClick('button', { text: 'NEXT' });
      await expect(page).toMatch('Nuka Carousel: Slide 1');
      await page.waitFor(600); // need to let slide transition complete
      const getComputedStyleLeft = () => {
        const e = document.querySelector('.slider-slide:first-child');
        return window.getComputedStyle(e).left;
      };
      const mouseUpLeft = await page.evaluate(getComputedStyleLeft);
      await page.mouse.move(pointX, pointY);
      await page.mouse.down();
      const mouseUpDown = await page.evaluate(getComputedStyleLeft);
      expect(mouseUpLeft).toMatch(mouseUpDown);
    });

    it('should handle click events when slides wrap around from first -> last', async () => {
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const pointX = metrics.x + metrics.width / 2.0;
      const pointY = metrics.y + metrics.height / 2.0;
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      await expect(page).toClick('button', { text: 'PREV' });
      await expect(page).toMatch('Nuka Carousel: Slide 6');
      await page.waitFor(600); // need to let slide transition complete
      const getTextDecoration = () => {
        const e = document.querySelector('.slider-control-topcenter div');
        return window.getComputedStyle(e).textDecorationLine;
      };
      let textDecoration = await page.evaluate(getTextDecoration);
      expect(textDecoration).toMatch('none');
      await page.mouse.click(pointX, pointY);
      textDecoration = await page.evaluate(getTextDecoration);
      expect(textDecoration).toMatch('underline');
      await page.mouse.click(pointX, pointY);
      textDecoration = await page.evaluate(getTextDecoration);
      expect(textDecoration).toMatch('none');
    });

    it('should handle click events when slides wrap around from last -> first', async () => {
      const slide = await page.$('.slider-slide');
      const metrics = await slide.boundingBox();
      const pointX = metrics.x + metrics.width / 2.0;
      const pointY = metrics.y + metrics.height / 2.0;
      await expect(page).toClick('button', { text: 'Toggle Wrap Around' });
      await expect(page).toClick('button', { text: '6' });
      await expect(page).toMatch('Nuka Carousel: Slide 6');
      await expect(page).toClick('button', { text: 'NEXT' });
      await expect(page).toMatch('Nuka Carousel: Slide 1');
      await page.waitFor(600); // need to let slide transition complete
      const getTextDecoration = () => {
        const e = document.querySelector('.slider-control-topcenter div');
        return window.getComputedStyle(e).textDecorationLine;
      };
      let textDecoration = await page.evaluate(getTextDecoration);
      expect(textDecoration).toMatch('none');
      await page.mouse.click(pointX, pointY);
      textDecoration = await page.evaluate(getTextDecoration);
      expect(textDecoration).toMatch('underline');
      await page.mouse.click(pointX, pointY);
      textDecoration = await page.evaluate(getTextDecoration);
      expect(textDecoration).toMatch('none');
    });
  });
});
