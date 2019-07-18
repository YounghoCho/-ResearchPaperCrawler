const keywords = ["인공지능", "머신러닝"];

const puppeteer = require('puppeteer');
puppeteer.launch().then(async browser => {
    (async () => {

        let lengthOfKeywords = keywords.length, startPoint = 0;
        while(startPoint < lengthOfKeywords) {

            const browser = await puppeteer.launch({headless: false}); //open browser
            // const browser = await puppeteer.launch() // for test
            log("크롤러 시작");
            const page = await browser.newPage();
            const navigationPromise = page.waitForNavigation();
            await page.goto('http://koreascience.or.kr/search.page?keywords=' + keywords[startPoint]);
            await page.setViewport({width: 1440, height: 716});
            startPoint++;

            //set language
            await page.waitForSelector('.navbar #chooseLanguageDropdownMenuLink');
            await page.click('.navbar #chooseLanguageDropdownMenuLink');
            await page.waitForSelector('.container > .navbar-nav > .nav-item > .dropdown-menu > .dropdown-item:nth-child(1)');
            await page.click('.container > .navbar-nav > .nav-item > .dropdown-menu > .dropdown-item:nth-child(1)');
            await navigationPromise;
            log("방문 완료");

            let key = 4, count = 4, i = 1;
            while (count < 5) {  //N번째 page까지 반복한다(2페이지 버튼의 index is 4)
                log("============" + i + "차 싸이클===========");
                i++;
                key = 4; //초기화 : 검색 결과의 첫 자식노드의 index is 4
                while (key < 14) { //ERROR 1 : timedout 3000ms => puppeteer는 페이지가 30초이상 응답없으면 에러다. 원인은, 특정위치의 버튼을 누르라고 했는데 버튼이 없었기 때문이다.
                    await sleep(1000);
                    //ERROR 2 : evaluate에서 얻은 isExist 값이 일정하지 않다 => 동기화가 안되서? => await로 선언되있잖아 => 그럼뭐지? => 페이지가 안떴는데 evaluate가 동작해서 그래 => sleep으로 해결
                    const isExist = await page.evaluate((key) => {
                        const links = Array.from(document.querySelectorAll('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)'));
                        console.log("뭐야대체 : " + links.nodeName);
                        return links.map(link => link.nodeName);
                    }, key); //ERROR 3 : 동적 함수에 key 값이 전달되지 않고 undefined로 뜸 => 전달하는 방법은 맨뒤에 key를 싣어보냄(공식 페이지 참고)
                    log("key is : " + (key - 3) + "\nEle is : " + isExist);

                    //PDF다운 버튼 위치 : 첫번쨰 혹은 세번쨰
                    if (isExist == '') {
                        // await page.waitForSelector('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn');
                        // await page.click('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn');
                        key++;
                    } else {
                        // await page.waitForSelector('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)');
                        // await page.click('.srched-box:nth-child(' + key + ') > .d-lg-flex > .list-unstyled > .list-item > .clear > .btn:nth-child(3)');
                        key++;
                    }
                }

                //go to next page
                if (count > 9) count = 4;
                else {
                    log("다음 페이지로..");
                    await page.waitForSelector('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
                    await page.click('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
                    count++;
                } //end LOOP1 : 10 contents
            } //end LOOP2 : pages
            await browser.close();
        } //end LOOP3 : keywords
    })()
});
function sleep(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}
function log(string){
    console.log(string);
}