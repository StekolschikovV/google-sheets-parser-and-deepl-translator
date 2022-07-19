import deepl from 'deepl'
import fs from 'fs'
import { DeeplLanguages } from "deepl";

export interface IText {
  originText: string;
  resultText?: string;
  toLang: DeeplLanguages;
}

const DEEPL_KEY = ""

class Translator {

  cache: IText[] = []
  cacheFileName = 'cache.json'

  constructor() {
    this.loadCache()
  }

  private loadCache = (): void => {
    if (fs.existsSync(this.cacheFileName)) {
      const fileData = fs.readFileSync(this.cacheFileName, { encoding: 'utf8', flag: 'r' })
      if (fileData) {
        this.cache = JSON.parse(fs.readFileSync(this.cacheFileName, {
          encoding: 'utf8',
          flag: 'r'
        })) as unknown as IText[]
      }
    }
  }

  private saveCache = (text: IText): void => {
    this.cache.push(text)
    fs.writeFileSync(this.cacheFileName, JSON.stringify(this.cache))
  }

  private getFromCache = (text: IText): IText | null => {
    let result: null | IText = null
    this.cache.forEach(t => {
      if (t.originText === text.originText && t.toLang === text.toLang) {
        result = t
      }
    })

    return result
  }

  public translate = async (text: IText): Promise<string> => {
    const cached = this.getFromCache(text)
    let result: null | string = null
    if (cached && cached.resultText) {
      result = cached.resultText
    }
    if (!result)
      await deepl({
        free_api: true,
        text: text.originText,
        target_lang: text.toLang,
        auth_key: DEEPL_KEY
      })
        .then(r => {
          console.log("+deepl translate", text.toLang, text.originText)
          result = r.data.translations[0].text
          this.saveCache({
            originText: text.originText,
            resultText: result as unknown as string,
            toLang: text.toLang
          })
        })
        .catch(error => {
          this.saveCache({
            originText: text.originText,
            resultText: text.originText,
            toLang: text.toLang
          })
          return text.resultText
        })
    return result || ""
  }

  public translateList = async (textList: IText[]): Promise<string[]> => {
    let result: string[] = []

    for await (const text of textList) {
      const r = await this.translate(text as IText)
      result.push(r)
    }

    return result
  }

}

export default Translator
