//에러 : 첫번째 문서가 자꾸 tag값이 null로 나와서.. continue 넣어놓음.
console.log("프로그램 시작");
const keywords = ["인공지능"];

const puppeteer = require('puppeteer');
puppeteer.launch().then(async browser => {
    (async () => {
        const browser = await puppeteer.launch({headless: false}) //open browser
        // const browser = await puppeteer.launch()
        console.log("크롤러 시작");
        const page = await browser.newPage()
        //visit
        const navigationPromise = page.waitForNavigation()
        // await page.goto('http://koreascience.or.kr/main.page?&lang=ko')
//####### while
        await page.goto('http://koreascience.or.kr/search.page?keywords=' + keywords[0]);
        await page.setViewport({width: 1440, height: 716})
        console.log("방문 완료");

        let key = 4;
        let count = 4;
        // while (true) {  //한번에 10개문서를 5회 돈다.
        while (count < 7) {  //한번에 10개문서를 5회 돈다.
            console.log("============싸이클===========");
            key = 4; //현 키워드 결과 첫 검색결과 노드의 child가 4부터 시작하게 되어있음.
            while (key < 14) { //ISSUE 1 : 원래 key의 범위는 4 < 14 여야하는데 7개까지 다운받고 timedout 3000ms 에러발생 => 11번째부터 pdf버튼의 위치가 바뀌었기 때문
                const isExist = await page.evaluate((key) => {
                    const links = Array.from(document.querySelectorAll('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)'));
                    return links.map(link => link.nodeName);
                }, key); //evaluate함수에 매개변수를 undefined안되게 전달하는 방법
            console.log("key is : " + key + "\nelement is : " + isExist);
                //3번째에 pdf 버튼이 없는 경우는 첫번째 버튼 위치에 있다.
                if (isExist == '') {
//                    continue;
                    // await page.waitForSelector('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn');
                    // await page.click('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn');
                    key++;
                } else {
                    // await page.waitForSelector('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)');
                    // await page.click('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)');
                    key++;
                }
            }
            console.log("마지막 key is " + key);
            //Going to next Page //여기도 2번페이지의 인덱스가 4부터 시작한다
            console.log("count is : " + count);
            if (count > 9)
                count = 4;
            else {
                console.log("버튼 누르기");
                await page.waitForSelector('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
                await page.click('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
                count++;
            }
        }
        //   await browser.close()
    })()
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
