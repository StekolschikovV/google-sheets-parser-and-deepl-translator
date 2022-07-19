import axios from "axios";
import Translator from "./translator";
import {DeeplLanguages} from "deepl";


const translator = new Translator()

class Table {

  readonly deeplLanguagesList: string[] = ['BG', 'CS', 'DA', 'DE', 'EL', 'EN-GB', 'EN-US', 'EN', 'ES', 'ET', 'FI', 'FR', 'HU', 'IT', 'JA', 'LT', 'LV', 'NL', 'PL', 'PT-PT', 'PT-BR', 'PT', 'RO', 'RU', 'SK', 'SL', 'SV', 'ZH']
  readonly noLangConst = "NOT_ON_THE_LIST"
  allRows: string[][] = [] // [row][col]

  public generateObj = async () => {
    let result: any[] = []
    let rowIndex = 0
    let rawData: {
      code: string,
      lang: string,
      text: string
    }[] = []

    for await (const row of this.allRows) {
      const rowCode = row[0]
      let colIndex = 0
      for await (const colValue of row) {
        const colLang = this.allRows[0][colIndex].replace(this.noLangConst, "")
        const idNotOnTheList = this.allRows[0][colIndex].includes(this.noLangConst)
        if (colIndex > 0) {
          let value = colValue
          if (idNotOnTheList && colValue.length === 0) {
            value = this.getEnTranslationsByCode(rowCode)
          }
          if (!idNotOnTheList && colValue.length === 0) {
            value = this.getEnTranslationsByCode(rowCode)
            value = await translator.translate({
              originText: value,
              toLang: colLang as DeeplLanguages
            })
          }
          rawData.push({
            code: rowCode,
            lang: colLang,
            text: value.trim(),
          })
        }
        colIndex++
      }
      rowIndex++
    }

    let langsRaw: string[] = []
    rawData.forEach(row => {
      langsRaw.push(row.lang)
    })
    // @ts-ignore
    const uniqueLangs = [...new Set(langsRaw)];
    uniqueLangs.forEach(lang => {
      let obj: any = {}
      rawData.forEach(row => {
        if (row.lang === lang) {
          const rowCodeArr = row.code.split('.')
          if (rowCodeArr.length === 1) {
            const c = rowCodeArr[0]
            if (c === 'code') obj[c] = row.text.replace(this.noLangConst, "")
            else obj[c] = row.text
          } else {
            const c1 = rowCodeArr[0]
            const c2 = rowCodeArr[1]
            if (!obj.hasOwnProperty(c1)) {
              obj[c1] = {}
            }
            obj[c1][c2] = row.text
          }
        }
      })
      result.push(obj)
    })

    return result
  }

  public getEnTranslationsByCode = (code: string) => {
    let result = ""
    this.allRows.forEach((row, index) => {
      if (row[0] === code) {
        result = this.allRows[index][1]
      }
    })
    return result
  }

  public getTable = async (url: string) => {
    const response = await axios.get(url)
    const data = response.data;
    const rm1 = "/*O_o*/\n" +
      "google.visualization.Query.setResponse("
    const rm2 = ");"
    let resultClear: string[][] = []
    let result = data
    result = result.replace(rm1, "")
    result = result.replace(rm2, "")
    const rows = JSON.parse(result).table.rows
    rows.forEach((row: any) => {
      let clearedRow: string[] = []
      row.c.forEach((c: any) => {
        clearedRow.push(c?.v || "")
      })
      resultClear.push(clearedRow)
    })
    resultClear[0].forEach((c: any, index: number) => {
      const isCode = c.includes('code')
      if (isCode) {
        resultClear[0][index] = 'code'
      } else {
        resultClear[0][index] = c.split("(")[1].split(')')[0].trim().toUpperCase()
        if (!this.deeplLanguagesList.includes(resultClear[0][index])) {
          resultClear[0][index] = this.noLangConst + resultClear[0][index]
        }
      }
    })
    this.allRows = resultClear
    return this.allRows
  }

}

export default Table
