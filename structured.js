/*
    Date : 2019-07-31
 */
const xlsx = require('xlsx');
const fs = require('fs');
const time = new Date();

const url = 'http://koreascience.or.kr/search.page?keywords=%EB%B9%85%EB%8D%B0%EC%9D%B4%ED%84%B0&lang=ko&pageNo=27';
// const url = 'http://koreascience.or.kr/search.page?keywords=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5&pageSize=10&pageNo=9&lang=ko';

const obj = {
    journalTitle : '', journalTitleElement : '#articel-view > div > div.row.article-info.article-second > div.col-md-11.align-self-center > h3 > a',
    yearOfPublication : '', yearOfPublicationElement : '#articel-view > div > div.row.article-info.article-second > div.col-md-11.align-self-center > ul > li:nth-child(5)',
    publisher : '', publisherElement : '#articel-view > div > div.row.article-info.article-second > div.col-md-11.align-self-center > a',
    titleOfThesis : '', titleOfThesisElement : '#articel-view > div > div:nth-child(2) > div > h1.h2',
    author : '', authorElement : '#articel-view > div > div:nth-child(2) > div > ul.list-inline.g-color-gray-dark-v2.mb0 > li',
    abstract : '', abstractElement : '#articel-view > div > div:nth-child(4) > div > p',
    keyword : '', keywordElement : '#articel-view > div > div:nth-child(5) > div > p',
    fileName : ''
}
const jsonArray = new Array();  //https://blog.shovelman.dev/794

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
        while (count <   9) {
            log("============" + i + "차 싸이클===========");
            i++;
            key = 4;
            while (key < 13) {
                //노드에 접속
                await page.waitForSelector('.row > #search-result > .srched-box:nth-child('+key+') > .h4 > .u-link-v5')
                await page.click('.row > #search-result > .srched-box:nth-child('+key+') > .h4 > .u-link-v5')
                await navigationPromise;
                log("접속 완료");

                await sleep(5000);

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

                //마지막 컬럼에 파일명 추가
                obj.fileName = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('#articel-view > div > div:nth-child(2) > div > h1'));
                    return links.map(link => link.textContent.trim().replace(/\s/g, '_'));
                });
                let pos = obj.fileName.toString().indexOf(',');
                let tempstr = obj.fileName.toString();
                if (pos){
                    obj.fileName = tempstr.substr(pos+1, tempstr.length);   //영문
                }
                else {
                    obj.fileName = tempstr.substr(0, pos);  //국문
                }
                obj.fileName += ".pdf";
                console.log("journalTitle : " + obj.journalTitle + "\n" +
                    "yearOfPublication : " + obj.yearOfPublication + "\n" +
                    "publisher : " + obj.publisher + "\n" +
                    "titleOfThesis : " + obj.titleOfThesis + "\n" +
                    "author : " + obj.author + "\n" +
                    "abstract : " + obj.abstract + "\n" +
                    "keyword : " + obj.keyword + "\n"
                );

                //json 입력
                const json = new Object();
                json.journalTitle = obj.journalTitle.toString();
                json.yearOfPublication = obj.yearOfPublication.toString();
                json.publisher = obj.publisher.toString();
                json.titleOfThesis = obj.titleOfThesis.toString();
                json.author = obj.author.toString();
                json.abstract = obj.abstract.toString();
                json.keyword = obj.keyword.toString();
                json.fileName = obj.fileName.toString();
                jsonArray.push(json);

                key++;
                //뒤로가기
                await page.goBack();
                await navigationPromise;
            } //inner while

            //중간 저장
            await sleep (1000);
            saveCsv(jsonArray, time.getTime());

            //go to next pagea
            sleep(1000);
            log("다음 페이지로..");
            await page.waitForSelector('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
            await page.click('#search-result > .g-mb-100 > .list-inline > .list-inline-item:nth-child(' + count + ') > .u-pagination-v1__item');
            count++;

            if (count >= 9) {
                count = 4; //마지막 페이지가 8임을 감안해서 위의 반복문으로 다시 돌아가기 위한 작업.
            }

        } //outer while
        await browser.close();
    })()
});

async function sleep(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}
function log(string){
    console.log(string);
}
function saveCsv(jsonArray, time){  //https://code0xff.tistory.com/127
    const workSheet = xlsx.utils.json_to_sheet(jsonArray);
    const stream = xlsx.stream.to_csv(workSheet);
    stream.pipe(fs.createWriteStream('/Users/joyoungho/Desktop/structured_'+ time + '.csv'));
    log("파일 쓰기 완료");
}