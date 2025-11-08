"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // adicionado para redirecionamento

// Função auxiliar para extrair o ID do token JWT
function obterIdDoToken(token: string): number | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    return parseInt(payload.sub); // ID do usuário
  } catch (error) {
    console.error("Erro ao decodificar o token:", error);
    return null;
  }
}

export default function AtualizarCadastro() {
  const router = useRouter(); // inicializa o hook de navegação
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(false);

  // Carregar dados do usuário ao montar
  useEffect(() => {
    document.title = "Atualizar Cadastro";
    const token = localStorage.getItem("token");

    // 🔐 Redirecionar se não houver token
    if (!token) {
      router.push("/login");
      return;
    }

    const id = obterIdDoToken(token);
    if (id) {
      carregarDadosUsuario(id);
    } else {
      setErro("Token inválido.");
    }
  }, []);

  const carregarDadosUsuario = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      //const response = await fetch(`http://localhost:8080/usuario/${id}`);
      const response = await fetch(`https://acessi-next-java-production.up.railway.app/usuario/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNome(data.nome);
        setEmail(data.email);
      } else {
        setErro("Erro ao carregar os dados do usuário.");
      }
    } catch (error) {
      console.error("Erro ao carregar os dados:", error);
      setErro("Erro na requisição");
    }
  };

  const atualizarCadastro = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado.");
      return;
    }

    const id = obterIdDoToken(token);
    if (!id) {
      alert("Token inválido.");
      return;
    }

    const bodyContent = JSON.stringify({
      nome,
      email,
      senha,
      confirmaSenha,
    });

    try {
      const response = await fetch(`https://acessi-next-java-production.up.railway.app/usuario/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: bodyContent,
      });

      const data = await response.text();
      console.log(data);

      if (response.ok) {
        alert("Cadastro atualizado com sucesso!");
      } else {
        alert("Erro ao atualizar: " + data);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro na requisição");
    }
  };

  return (
    <main>
      <form className="max-w-3xl mx-auto bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-lg mt-8 mb-10">
        <p className="text-2xl font-bold text-gray-700 dark:text-white text-center mb-6">
          Atualize os dados do seu cadastro
        </p>

        {erro && <div className="text-red-500 text-center mb-4">{erro}</div>}

        <div className="space-y-6">
          {/* Nome */}
          <div className="flex justify-between items-center">
            <label
              htmlFor="txtNome"
              className="block text-gray-700 dark:text-white font-medium"
            >
              Nome Completo
            </label>
            <button
              type="button"
              onClick={() => setEditando(!editando)}
              className="bg-slate-300 px-2 py-1 m-0 rounded"
            >
              {editando ? "Salvar" : "Editar"}
            </button>
          </div>

          {!editando ? (
            <p className="text-gray-700 dark:text-white">
              {nome || "Nenhum nome definido"}
            </p>
          ) : (
            <input
              type="text"
              name="txtNome"
              id="txtNome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 border border-blue-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          )}

          {/* E-mail */}
          <div className="flex justify-between items-center">
            <label
              htmlFor="txtEmail"
              className="block text-gray-700 dark:text-white font-medium"
            >
              E-mail
            </label>
          </div>

          {!editando ? (
            <p className="text-gray-700 dark:text-white">
              {email || "Nenhum e-mail definido"}
            </p>
          ) : (
            <input
              type="text"
              name="txtEmail"
              id="txtEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-blue-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          )}

          {/* Senha */}
          <div className="flex justify-between items-center">
            <label
              htmlFor="txtCriarSenha"
              className="block text-gray-700 dark:text-white font-medium"
            >
              Digite sua nova senha
            </label>
          </div>
          <input
            type="password"
            name="txtCriarSenha"
            id="txtCriarSenha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-3 border border-blue-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {/* Confirmar Senha */}
          <div className="flex justify-between items-center">
            <label
              htmlFor="txtConfirmarSenha"
              className="block text-gray-700 dark:text-white font-medium"
            >
              Confirme a sua nova senha
            </label>
          </div>
          <input
            type="password"
            name="txtConfirmarSenha"
            id="txtConfirmarSenha"
            value={confirmaSenha}
            onChange={(e) => setConfirmaSenha(e.target.value)}
            className="w-full p-3 border border-blue-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={atualizarCadastro}
              className="inline-block px-6 py-2 bg-green-500 dark:bg-green-600 text-white font-bold rounded-md hover:bg-green-600 transition"
            >
              Atualizar Cadastro
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
