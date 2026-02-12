import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import './Auth.css';
import { User, Mail, Lock, Image as ImgIcon } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { register, login, getUserData } = useContext(AppContext);

  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileFile, setProfileFile] = useState(null);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (state === 'Sign Up') {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      if (profileFile) fd.append('profile_image', profileFile);

      const resp = await register(fd);

      if (resp.ok) {
        toast.success('Rejestracja zakończona sukcesem. Zaloguj się.');
        setState('Login');
      } else {
        toast.error(resp.message || 'Błąd rejestracji');
      }
    } else {
      const resp = await login({ email, password });

      if (resp.ok) {
        toast.success('Logowanie powiodło się');
        await getUserData();
        navigate('/');
      } else {
        toast.error(resp.message || 'Błąd logowania');
      }
    }
  };

  return (
    <div className="page-wrap">

    <div className="auth-gradient" aria-hidden />

      <div className="log_form">
        <h2 className="card-title">
          {state === 'Sign Up' ? 'Utwórz konto' : 'Zaloguj się'}
        </h2>

        <p className="card-sub">
          {state === 'Sign Up'
            ? 'Utwórz nowe konto.'
            : 'Zaloguj się do swojego konta.'}
        </p>

        <form onSubmit={onSubmitHandler} className="form">

          {state === 'Sign Up' && (
            <div className="input-row">
              <User size={20} />
              <input
                type="text"
                placeholder="Imię"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-row">
            <Mail size={20} />
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-row">
            <Lock size={20} />
            <input
              type="password"
              placeholder="Hasło"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {state === 'Sign Up' && (
            <div className="input-row file-row">
              <label className="file-label">
                {profileFile ? profileFile.name : 'Wybierz awatar (opcjonalnie)'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileFile(e.target.files[0])}
                />
              </label>
            </div>
          )}

          <button className="btn">
            {state === 'Login' ? 'Zaloguj się' : 'Utwórz konto'}
          </button>
        </form>

        <p className="switch">
          {state === 'Sign Up' ? (
            <>
              Masz już konto?{' '}
              <span
                onClick={() => setState('Login')}
                className="link"
              >
                Zaloguj się
              </span>
            </>
          ) : (
            <>
              Nie masz konta?{' '}
              <span
                onClick={() => setState('Sign Up')}
                className="link"
              >
                Zarejestruj się
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
