"use client"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useI18n } from "@/lib/i18n/I18nProvider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { addLocaleToPathname, getLocaleFromPathname } from "@/lib/i18n/config"

export default function Footer() {
    const { t } = useI18n()
    const pathname = usePathname() || "/"
    const locale = getLocaleFromPathname(pathname)
    const footerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    }

    const socialIcons = [
        { icon: Facebook, href: "#", label: "Facebook" },
        { icon: Twitter, href: "#", label: "Twitter" },
        { icon: Instagram, href: "#", label: "Instagram" },
        { icon: Youtube, href: "#", label: "YouTube" },
    ]

    return (
        <motion.footer
            className="bg-ascent text-background"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={footerVariants}
        >
            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <motion.div variants={itemVariants}>
                        <motion.div
                            className="flex items-center gap-2 mb-6"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Image src="/images/logo.svg" alt="Trendify Logo" width={32} height={32} className="invert" />
                            <h3 className="typography text-2xl">Trendify</h3>
                        </motion.div>
                        <p className="text-background/80 mb-6 leading-relaxed">
                            Your ultimate destination for fashion-forward clothing and accessories. We bring you the latest trends
                            with uncompromising quality.
                        </p>
                        <div className="flex gap-4">
                            {socialIcons.map((social, index) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-ascent transition-colors duration-300"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants}>
                        <h4 className="typography text-lg mb-6">{t("nav.newArrivals")}</h4>
                        <ul className="space-y-3">
                            {[
                                { label: t("nav.newArrivals"), href: "/new-arrivals" },
                                { label: t("nav.men"), href: "/men" },
                                { label: t("nav.women"), href: "/women" },
                                { label: t("nav.accessories"), href: "/accessories" },
                                { label: t("nav.sale"), href: "/sale" },
                            ].map((item, index) => (
                                <motion.li
                                    key={item.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                >
                                    <motion.div
                                        className="text-background/80 hover:text-background hover:text-ascent transition-colors duration-200"
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link href={addLocaleToPathname(item.href, locale)}>{item.label}</Link>
                                    </motion.div>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Customer Service */}
                    <motion.div variants={itemVariants}>
                        <h4 className="typography text-lg mb-6">{t("footer.contact")}</h4>
                        <ul className="space-y-3">
                            {[t("footer.contact"), "Size Guide", "Shipping Info", "Returns", "FAQ"].map((link, index) => (
                                <motion.li
                                    key={link}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 + 0.4 }}
                                >
                                    <motion.a
                                        href="#"
                                        className="text-background/80 hover:text-background hover:text-ascent transition-colors duration-200"
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {link}
                                    </motion.a>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div variants={itemVariants}>
                        <h4 className="typography text-lg mb-6">Get in Touch</h4>
                        <div className="space-y-4">
                            <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                                <MapPin className="w-5 h-5 text-ascent" />
                                <span className="text-background/80">123 Fashion Street, NY 10001</span>
                            </motion.div>
                            <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                                <Phone className="w-5 h-5 text-ascent" />
                                <span className="text-background/80">+1 (555) 123-4567</span>
                            </motion.div>
                            <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                                <Mail className="w-5 h-5 text-ascent" />
                                <span className="text-background/80">hello@trendify.com</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
                    variants={itemVariants}
                >
                    <motion.p
                        className="text-background/60 text-sm mb-4 md:mb-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        © {new Date().getFullYear()} Trendify. {t("footer.copyright")}
                    </motion.p>
                    <motion.div
                        className="flex gap-6 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <motion.div whileHover={{ y: -2 }}>
                            <Link href={addLocaleToPathname("/privacy-policy", locale)} className="text-background/60 hover:text-background transition-colors duration-200">
                                {t("footer.privacy")}
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }}>
                            <Link href={addLocaleToPathname("/terms-of-service", locale)} className="text-background/60 hover:text-background transition-colors duration-200">
                                {t("footer.terms")}
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }}>
                            <Link href={addLocaleToPathname("/cookie-policy", locale)} className="text-background/60 hover:text-background transition-colors duration-200">
                                {t("footer.cookies")}
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.footer>
    )
}
