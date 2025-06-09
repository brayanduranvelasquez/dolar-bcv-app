"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, ArrowUpDown, Maximize2, Minimize2, RefreshCw, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface BCVData {
  rate: number;
  lastUpdate: string;
  source?: string;
}

export default function Component() {
  const [bcvData, setBcvData] = useState<BCVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usdAmount, setUsdAmount] = useState<string>("1");
  const [bsAmount, setBsAmount] = useState<string>("0");
  const [isFullPage, setIsFullPage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBCVData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await fetch("/api/bcv");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener datos");
      }

      setBcvData(data);
    } catch (err) {
      console.error("Error fetching BCV data:", err);
      setError(err instanceof Error ? err.message : "Error de conexión");
      setBcvData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBCVData();
  }, []);

  // Elimina el useEffect que convierte USD a BS automáticamente
  // Elimina la función handleBsChange actual

  // Reemplaza con estas nuevas funciones:
  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
    if (bcvData && value !== "") {
      const usd = Number.parseFloat(value) || 0;
      const convertedBs = (usd * bcvData.rate).toFixed(2);
      setBsAmount(convertedBs);
    } else {
      setBsAmount("");
    }
  };

  const handleBsChange = (value: string) => {
    setBsAmount(value);
    if (bcvData && value !== "") {
      const bs = Number.parseFloat(value) || 0;
      const convertedUsd = (bs / bcvData.rate).toFixed(2);
      setUsdAmount(convertedUsd);
    } else {
      setUsdAmount("");
    }
  };

  // Reemplaza la función swapCurrencies con:
  const swapCurrencies = () => {
    const tempUsd = usdAmount;
    const tempBs = bsAmount;
    setUsdAmount(tempBs);
    setBsAmount(tempUsd);
  };

  // Elimina el useEffect que hacía conversión automática:
  // useEffect(() => {
  //   if (bcvData && usdAmount !== "") {
  //     const usd = Number.parseFloat(usdAmount) || 0
  //     const convertedBs = (usd * bcvData.rate).toFixed(2)
  //     setBsAmount(convertedBs)
  //   } else if (usdAmount === "") {
  //     setBsAmount("")
  //   }
  // }, [usdAmount, bcvData])

  // Cambia el onChange del input USD a:
  // onChange={(e) => handleUsdChange(e.target.value)}

  // El input de BS ya usa handleBsChange correctamente

  // useEffect(() => {
  //   if (bcvData && usdAmount !== "") {
  //     const usd = Number.parseFloat(usdAmount) || 0
  //     const convertedBs = (usd * bcvData.rate).toFixed(2)
  //     setBsAmount(convertedBs)
  //   } else if (usdAmount === "") {
  //     setBsAmount("")
  //   }
  // }, [usdAmount, bcvData])

  // const handleBsChange = (value: string) => {
  //   setBsAmount(value)
  //   if (bcvData && value !== "") {
  //     const bs = Number.parseFloat(value) || 0
  //     const convertedUsd = (bs / bcvData.rate).toFixed(2)
  //     setUsdAmount(convertedUsd)
  //   } else if (value === "") {
  //     setUsdAmount("")
  //   }
  // }

  // const swapCurrencies = () => {
  //   // En lugar de intercambiar valores directamente,
  //   // intercambiamos qué moneda estamos editando
  //   const currentUsd = Number.parseFloat(usdAmount) || 0
  //   const currentBs = Number.parseFloat(bsAmount) || 0

  //   // Si actualmente tenemos USD como base, convertimos a BS como base
  //   if (currentUsd > 0) {
  //     setUsdAmount(currentBs.toString())
  //     setBsAmount(currentUsd.toString())
  //   } else {
  //     // Si tenemos BS como base, convertimos a USD como base
  //     setUsdAmount(currentBs.toString())
  //     setBsAmount(currentUsd.toString())
  //   }
  // }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            exit={{ rotate: 0 }}
            transition={{ duration: 5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <DollarSign className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 text-lg font-medium">Conectando con el BCV...</p>
            <p className="text-red-500 text-sm mt-1">Obteniendo tasa oficial</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Pantalla de error
  if (error && !bcvData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center max-w-md w-full"
        >
          <Card className="bg-black/60 border-red-500/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                className="mb-6"
              >
                <div className="relative">
                  <WifiOff className="w-12 h-12 text-red-500 mx-auto" />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="absolute -top-1 -right-1"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-xl font-bold text-white mb-3"
              >
                No se pudo conectar
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="text-red-300 mb-6 text-sm leading-relaxed"
              >
                No pudimos obtener los datos del Banco Central de Venezuela. Esto puede deberse a problemas de
                conectividad o mantenimiento del sitio web.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }}>
                <Button
                  onClick={fetchBCVData}
                  disabled={refreshing}
                  className="w-full bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  <motion.div
                    animate={refreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: refreshing ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                  </motion.div>
                  {refreshing ? "Reintentando..." : "Volver a intentar"}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-4 flex items-center justify-center gap-2 text-red-500 text-xs"
              >
                <Wifi className="w-3 h-3" />
                <span>Verifica tu conexión a internet</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Vista completa
  if (isFullPage && bcvData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900 flex items-center justify-center relative"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.2 }}>
          <Button
            onClick={() => setIsFullPage(false)}
            variant="outline"
            size="icon"
            className="absolute top-6 right-6 border-red-500 text-red-300 hover:bg-red-500/20 transition-colors duration-200"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="mb-6"
          >
            <DollarSign className="w-20 h-20 text-red-500 mx-auto mb-4" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight"
          >
            {bcvData.rate.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-2xl text-red-300 mb-3 font-light"
          >
            Bolívares por USD
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="text-red-400"
          >
            {bcvData.lastUpdate}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  // Vista principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-8 pt-8"
        >
          <motion.div
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <DollarSign className="w-12 h-12 text-red-500 mx-auto mb-3" />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Dólar BCV
          </motion.h1>
          <motion.p
            className="text-red-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            Precio oficial del Banco Central de Venezuela
          </motion.p>
        </motion.header>

        <AnimatePresence mode="wait">
          {bcvData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Precio actual */}
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "tween", duration: 0.2 }}>
                <Card className="bg-black/50 border-red-500/50 backdrop-blur-sm transition-colors duration-200 hover:border-red-400/70">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white flex items-center justify-center gap-2">
                      <DollarSign className="w-5 h-5 text-red-500" />
                      Precio Actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.005, 1] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="text-4xl md:text-5xl font-bold text-red-400 mb-3"
                    >
                      {bcvData.rate.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </motion.div>
                    <p className="text-red-300 mb-3">Bs. por USD</p>
                    <Badge variant="outline" className="border-red-500 text-red-300 mb-4">
                      {bcvData.lastUpdate}
                    </Badge>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => setIsFullPage(true)}
                        className="flex-1 bg-red-600 hover:bg-red-700 transition-colors duration-200"
                      >
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Vista Completa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Convertidor */}
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "tween", duration: 0.2 }}>
                <Card className="bg-black/50 border-red-500/50 backdrop-blur-sm transition-colors duration-200 hover:border-red-400/70">
                  <CardHeader>
                    <CardTitle className="text-white text-center">Convertidor de Divisas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="usd" className="text-red-300">
                        Dólares (USD)
                      </Label>
                      <Input
                        id="usd"
                        type="number"
                        value={usdAmount}
                        onChange={(e) => handleUsdChange(e.target.value)}
                        className="bg-black/50 border-red-500/50 text-white focus:border-red-400 transition-colors duration-200"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex justify-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "tween", duration: 0.15 }}
                      >
                        <Button
                          onClick={swapCurrencies}
                          variant="outline"
                          size="icon"
                          className="border-red-500 text-red-300  bg-red-200 hover:bg-red-500/20 transition-colors duration-200"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bs" className="text-red-300">
                        Bolívares (Bs.)
                      </Label>
                      <Input
                        id="bs"
                        type="number"
                        value={bsAmount}
                        onChange={(e) => handleBsChange(e.target.value)}
                        className="bg-black/50 border-red-500/50 text-white focus:border-red-400 transition-colors duration-200"
                        placeholder="0.00"
                      />
                    </div>

                    <Separator className="bg-red-500/30" />

                    <div className="text-center text-sm text-red-300">
                      <p>Tasa de cambio oficial BCV</p>
                      <p className="font-mono text-red-400">
                        1 USD ={" "}
                        {bcvData.rate.toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        Bs.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center mt-12 pb-8"
        >
          <p className="text-red-400 text-sm">Datos obtenidos del Banco Central de Venezuela (BCV)</p>
        </motion.footer>
      </div>
    </div>
  );
}
