import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, ShieldCheck, ArrowLeft, RefreshCcw, Camera, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMobile } from '../context/MobileContext';

const Scanner = () => {
  const { verifyBinAndReward } = useMobile();
  const [isScanning, setIsScanning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('Household Garbage');
  const [scannedBinId, setScannedBinId] = useState('');

  const simulateScan = () => {
    setIsScanning(true);
    setHasResult(false);
    
    // Choose a random bin ID
    const randomId = `BIN-${Math.floor(1000 + Math.random() * 9000)}`;
    setScannedBinId(randomId);

    setTimeout(() => {
      setIsScanning(false);
      setHasResult(true);
      
      const weights = { 
        'Household Garbage': '4.2kg', 
        'Plastic & Bottles': '2.1kg', 
        'Paper & Cardboard': '1.5kg', 
        'Large Bulky Waste': '8.5kg' 
      };
      const pointRewards = { 
        'Household Garbage': 30, 
        'Plastic & Bottles': 45, 
        'Paper & Cardboard': 25, 
        'Large Bulky Waste': 50 
      };

      verifyBinAndReward(
        randomId, 
        pointRewards[selectedMaterial], 
        selectedMaterial, 
        weights[selectedMaterial]
      );
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-[72vh] px-4 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500 bg-slate-50">
      
      <header className="mb-6 flex items-center gap-3.5 pt-4">
        <Link to="/dashboard" className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Verifications</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">QR Smart Scanner</h1>
        </div>
      </header>

      <div className="flex-grow flex flex-col justify-center">
        {isScanning && (
          <div className="space-y-6 flex flex-col items-center">
            {/* Viewfinder simulation */}
            <div className="relative w-64 h-64 bg-slate-900 rounded-[32px] overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
              
              <div className="absolute inset-0 opacity-[0.2] flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-[10px] border-emerald-500 border-dashed animate-spin" />
              </div>

              {/* Viewfinder corners */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />

              <QrCode className="w-24 h-24 text-emerald-500/20" />
              
              {/* Scan laser line */}
              <div className="absolute left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{
                animation: 'scanLaser 2s linear infinite'
              }} />
            </div>
            
            <div className="text-center space-y-2 max-w-[280px]">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-500 font-bold uppercase tracking-wider animate-pulse">
                <Camera className="w-4 h-4 animate-bounce" />
                <span>Scanning Smart Bin...</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Aim your device camera at the QR code attached on the front panel of the Eco Smart Bin.
              </p>
            </div>
          </div>
        )}

        {hasResult && !isScanning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-100/60 rounded-full animate-ping opacity-60" />
              <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Disposal Verified!</h2>
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 max-w-[320px] mx-auto text-left space-y-2 shadow-sm">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Smart Bin ID</span>
                  <span className="text-slate-700 font-bold">{scannedBinId}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Waste Category</span>
                  <span className="text-slate-700 font-bold">{selectedMaterial}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-100">
                  <span className="text-slate-400 font-semibold">Points Rewarded</span>
                  <span className="text-emerald-600 font-bold">
                    +{selectedMaterial === 'Household Garbage' ? 30 : selectedMaterial === 'Plastic & Bottles' ? 45 : selectedMaterial === 'Paper & Cardboard' ? 25 : 50} pts
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setHasResult(false); }}
              className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              Scan Another Bin
            </button>
          </motion.div>
        )}

        {!isScanning && !hasResult && (
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Info className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-xs.5 uppercase tracking-wider text-slate-800">Select Waste Type</h3>
              </div>
              
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Select the type of waste you are disposing of before scanning the QR code on the smart bin.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: 'Household Garbage', desc: 'General Trash', color: 'text-slate-700' },
                  { name: 'Plastic & Bottles', desc: 'Containers/Cans', color: 'text-blue-700' },
                  { name: 'Paper & Cardboard', desc: 'Boxes/Cups', color: 'text-amber-700' },
                  { name: 'Large Bulky Waste', desc: 'Furniture/Metal', color: 'text-red-700' },
                ].map((mat) => (
                  <button
                    key={mat.name}
                    onClick={() => setSelectedMaterial(mat.name)}
                    className={`p-3.5 border rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between min-h-[75px] ${selectedMaterial === mat.name ? 'border-emerald-500 bg-emerald-50/10 shadow-sm' : 'border-slate-200 bg-white'}`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-wider ${selectedMaterial === mat.name ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {mat.name}
                    </span>
                    <span className="text-[10px] text-slate-700 font-bold mt-1">{mat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
              <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Eco Bins contain built-in weight sensors to verify waste disposal and ensure correct trash category placement.
              </p>
            </div>

            <button 
              onClick={simulateScan}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white rounded-xl"
            >
              <Camera className="w-5 h-5" />
              Open Camera to Scan Bin
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
