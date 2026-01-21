
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CoffeeBagScroll } from './components/ui/coffee-bag-scroll';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const COFFEE_IMAGE = "https://yhzcreazvumaxvimbnyi.supabase.co/storage/v1/object/public/Videos%20URLS/ChatGPT%20Image%2019%20ene%202026,%2005_21_14%20p.m..png";
  const FINAL_VIDEO = "https://yhzcreazvumaxvimbnyi.supabase.co/storage/v1/object/public/Videos%20URLS/_prompt_create_202601201959_flwbk.mp4";

  return (
    <main ref={containerRef} className="bg-black text-white min-h-screen selection:bg-[#C9A24D] selection:text-black overflow-x-hidden">
      
      {/* Introduction Flow */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 flex flex-col items-center">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[#C9A24D] tracking-[0.3em] uppercase text-sm mb-4 font-light"
        >
          El Ritual de la Energía Pura
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="text-5xl md:text-8xl text-center leading-tight mb-8"
        >
          ORIGEN CAFÉ <br />
          <span className="text-[#C9A24D]">ISMERELY</span>
        </motion.h1>
        <motion.div 
          className="h-px w-24 bg-[#C9A24D] mb-12"
          initial={{ width: 0 }}
          whileInView={{ width: 96 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="max-w-2xl text-center text-gray-400 font-light leading-relaxed md:text-xl"
        >
          Un blend premium diseñado para elevar tu bienestar. Más que una bebida, es la esencia de la tierra transformada en vitalidad y equilibrio para tu cuerpo.
        </motion.p>
      </div>

      {/* New Coffee Bag Scroll Animation Section */}
      <CoffeeBagScroll
        imageSrc={COFFEE_IMAGE}
        titleComponent={
          <div className="flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              LA <span className="text-[#C9A24D]">EXPERIENCIA</span> SENSORIAL
            </h2>
            <div className="h-px w-16 bg-[#C9A24D]/30 mb-6" />
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base px-4">
              Cada grano cuenta una historia de origen, seleccionados bajo los estándares más altos de pureza y ética.
            </p>
          </div>
        }
      />

      {/* Benefits Content - Continuous Scroll Flow */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-[#C9A24D] text-3xl mb-6 font-bold tracking-tight">Beneficios que Elevan</h3>
            <ul className="space-y-8">
              <li className="flex gap-4">
                <span className="text-[#C9A24D] text-xl font-bold">01</span>
                <div>
                  <h4 className="font-bold text-lg mb-1 italic">ENERGÍA SOSTENIDA</h4>
                  <p className="text-gray-400 font-light text-sm">Vitalidad natural sin los picos de ansiedad del café comercial.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-[#C9A24D] text-xl font-bold">02</span>
                <div>
                  <h4 className="font-bold text-lg mb-1 italic">ENFOQUE MENTAL</h4>
                  <p className="text-gray-400 font-light text-sm">Mejora la claridad cognitiva y la concentración en tus tareas diarias.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-[#C9A24D] text-xl font-bold">03</span>
                <div>
                  <h4 className="font-bold text-lg mb-1 italic">LUJO SALUDABLE</h4>
                  <p className="text-gray-400 font-light text-sm">Un sabor exquisito que cuida tu sistema digestivo y metabólico.</p>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative h-[400px] w-full border border-[#C9A24D]/30 rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://picsum.photos/id/425/800/800" 
              className="w-full h-full object-cover grayscale brightness-[0.3]" 
              alt="Grano de café detalle" 
            />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center bg-black/40 backdrop-blur-[2px]">
              <p className="text-[#C9A24D] text-xl md:text-2xl font-light italic leading-relaxed">
                "La pureza de Ismerely se siente en cada sorbo. Un tributo a la excelencia cafetalera."
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ingredientes Clave Section */}
      <div className="max-w-6xl mx-auto px-6 py-24 border-t border-[#C9A24D]/10">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[#C9A24D] text-3xl md:text-4xl text-center mb-16 font-bold"
        >
          Ingredientes clave (y por qué importan)
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {[
            { title: "Cereza de café orgánico", desc: "Base alcalina y antioxidante, suave con el estómago." },
            { title: "Ganoderma (Reishi)", desc: "Fortalece el sistema inmune, desintoxica y promueve longevidad." },
            { title: "Chaga", desc: "Poderoso antioxidante que protege las células y el hígado." },
            { title: "Té verde", desc: "Favorece la concentración, controla la glucosa y es termogénico." },
            { title: "L-Carnitina", desc: "Estimula el metabolismo y la quema de grasa." }
          ].map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border-l-2 border-[#C9A24D]/40 pl-6 py-2"
            >
              <h4 className="text-[#C9A24D] font-bold text-lg mb-2 uppercase tracking-wide">{item.title}</h4>
              <p className="text-gray-400 text-sm md:text-base font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final informational area - Still continuous flow */}
      <div className="bg-[#0a0a0a] py-32 border-t border-[#C9A24D]/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            <h2 className="text-[#C9A24D] text-4xl mb-12 font-bold uppercase tracking-widest">Cómo comprar</h2>
            <div className="space-y-6 text-gray-300">
              <p className="text-xl font-light">
                Para adquirir Origen Café o recibir más información, escríbenos por WhatsApp o llamada al 7292238610.
              </p>
              <div className="py-8">
                <p className="text-sm tracking-widest text-gray-500 uppercase mb-2 font-medium">Contacto Directo</p>
                <p className="text-4xl md:text-5xl font-bold text-white tracking-tighter">7292238610</p>
              </div>
              <p className="text-sm text-[#C9A24D]/60 max-w-md mx-auto italic">
                Disponible para entrega a domicilio y puntos de venta seleccionados en todo el país.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Final Product Video block */}
      <div className="bg-black py-24 border-t border-[#C9A24D]/5">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <motion.h4 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[#C9A24D] text-sm uppercase tracking-[0.4em] mb-8 text-center font-bold"
          >
            Video del producto
          </motion.h4>
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="w-full relative rounded-2xl overflow-hidden border border-[#C9A24D]/20 shadow-[0_0_50px_rgba(201,162,77,0.1)] bg-black"
          >
            <video 
              src={FINAL_VIDEO}
              controls
              muted
              playsInline
              preload="metadata"
              className="w-full aspect-video object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Minimal Footer Signature */}
      <footer className="py-12 px-6 flex flex-col items-center gap-4 text-center border-t border-[#C9A24D]/5 bg-black">
        <div className="text-[#C9A24D] font-bold text-xl tracking-widest">ISMERELY</div>
        <p className="text-gray-600 text-xs tracking-widest font-light">© 2026 ORIGEN CAFÉ - ELITE WELLNESS COLLECTION</p>
      </footer>
    </main>
  );
};

export default App;
