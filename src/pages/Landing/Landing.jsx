import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCloudArrowUp, FaLock, FaShareNodes, FaShieldHeart } from 'react-icons/fa6'
import LOGO from '../../assets/logo-new.png'
import './style.scss'

const highlights = [
    {
        icon: FaCloudArrowUp,
        title: 'Drop anything fast',
        description: 'Send text or files in a few clicks without making your workflow feel heavy.',
    },
    {
        icon: FaLock,
        title: 'Protect with a password',
        description: 'Add an extra layer of privacy for anything that should not be open to everyone.',
    },
    {
        icon: FaShareNodes,
        title: 'Share one clean link',
        description: 'Create a focused share page instead of juggling attachments and copies of copies.',
    },
]

const steps = [
    'Choose text or files and add your content.',
    'Optionally lock it with a password or set it read-only.',
    'Generate a shareable link and send it anywhere.',
]

const Landing = () => {
    return (
        <div className="landing-page">
            <section className="hero-card">
                <div className="hero-badge">
                    <span className="badge-dot" />
                    Private sharing for text and files
                </div>

                <div className="hero-grid">
                    <div className="hero-copy">
                        <div className="brand-row">
                            <img src={LOGO} alt="QuickShare" className="brand-logo" />
                            <span>QuickShare</span>
                        </div>

                        <h1>Share sensitive content with a link that feels intentional.</h1>
                        <p className="hero-subtitle">
                            QuickShare gives you a focused place to send text, files, and protected notes without turning the process into a chore.
                        </p>

                        <div className="hero-actions">
                            <Link className="primary-action" to="/app">
                                Open the app
                                <FaArrowRight />
                            </Link>
                            <a className="secondary-action" href="#features">
                                See what it does
                            </a>
                        </div>

                        <div className="hero-stats">
                            <div>
                                <strong>1 link</strong>
                                <span>for each share</span>
                            </div>
                            <div>
                                <strong>Password</strong>
                                <span>protection when needed</span>
                            </div>
                            <div>
                                <strong>Text + files</strong>
                                <span>in one flow</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual" aria-hidden="true">
                        <div className="floating-card main-card">
                            <div className="card-top">
                                <span>Encrypted note</span>
                                <FaShieldHeart />
                            </div>
                            <div className="card-body">
                                <p>Project brief</p>
                                <div className="card-snippet">
                                    <span>••••••••••••••••••••</span>
                                    <span>Protected share link ready</span>
                                </div>
                            </div>
                        </div>

                        <div className="floating-card secondary-card">
                            <FaShareNodes />
                            <div>
                                <strong>Share instantly</strong>
                                <p>Generate a link and move on.</p>
                            </div>
                        </div>

                        <div className="floating-card tertiary-card">
                            <FaLock />
                            <div>
                                <strong>Private by default</strong>
                                <p>Add a password whenever you need it.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content-section" id="features">
                <div className="section-heading">
                    <p className="eyebrow">Why it works</p>
                    <h2>Everything stays simple for the person sharing and the person receiving.</h2>
                </div>

                <div className="feature-grid">
                    {highlights.map((item) => {
                        const Icon = item.icon

                        return (
                            <article className="feature-card" key={item.title}>
                                <div className="feature-icon">
                                    <Icon />
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </article>
                        )
                    })}
                </div>
            </section>

            <section className="content-section steps-section">
                <div className="section-heading compact">
                    <p className="eyebrow">How it works</p>
                    <h2>A short path from content to shareable link.</h2>
                </div>

                <div className="steps-list">
                    {steps.map((step, index) => (
                        <div className="step-item" key={step}>
                            <span>{index + 1}</span>
                            <p>{step}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="content-section cta-panel">
                <div>
                    <p className="eyebrow">Ready when you are</p>
                    <h2>Open the app and start sharing in a cleaner workflow.</h2>
                </div>

                <Link className="primary-action" to="/app">
                    Launch app
                    <FaArrowRight />
                </Link>
            </section>
        </div>
    )
}

export default Landing
