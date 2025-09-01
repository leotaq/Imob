import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

export default function Perfil() {
  const { token, usuario } = useAuth();
  const [me, setMe] = useState<any>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!token) return;
    import('@/lib/api').then(({ apiGet }) => apiGet('/api/me'))
      .then((data) => {
        setMe(data.usuario);
      })
      .catch(() => setErro("Não autorizado ou token inválido."));
  }, [token]);

  if (erro) return <div className="p-6 text-red-500">{erro}</div>;
  if (!me) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">Perfil</h2>
      <div><b>Nome:</b> {me.nome}</div>
      <div><b>Email:</b> {me.email}</div>
      <div><b>Empresa:</b> {me.empresa?.nome}</div>
    </div>
  );
}
