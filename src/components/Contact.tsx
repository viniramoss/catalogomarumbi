import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { getOrderedStores } from '../config/storeConfig';

// Telefone e horário de todas as unidades do site
const Contact = () => {
  const lojas = getOrderedStores();
  return (
    <section className="py-10 md:py-14">
      <div className={`butcher-container ${lojas.length > 1 ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className={`grid gap-4 md:gap-6 ${lojas.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {lojas.map(store => (
            <div key={store.id} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500 text-black">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-xl font-bold text-card-foreground">{store.title}</h2>
                  <a
                    href={`tel:${store.whatsappNumber}`}
                    className="font-semibold text-card-foreground/90 hover:text-gold-700 dark:hover:text-gold-400 transition-colors"
                  >
                    {store.phone}
                  </a>
                </div>
              </div>

              <dl className="mt-5 space-y-2">
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                  <dt className="font-semibold text-muted-foreground">Segunda a sábado</dt>
                  <dd className="font-bold text-gold-800 dark:text-gold-400 whitespace-nowrap">{store.hours.weekdays}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-semibold text-muted-foreground">Domingo</dt>
                  <dd className="font-bold text-gold-800 dark:text-gold-400 whitespace-nowrap">{store.hours.sunday}</dd>
                </div>
              </dl>

              <a
                href={store.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <MessageCircle size={18} />
                Chamar no WhatsApp
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
