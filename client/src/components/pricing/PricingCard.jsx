import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingCard = ({ plan }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`bg-white rounded-3xl p-8 shadow-xl border ${plan.popular ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-slate-100'} flex flex-col h-full relative`}
        >
            {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    Most Popular
                </div>
            )}

            <div className="mb-8 border-b border-slate-100 pb-8 text-center mt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-4 text-primary">
                    {plan.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.title}</h3>
                <p className="text-slate-500 text-sm h-10">{plan.description}</p>

                <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 font-medium">{plan.period}</span>
                </div>
            </div>

            <div className="flex-grow">
                <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-slate-700 text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <a
                href={`https://wa.me/919088260058?text=I'm%20interested%20in%20the%20${encodeURIComponent(plan.title)}%20plan.`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
            >
                {plan.button}
            </a>
        </motion.div>
    );
};

export default PricingCard;
