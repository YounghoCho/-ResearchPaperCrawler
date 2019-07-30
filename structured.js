/*
    Date : 2019-07-31
 */
const xlsx = require('xlsx');
const fs = require('fs');

const url = 'http://koreascience.or.kr/search.page?keywords=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5';
const obj = {
    journalTitle : '', journalTitleElement : '#articel-view > div > div.row.article-info.article-second > div.col-md-11.align-self-center > h3 > a',
    yearOfPublication : '', yearOfPublicationElement : '#articel-view > div > div.row.article-info.article-second > div.col-md-11.align-self-center > ul > li:nth-child(5)',
    publisher : '', publisherElement : '#articel-view > div > div.row.article-info.article-second > div.col-md-11.align-self-center > a',
    titleOfThesis : '', titleOfThesisElement : '#articel-view > div > div:nth-child(2) > div > h1.h2',
    author : '', authorElement : '#articel-view > div > div:nth-child(2) > div > ul.list-inline.g-color-gray-dark-v2.mb0 > li',
    abstract : '', abstractElement : '#articel-view > div > div:nth-child(4) > div > p',
    keyword : '', keywordElement : '#articel-view > div > div:nth-child(5) > div > p'
}
const arrayForCsv = [
    // ["journalTitle", "yearOfPublication", "publisher", "titleOfThesis", "author", "abstract", "keyword"] //header값이 없으면 문자열이 단어 한 개 씩으로 쪼개져서 들어감
    ["journalTitle, yearOfPublication, publisher, titleOfThesis, author, abstract, keyword"] //header값이 없으면 문자열이 단어 한 개 씩으로 쪼개져서 들어감
];

const puppeteer = require('puppeteer');
puppeteer.launch().then(async browser => {
    (async () => {
        // const browser = await puppeteer.launch({headless: false}); //open browser
        const browser = await puppeteer.launch() // for test
        log("크롤러 시작");
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation();
        await page.goto(url);
        await page.setViewport({width: 1440, height: 716});
        //언어 설정
        await page.waitForSelector('.navbar #chooseLanguageDropdownMenuLink');
        await page.click('.navbar #chooseLanguageDropdownMenuLink');
        await page.waitForSelector('.container > .navbar-nav > .nav-item > .dropdown-menu > .dropdown-item:nth-child(1)');
        await page.click('.container > .navbar-nav > .nav-item > .dropdown-menu > .dropdown-item:nth-child(1)');
        await navigationPromise;
        log("방문 완료");

        //노드선택
        let key, count = 4, i = 1;
        // while (count <   9) {
        log("============" + i + "차 싸이클===========");
        i++;
        key = 4;
        // while (key < 14) {
        while (key < 7) {
            //노드에 접속
            await page.waitForSelector('.row > #search-result > .srched-box:nth-child('+key+') > .h4 > .u-link-v5')
            await page.click('.row > #search-result > .srched-box:nth-child('+key+') > .h4 > .u-link-v5')
            navigationPromise;
            log("접속 완료");

            await sleep(4000);

            //데이터 추출
            obj.journalTitle = await page.evaluate((obj) => {
                const links = Array.from(document.querySelectorAll(obj.journalTitleElement));
                return links.map(link => link.textContent.trim().replace(/\s+\(([A-Z]|[a-z]|\s)+\)/g,''));
            }, obj);
            obj.yearOfPublication = await page.evaluate((obj) => {
                const links = Array.from(document.querySelectorAll(obj.yearOfPublicationElement));
                return links.map(link => link.textContent.trim());
            }, obj);
            obj.publisher = await page.evaluate((obj) => {
                const links = Array.from(document.querySelectorAll(obj.publisherElement));
                return links.map(link => link.textContent.trim().replace(/\s+\(([A-Z]|[a-z]|\s)+\)/g,'')   );
            }, obj);
            obj.titleOfThesis = await page.evaluate((obj) => {
                const links = Array.from(document.querySelectorAll(obj.titleOfThesisElement));
                return links.map(link => link.textContent.trim());
            }, obj);
            obj.author = await page.evaluate((obj) => {
                const links = Array.from(document.querySelectorAll(obj.authorElement));
                return links.map(link => link.textContent.trim().replace(/\s+|\;/g,''));
            }, obj);
            obj.abstract = await page.evaluate((obj) => {
                const links = Array.from(document.querySelectorAll(obj.abstractElement));
                return links.map(link => link.textContent.trim());
            }, obj);
            obj.keyword = await page.evaluate((obj) => {
                const links = Array.from(document.querySelectorAll(obj.keywordElement));
                return links.map(link => link.textContent.trim().replace(';',','));
            }, obj);

            console.log("journalTitle : " + obj.journalTitle + "\n" +
                "yearOfPublication : " + obj.yearOfPublication + "\n" +
                "publisher : " + obj.publisher + "\n" +
                "titleOfThesis : " + obj.titleOfThesis + "\n" +
                "author : " + obj.author + "\n" +
                "abstract : " + obj.abstract + "\n" +
                "keyword : " + obj.keyword + "\n"
            );
            let temp = obj.journalTitle + "," + obj.yearOfPublication + "," + obj.publisher + "," + obj.titleOfThesis + "," + obj.author + "," + obj.abstract + "," + obj.keyword;
            arrayForCsv.push([temp]);//[]로 한번 감싸줘야 csv 만들때 배열구조가 안깨진다.
            key++;
            //뒤로가기
            await page.goBack();
            await navigationPromise;
        } //inner while

        saveCsv(arrayForCsv);

        // } //outer while
        for (let i in arrayForCsv) {
            log(arrayForCsv[i] + "\n");
        }
        await browser.close();
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
function saveCsv(arrayForCsv){  //https://code0xff.tistory.com/127
    const workSheet = xlsx.utils.json_to_sheet(arrayForCsv);
    const stream = xlsx.stream.to_csv(workSheet);
    stream.pipe(fs.createWriteStream('/Users/joyoungho/Desktop/test.csv'));
    log("파일 쓰기 완료");
}