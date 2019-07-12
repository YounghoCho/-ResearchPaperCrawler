//에러 : 첫번째 문서가 자꾸 tag값이 null로 나와서.. continue 넣어놓음.

const keywords = ["인공지능"];

const puppeteer = require('puppeteer');
puppeteer.launch().then(async browser => {
    (async () => {
        const browser = await puppeteer.launch({headless: false})
        // const browser = await puppeteer.launch()
        const page = await browser.newPage()
        //err description
        process.on("unhandledRejection", (reason, p) => {
            console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
            browser.close();
        });
        //visit
        const navigationPromise = page.waitForNavigation()
        await page.goto('http://koreascience.or.kr/main.page?&lang=ko')
        await page.setViewport({width: 1440, height: 716})
        //seach
        await page.waitForSelector('.container > #main-menu > .flex-fill > .input-group > .form-control')
        await page.click('.container > #main-menu > .flex-fill > .input-group > .form-control')
        //////////////////while
        await page.keyboard.type(keywords[0]);
        await page.waitForSelector('#main-menu > .flex-fill > .input-group > .input-group-append > .btn-default')
        await page.click('#main-menu > .flex-fill > .input-group > .input-group-append > .btn-default')
        await navigationPromise
        //w1 무한 반복
        //w2 100번 반복
        let count = 4;
        //한번에 10개문서를 5회 돈다.
        while (true) {
            key = 4; //현 키워드 결과 첫 검색결과 노드의 child가 4부터 시작하게 되어있음.
            while (key < 14) { //ISSUE 1 : 원래 key의 범위는 4 < 14 여야하는데 7개까지 다운받고 timedout 3000ms 에러발생 => 11번째부터 pdf버튼의 위치가 바뀌었기 때문
                const isExist = await page.evaluate((key) => {
                    console.log("key is " + key);
                    const links = Array.from(document.querySelectorAll('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)'));
                    return links.map(link => link.nodeName);
                }, key); //evaluate함수에 매개변수를 undefined안되게 전달하는 방법
console.log(key + " + " + isExist);
                //3번째에 pdf 버튼이 없는 경우는 첫번째 버튼 위치에 있다.
                if (isExist == '') {
                    continue;
                    // await page.waitForSelector('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn');
                    // await page.click('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn');
                    // await key++;
                } else {
                    await page.waitForSelector('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)');
                    await page.click('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)');
                    await key++;
                }
            }
            //Going to next Page //여기도 2번페이지의 인덱스가 4부터 시작한다
            await page.waitForSelector('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
            await page.click('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
            await count++;
        }
        //   await browser.close()
    })()
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
