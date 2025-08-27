import React from 'react';
import { Link2, Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "support@clicktracker.com",
    description: "Nous répondons sous 24h",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: MessageCircle,
    title: "Chat en Direct",
    value: "Disponible 24/7",
    description: "Réponse immédiate",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Phone,
    title: "Téléphone",
    value: "+33 1 23 45 67 89",
    description: "Lun-Ven 9h-18h",
    color: "from-purple-500 to-purple-600"
  }
];

const offices = [
  {
    city: "Paris",
    address: "123 Avenue des Champs-Élysées, 75008 Paris",
    hours: "Lun-Ven 9h-18h"
  },
  {
    city: "Lyon",
    address: "45 Rue de la République, 69002 Lyon",
    hours: "Lun-Ven 9h-18h"
  },
  {
    city: "Marseille",
    address: "78 La Canebière, 13001 Marseille",
    hours: "Lun-Ven 9h-17h"
  }
];

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="ck-contact-page min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="ck-contact-hero bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl">
              <Link2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <span className="text-2xl md:text-3xl font-bold text-white">ClickTracker</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Contactez-
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Nous
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto px-4">
            Notre équipe est là pour vous aider. Contactez-nous pour toute question, 
            suggestion ou demande de support technique.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="ck-contact-methods py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plusieurs façons de nous <span className="gradient-text">contacter</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 px-4">
              Choisissez le moyen qui vous convient le mieux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={index}
                  className="ck-contact-method group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r ${method.color} rounded-xl md:rounded-2xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-base md:text-lg text-blue-600 font-semibold mb-2 break-all">{method.value}</p>
                    <p className="text-sm md:text-base text-gray-600">{method.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="ck-contact-form-section py-12 md:py-20 bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Form */}
            <div className="ck-contact-form bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                Envoyez-nous un message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="ck-form-input w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="ck-form-input w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="ck-form-select w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="billing">Facturation</option>
                    <option value="feature">Demande de fonctionnalité</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="ck-form-textarea w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none text-base"
                    placeholder="Décrivez votre demande..."
                  />
                </div>

                <button
                  type="submit"
                  className="ck-form-submit w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-base md:text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Envoyer le message</span>
                </button>
              </form>
            </div>

            {/* Office Info */}
            <div className="ck-office-info space-y-6 md:space-y-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  Nos bureaux
                </h3>
                <div className="space-y-4 md:space-y-6">
                  {offices.map((office, index) => (
                    <div key={index} className="ck-office-card bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex-shrink-0 self-start">
                          <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{office.city}</h4>
                          <p className="text-sm md:text-base text-gray-600 mb-2">{office.address}</p>
                          <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500">
                            <Clock className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{office.hours}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="ck-response-times bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white">
                <h4 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Temps de réponse</h4>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span>Chat en direct</span>
                    <span className="font-semibold">Immédiat</span>
                  </div>
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span>Email support</span>
                    <span className="font-semibold">&lt; 4h</span>
                  </div>
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span>Support téléphonique</span>
                    <span className="font-semibold">&lt; 2h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Quick Links */}
      <div className="ck-faq-section py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
            Avant de nous contacter
          </h3>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-4">
            Consultez notre FAQ pour une réponse immédiate
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { title: "Comment fonctionne le tracking ?", link: "#" },
              { title: "Problèmes de facturation", link: "#" },
              { title: "Intégration API", link: "#" }
            ].map((faq, index) => (
              <a
                key={index}
                href={faq.link}
                className="ck-faq-link block p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300 group"
              >
                <h4 className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                  {faq.title}
                </h4>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
