import { NextResponse } from "next/server"

// Configuración condicional para diferentes entornos
async function getBrowser() {
  if (process.env.VERCEL) {
    // En producción (Vercel), usar puppeteer-core con Chromium remoto
    const puppeteerCore = await import("puppeteer-core")
    const chromium = await import("@sparticuz/chromium-min")

    return await puppeteerCore.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar",
      ),
      headless: chromium.default.headless,
    })
  } else {
    // En desarrollo local, usar puppeteer normal
    const puppeteer = await import("puppeteer")
    return await puppeteer.default.launch({
      headless: "new",
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      ignoreHTTPSErrors: true,
    })
  }
}

export async function GET() {
  let browser

  try {
    console.log("Iniciando scraping con Puppeteer...")

    browser = await getBrowser()
    const page = await browser.newPage()

    // Configurar user agent y viewport
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    )
    await page.setViewport({ width: 1280, height: 800 })

    console.log("Navegando a BCV...")
    await page.goto("https://www.bcv.org.ve/")

    console.log("Extrayendo valor del dólar...")
    const valorDolar = await page.evaluate(() => {
      // Método 1: Buscar span con "USD" y obtener el strong del mismo row
      const usdSpan = Array.from(document.querySelectorAll("span")).find((el) => el.textContent?.trim() === "USD")

      if (usdSpan) {
        const strongElement = usdSpan.closest(".row")?.querySelector("strong")
        if (strongElement) {
          return strongElement.textContent?.trim()
        }
      }

      // Método 2: Buscar directamente en el div con id="dolar"
      const dollarDiv = document.querySelector("#dolar")
      if (dollarDiv) {
        const strongElement = dollarDiv.querySelector("strong")
        if (strongElement) {
          return strongElement.textContent?.trim()
        }
      }

      // Método 3: Buscar patrones de números que parezcan tasas de cambio
      const allStrongs = document.querySelectorAll("strong")
      for (const strong of allStrongs) {
        const text = strong.textContent?.trim()
        if (text && /^\d{1,3}[,.]?\d{2,8}$/.test(text.replace(/\s/g, ""))) {
          const rate = Number.parseFloat(text.replace(",", "."))
          if (rate > 10 && rate < 200) {
            return text
          }
        }
      }

      return null
    })

    console.log("Valor extraído:", valorDolar)

    if (!valorDolar) {
      throw new Error("No se pudo encontrar el valor del dólar en la página")
    }

    // Limpiar y convertir el valor
    const valorLimpio = valorDolar.replace(/[^\d,.]/g, "").replace(",", ".")
    const valorNumerico = Number.parseFloat(valorLimpio)

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      throw new Error("Valor del dólar inválido")
    }

    // Formatear fecha
    const currentDate = new Date()
    const lastUpdate = currentDate.toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    console.log("Éxito! Tasa encontrada:", valorNumerico)

    return NextResponse.json({
      rate: valorNumerico,
      lastUpdate: lastUpdate,
      source: "BCV",
      timestamp: currentDate.toISOString(),
      success: true,
    })
  } catch (error) {
    console.error("Error en scraping BCV:", error)

    return NextResponse.json(
      {
        error: "No se pudo obtener la información del BCV",
        details: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      },
      { status: 500 },
    )
  } finally {
    if (browser) {
      await browser.close()
      console.log("Browser cerrado")
    }
  }
}
