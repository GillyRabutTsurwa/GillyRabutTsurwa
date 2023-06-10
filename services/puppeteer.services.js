const puppeteer = require("puppeteer");
class PuppeteerService {
    browser;
    page;

    async init() {
        this.browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--window-position=0,0",
                "--ignore-certifcate-errors",
                "--ignore-certifcate-errors-spki-list",
                "--incognito",
                "--proxy-server=http=194.67.37.90:3128",
                // '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"', //
            ],
            // headless: false,
        });
    }

    /**
     *
     * @param {string} url
     */
    async goToPage(url) {
        if (!this.browser) {
            await this.init();
        }
        this.page = await this.browser.newPage();

        await this.page.setExtraHTTPHeaders({
            "Accept-Language": "en-US",
        });

        await this.page.goto(url, {
            waitUntil: `networkidle0`,
        });
    }

    async close() {
        await this.page.close();
        await this.browser.close();
    }
    // NEW
    delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    //NEW: this will show new instagram posts each time the page is rendered
    shuffleArray(array) {
        const newArray = [...array]; // Create a new array to avoid modifying the original array

        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Generate a random index from 0 to i

            // Swap elements between indices i and j
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    /**
     *
     * @param {string} acc Account to crawl
     * @param {number} n Qty of image to fetch
     */
    async getLatestInstagramPostsFromAccount(acc, n) {
        try {
            const page = `https://www.picuki.com/profile/${acc}`;
            await this.goToPage(page, {
                waitUntil: "load",
                timeout: 0,
            });
            let previousHeight;

            previousHeight = await this.page.evaluate(`document.body.scrollHeight`);
            await this.page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);

            // await this.page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await this.delay(5000); // Introduce a delay of 1000 milliseconds
            await this.page.setDefaultNavigationTimeout(0);

            const nodes = await this.page.evaluate(() => {
                const images = document.querySelectorAll(`.post-image`);
                const imageURLS = [].map.call(images, (img) => img.src);
                return imageURLS;
            });

            const shuffledImageURLS = this.shuffleArray(nodes);
            console.log("nodes", shuffledImageURLS);

            return shuffledImageURLS.slice(0, n);
        } catch (error) {
            console.log(`Erreur: ${error}`);
            console.log(error);
            process.exit();
        }
    }
}

const puppeteerService = new PuppeteerService();
module.exports = puppeteerService;
