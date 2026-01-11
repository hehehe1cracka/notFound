import React from 'react';
import styled from 'styled-components';

interface CyberLoginFormProps {
    formData: any;
    setFormData: (data: any) => void;
    handleAuth: (e: React.FormEvent) => void;
    isSignUp: boolean;
    setIsSignUp: (isSignUp: boolean) => void;
    loading: boolean;
    signInWithGoogle: () => void;
}

const CyberLoginForm: React.FC<CyberLoginFormProps> = ({
    formData,
    setFormData,
    handleAuth,
    isSignUp,
    setIsSignUp,
    loading,
    signInWithGoogle
}) => {
    return (
        <StyledWrapper>
            <form className="form" onSubmit={handleAuth}>
                <p id="heading">{isSignUp ? 'Sign Up' : 'Login'}</p>

                {isSignUp && (
                    <div className="field">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        </svg>
                        <input
                            autoComplete="off"
                            placeholder="Full Name"
                            className="input-field"
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        />
                    </div>
                )}

                <div className="field">
                    <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                    </svg>
                    <input
                        autoComplete="off"
                        placeholder="Email"
                        className="input-field"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div className="field">
                    <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    </svg>
                    <input
                        placeholder="Password"
                        className="input-field"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <div className="btn">
                    <button className="button1" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>
                    <button
                        className="button2"
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? 'Switch to Login' : 'Sign Up'}
                    </button>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <button type="button" className="button3" onClick={signInWithGoogle}>
                        <svg className="h-4 w-4 mr-2 inline-block" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            </form>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 2em;
    padding-right: 2em;
    padding-bottom: 0.4em;
    background-color: #171717;
    border-radius: 25px;
    transition: .4s ease-in-out;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .form:hover {
    transform: scale(1.02);
    border: 1px solid #333;
  }

  #heading {
    text-align: center;
    margin: 1.5em;
    color: rgb(255, 255, 255);
    font-size: 1.5em;
    font-weight: bold;
  }

  .field {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    border-radius: 25px;
    padding: 0.8em;
    border: none;
    outline: none;
    color: white;
    background-color: #171717;
    box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
  }

  .input-icon {
    height: 1.3em;
    width: 1.3em;
    fill: white;
  }

  .input-field {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    color: #d3d3d3;
    font-size: 1rem;
  }

  .form .btn {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-top: 1.5em;
    gap: 10px;
  }

  .button1 {
    flex: 1;
    padding: 0.8em;
    border-radius: 8px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }

  .button1:hover {
    background-color: #00ffaa;
    color: black;
  }

  .button2 {
    flex: 1;
    padding: 0.8em;
    border-radius: 8px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    cursor: pointer;
  }

  .button2:hover {
    background-color: black;
    color: white;
  }

  .button3 {
    width: 100%;
    margin-bottom: 2em;
    padding: 0.8em;
    border-radius: 8px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    cursor: pointer;
    font-size: 0.9em;
  }

  .button3:hover {
    background-color: #4285F4;
    color: white;
  }`;

export default CyberLoginForm;
