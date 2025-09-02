import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [tipoUsuario, setTipoUsuario] = useState("usuario"); // usuario ou prestador
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  
  // Campos específicos para prestador
  const [tipoPessoa, setTipoPessoa] = useState("fisica"); // fisica ou juridica
  const [documento, setDocumento] = useState(""); // CPF ou CNPJ
  const [tipoPagamento, setTipoPagamento] = useState("pix");
  const [notaRecibo, setNotaRecibo] = useState("recibo");
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  // Função para formatar telefone
  const formatarTelefone = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '');
    
    // Aplica a máscara conforme o tamanho
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else {
      // Limita a 11 dígitos
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
  };

  // Função para lidar com mudança no telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setTelefone(valorFormatado);
  };

  // Função para formatar CPF
  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return valor;
  };

  // Função para formatar CNPJ
  const formatarCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return valor;
  };

  // Função para lidar com mudança no documento
  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (tipoPessoa === 'fisica') {
      setDocumento(formatarCPF(valor));
    } else {
      setDocumento(formatarCNPJ(valor));
    }
  };

  // Função para adicionar especialidade
  const adicionarEspecialidade = (especialidade: string) => {
    if (especialidade && !especialidades.includes(especialidade)) {
      setEspecialidades([...especialidades, especialidade]);
    }
  };

  // Função para remover especialidade
  const removerEspecialidade = (especialidade: string) => {
    setEspecialidades(especialidades.filter(e => e !== especialidade));
  };
  const [senha, setSenha] = useState("");
  const [codigoUsuario, setCodigoUsuario] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  // Redirecionamento automático após cadastro
  useEffect(() => {
    if (sucesso && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (sucesso && countdown === 0) {
      navigate("/login");
    }
  }, [sucesso, countdown, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const dadosRegistro: any = {
        nome,
        email,
        telefone,
        senha,
        codigoUsuario,
        tipoUsuario
      };

      // Adicionar dados específicos do prestador
      if (tipoUsuario === 'prestador') {
        dadosRegistro.prestador = {
          tipoPessoa,
          documento: documento.replace(/[^0-9]/g, ''), // Remove formatação
          tipoPagamento,
          notaRecibo,
          especialidades
        };
      }

      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosRegistro)
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao cadastrar.");
      } else {
        // Cadastro feito com sucesso
        setDadosUsuario(data.usuario);
        setSucesso(true);
        // Limpar os campos do formulário
        setTipoUsuario("usuario");
        setNomeEmpresa("");
        setNome("");
        setEmail("");
        setTelefone("");
        setSenha("");
        setCodigoUsuario("");
        setTipoPessoa("fisica");
        setDocumento("");
        setTipoPagamento("pix");
        setNotaRecibo("recibo");
        setEspecialidades([]);
      }
    } catch {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso && dadosUsuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
          <div className="flex justify-center mb-2">
            <img src="/logo-imobigestor.png" alt="Logo" className="h-32 w-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Cadastro Realizado!</h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-green-800">Seus dados de acesso:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nome:</span> {dadosUsuario.nome}</p>
              <p><span className="font-medium">E-mail:</span> {dadosUsuario.email}</p>
              <p><span className="font-medium text-blue-600">Código de usuário:</span> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{dadosUsuario.codigo}</span></p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Anote seu código de usuário! Você pode usar tanto o e-mail quanto o código para fazer login.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              Redirecionando para o login em <span className="font-bold text-lg">{countdown}</span> segundos...
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/login")} 
            className="w-full py-2 rounded font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Ir para Login Agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
        <div className="flex justify-center mb-2">
          <img src="/logo-imobigestor.png" alt="Logo" className="h-32 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Cadastro</h2>
        
        {/* Seleção do tipo de usuário */}
        <div>
          <label className="block mb-2 font-medium">Tipo de cadastro</label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="tipoUsuario" 
                value="usuario" 
                checked={tipoUsuario === 'usuario'} 
                onChange={e => setTipoUsuario(e.target.value)}
                className="mr-2"
              />
              Usuário
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="tipoUsuario" 
                value="prestador" 
                checked={tipoUsuario === 'prestador'} 
                onChange={e => setTipoUsuario(e.target.value)}
                className="mr-2"
              />
              Prestador de Serviços
            </label>
          </div>
        </div>


        <div>
          <label className="block mb-1 font-medium">Seu nome</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">E-mail</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Telefone</label>
          <input 
            type="tel" 
            className="w-full border rounded px-3 py-2" 
            value={telefone} 
            onChange={handleTelefoneChange} 
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Senha</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={senha} onChange={e => setSenha(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">ID de usuário</label>
          <input 
            type="text" 
            className="w-full border rounded px-3 py-2" 
            value={codigoUsuario} 
            onChange={e => setCodigoUsuario(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} 
            placeholder="ex: joao123, maria, carlos"
          />
        </div>

        {/* Campos específicos para prestadores */}
        {tipoUsuario === 'prestador' && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>📋 Dados do Prestador:</strong> Preencha as informações abaixo para completar seu cadastro como prestador de serviços.
              </p>
            </div>

            <div>
              <label className="block mb-1 font-medium">Tipo de Pessoa</label>
              <select 
                className="w-full border rounded px-3 py-2" 
                value={tipoPessoa} 
                onChange={e => {
                  setTipoPessoa(e.target.value);
                  setDocumento(''); // Limpa documento ao trocar tipo
                }}
              >
                <option value="fisica">Pessoa Física</option>
                <option value="juridica">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                {tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'}
              </label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                value={documento} 
                onChange={handleDocumentoChange}
                placeholder={tipoPessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                maxLength={tipoPessoa === 'fisica' ? 14 : 18}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Forma de Pagamento Preferida</label>
              <select 
                className="w-full border rounded px-3 py-2" 
                value={tipoPagamento} 
                onChange={e => setTipoPagamento(e.target.value)}
              >
                <option value="pix">PIX</option>
                <option value="transferencia">Transferência Bancária</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Tipo de Comprovante</label>
              <select 
                className="w-full border rounded px-3 py-2" 
                value={notaRecibo} 
                onChange={e => setNotaRecibo(e.target.value)}
              >
                <option value="recibo">Recibo</option>
                <option value="nota_fiscal">Nota Fiscal</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Especialidades</label>
              <div className="space-y-2">
                <select 
                  className="w-full border rounded px-3 py-2" 
                  onChange={e => {
                    if (e.target.value) {
                      adicionarEspecialidade(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Selecione uma especialidade</option>
                  <option value="Elétrica">Elétrica</option>
                  <option value="Hidráulica">Hidráulica</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Marcenaria">Marcenaria</option>
                  <option value="Alvenaria">Alvenaria</option>
                  <option value="Limpeza">Limpeza</option>
                  <option value="Jardinagem">Jardinagem</option>
                  <option value="Ar Condicionado">Ar Condicionado</option>
                  <option value="Serralheria">Serralheria</option>
                  <option value="Vidraçaria">Vidraçaria</option>
                  <option value="Reforma Geral">Reforma Geral</option>
                  <option value="Dedetização">Dedetização</option>
                  <option value="Segurança">Segurança</option>
                </select>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 border rounded px-3 py-2" 
                    placeholder="Ou digite uma especialidade personalizada"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const valor = e.target.value.trim();
                        if (valor) {
                          adicionarEspecialidade(valor);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={e => {
                      const input = e.target.previousElementSibling;
                      const valor = input.value.trim();
                      if (valor) {
                        adicionarEspecialidade(valor);
                        input.value = '';
                      }
                    }}
                  >
                    +
                  </button>
                </div>
                
                {especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {especialidades.map((esp, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {esp}
                        <button 
                          type="button" 
                          onClick={() => removerEspecialidade(esp)}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-600">
                  💡 Dica: Você pode selecionar múltiplas especialidades da lista ou adicionar especialidades personalizadas
                </p>
              </div>
            </div>
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Importante:</strong> Escolha um ID único que será usado para login. Apenas letras minúsculas e números são permitidos.
          </p>
        </div>
        {erro && <div className="text-red-500 text-sm text-center">{erro}</div>}
        <button type="submit" className={`w-full py-2 rounded font-semibold transition ${loading ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`} disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        <div className="text-center text-sm mt-2">
          Já tem conta? <Link to="/login" className="text-primary underline">Entrar</Link>
        </div>
      </form>
    </div>
  );
}
