import React, { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { storeLocations, getOrderedStores } from '../config/storeConfig';

// Mapa com todas as unidades; alterna sozinho até a pessoa escolher uma
const LocationMap = () => {
  const orderedStores = useMemo(getOrderedStores, []);
  const [selectedLocation, setSelectedLocation] = useState(orderedStores[0].id); // Marumbi 1 como padrão
  const [autoCycle, setAutoCycle] = useState(true);

  useEffect(() => {
    if (!autoCycle || orderedStores.length < 2) return;
    const interval = setInterval(() => {
      setSelectedLocation(prev => {
        const currentIndex = orderedStores.findIndex(store => store.id === prev);
        return orderedStores[(currentIndex + 1) % orderedStores.length].id;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [autoCycle, orderedStores]);

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location);
    setAutoCycle(false);
  };

  const selecionada = storeLocations[selectedLocation];

  return (
    <section className="py-10 md:py-14">
      <div className="butcher-container">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-3">
            <div className="relative h-72 sm:h-96 lg:h-full lg:min-h-[440px] overflow-hidden rounded-xl border border-border bg-muted shadow-md">
              <iframe
                src={selecionada.embedUrl}
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa da unidade ${selecionada.displayName}`}
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="h-full rounded-xl border border-border bg-card p-5 md:p-7 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-card-foreground mb-5">
                {orderedStores.length > 1 ? 'Nossas unidades' : 'Endereço'}
              </h2>

              <div className="space-y-3">
                {orderedStores.map(store => {
                  const ativa = selectedLocation === store.id;
                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => handleLocationClick(store.id)}
                      aria-pressed={ativa}
                      className={`w-full flex items-start text-left p-3.5 rounded-lg border transition-colors duration-200 ${
                        ativa
                          ? 'border-gold-400 bg-gold-50 dark:border-gold-500/60 dark:bg-gold-500/10'
                          : 'border-transparent hover:bg-muted'
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 mt-0.5 shrink-0 ${ativa ? 'text-gold-600 dark:text-gold-400' : 'text-muted-foreground'}`}
                      />
                      <span className="ml-3 min-w-0">
                        <span className="block font-bold text-card-foreground">{store.title}</span>
                        <span className="block font-medium text-muted-foreground">{store.address1}</span>
                        <span className="block font-medium text-muted-foreground">{store.address2}</span>
                        <span className="block font-medium text-muted-foreground">{store.cep}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <a
                href={selecionada.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full block text-center px-6 py-3 rounded-md bg-gold-500 text-black font-semibold hover:bg-gold-400 transition-colors"
              >
                Como chegar na {selecionada.displayName}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
