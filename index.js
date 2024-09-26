import puppeteer from 'puppeteer'
import fs from 'fs/promises'
const url = 'https://tr.tradingview.com/markets/stocks-turkey/market-movers-all-stocks'

const scrape = async () => {

    console.log('TradingView bağlantısı kuruluyor...') // console

    const browser = await puppeteer.launch({headless:'shell', args:['--no-sandbox']})
    const page = await browser.newPage()
    await page.goto(url, {waitUntil:'load'})    
    await page.waitForSelector('.button-SFwfC2e0')

    console.log('Bağlantı başarılı, hisseler taranıyor...') // console

    const total = await page.evaluate(()=> {
        const getTotal = document.querySelector('.tickerCellMatches-cfjBjL5J').getAttribute('data-matches')
        return getTotal
    })

    const amount = Math.floor(total / 100)
    for (let i = 0; i < amount; i++) {
        await page.click('.button-SFwfC2e0')
        await page.waitForNetworkIdle()
    }

    console.log(`${total} adet hisse bulundu...`) // console

    const bistStocks = await page.evaluate(()=> {
        const stockElements = document.querySelectorAll('.tickerName-GrtoTeat')
        return Array.from(stockElements).map((stock)=> `BIST:${stock.textContent}`)
    })
    
    console.log(`Liste oluşturuluyor...`) // console

    await fs
    .writeFile("bist-stocks.txt", bistStocks.join("\r\n"))
    .then(console.log(`${bistStocks.length} adet hisse ile BIST listesi oluşturuldu ✅`)) // console

    await browser.close()
}

scrape()

