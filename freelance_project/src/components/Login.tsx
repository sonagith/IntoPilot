import React, { useState } from 'react';
import {
  Mail,
  Lock,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import './Login.css'

import { loginUser } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {

  const [email, setEmail] = useState('aosaf@greenvalleygroup');
  const [password, setPassword] = useState('aosaf@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const data = await loginUser(email, password);

      localStorage.setItem(
        'intopilot_token',
        data.access_token
      );

      localStorage.setItem(
        'user_email',
        email
      );

      onLoginSuccess();

    } catch (err: any) {

      setError(
        err.message || 'Invalid credentials'
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="login-page">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="login-brand-panel">

        {/* Background decoration */}
        <div className="brand-glow brand-glow-one"></div>
        <div className="brand-glow brand-glow-two"></div>

        <div className="brand-grid"></div>

        <div className="brand-light-line brand-light-line-one"></div>
        <div className="brand-light-line brand-light-line-two"></div>


        <div className="brand-content">


          {/* =================================================
              BRAND HEADER
          ================================================= */}

          <div className="company-brand">

            <div className="company-logo-box">

              <img
                src="/Ascentiq_logo-removebg.png"
                alt="AscentiQ AI"
                className="company-logo"
              />

            </div>


            <div className="company-brand-info">

              <div className="company-name">
                AscentiQ <span>AI</span>
              </div>

              <div className="company-tagline">
                AI • AUTOMATION • VISION AI
              </div>

            </div>

          </div>


          {/* =================================================
              HERO
          ================================================= */}

          <div className="brand-main-content">


            {/* eyebrow */}

            <div className="eyebrow">

              <span className="eyebrow-dot"></span>

              <span>
                INTELLIGENT BUSINESS AUTOMATION
              </span>

            </div>


            {/* heading */}

            <h1 className="brand-title">

              Intelligent technology.

              <br />

              <span>
                Built for business.
              </span>

            </h1>


            {/* =================================================
                AI ECOSYSTEM
            ================================================= */}

            <div className="ai-ecosystem-wrapper">

              <div className="ecosystem-glow"></div>

              <div className="ecosystem-ring ecosystem-ring-one"></div>

              <div className="ecosystem-ring ecosystem-ring-two"></div>


              <img
                src="/a9cd355d-9b74-45bd-b307-7535c089f5c1.png"
                alt="AscentiQ AI ecosystem"
                className="ai-ecosystem-image"
              />

            </div>


          </div>


          {/* =================================================
              BOTTOM
          ================================================= */}

          <div className="brand-bottom">


            <div className="trust-row">

              <CheckCircle2 size={17} />

              <span>
                Built for real business operations
              </span>

            </div>


            <div className="brand-links">

              <a
                href="https://ascentiqai.com/"
                target="_blank"
                rel="noopener noreferrer"
              >

                Company Website

                <ArrowUpRight size={14} />

              </a>


              <span className="link-divider"></span>


              <a
                href="https://automation.ascentiqai.com/"
                target="_blank"
                rel="noopener noreferrer"
              >

                AI Automation

                <ArrowUpRight size={14} />

              </a>

            </div>


          </div>


        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
          YOUR EXISTING LOGIN
      ===================================================== */}

      <div className="login-form-panel">

        <div className="login-card">


          <div className="login-logo-wrapper">

            <img
              src="/Ascentiq_logo.jpeg"
              alt="AscentiQ AI"
              className="login-logo"
            />

          </div>


          <div className="login-header">

            <div className="login-welcome">
              WELCOME BACK
            </div>

            <h2>
              Sign in to <span>IntoPilot</span>
            </h2>

            <p>
              Access your intelligent business operations dashboard.
            </p>

          </div>


          {error && (

            <div className="login-error">

              <span>!</span>

              {error}

            </div>

          )}


          <form onSubmit={handleLogin}>


            <div className="login-form-group">

              <label>
                Email Address
              </label>


              <div className="login-input-wrapper">

                <Mail size={18} />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>



            <div className="login-form-group">

              <label>
                Password
              </label>


              <div className="login-input-wrapper">

                <Lock size={18} />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                />

              </div>

            </div>



            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>

              ) : (

                <>
                  Sign In to Dashboard
                  <ArrowUpRight size={18} />
                </>

              )}

            </button>


          </form>


          <div className="login-footer">

            <div className="secure-login">

              <span className="secure-dot"></span>

              Secure access

            </div>


            <div className="powered-by">

              Powered by <strong>AscentiQ AI</strong>

            </div>

          </div>


        </div>

      </div>

    </div>

  );
};

export default Login;