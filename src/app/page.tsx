"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Owner = {
  id: number;
  name: string;
  document: string;
  pix: string;
  email: string;
  balance: number;
  properties: number;
};

type Charge = {
  id: number;
  property: string;
  owner: string;
  tenant: string;
  amount: number;
  status: "Pago" | "Pendente";
  due: string;
};

const STORAGE_KEY = "new-conecta-mvp-v1";

const ownersSeed: Owner[] = [
  {
    id: 1,
    name: "Marina Albuquerque",
    document: "041.228.999-10",
    pix: "marina@email.com",
    email: "marina@email.com",
    balance: 4180,
    properties: 3,
  },
  {
    id: 2,
    name: "Roberto Mello",
    document: "772.100.458-44",
    pix: "+55 41 99999-1221",
    email: "roberto@exemplo.com",
    balance: 2670,
    properties: 2,
  },
];

const chargesSeed: Charge[] = [
  {
    id: 101,
    property: "Apto 802 · Ed. Aurora",
    owner: "Marina Albuquerque",
    tenant: "Lucas Ferreira",
    amount: 1850,
    status: "Pago",
    due: "05/05/2026",
  },
  {
    id: 102,
    property: "Casa 14 · Jardim Norte",
    owner: "Roberto Mello",
    tenant: "Camila Duarte",
    amount: 2670,
    status: "Pago",
    due: "10/05/2026",
  },
  {
    id: 103,
    property: "Sala 312 · Centro Business",
    owner: "Marina Albuquerque",
    tenant: "Vetor Labs",
    amount: 2330,
    status: "Pendente",
    due: "18/05/2026",
  },
];

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [logged, setLogged] = useState(false);
  const [owners, setOwners] = useState(ownersSeed);
  const [charges, setCharges] = useState(chargesSeed);
  const [activeTab, setActiveTab] = useState("registro");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Demo persistence: hydrate prototype data from the browser only.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as {
          owners?: Owner[];
          charges?: Charge[];
          logged?: boolean;
        };
        const savedOwners = saved.owners;
        const savedCharges = saved.charges;
        const savedLogged = saved.logged;
        if (savedOwners?.length) setTimeout(() => setOwners(savedOwners), 0);
        if (savedCharges?.length) setTimeout(() => setCharges(savedCharges), 0);
        if (typeof savedLogged === "boolean") setTimeout(() => setLogged(savedLogged), 0);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setTimeout(() => setHydrated(true), 0);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ owners, charges, logged })
    );
  }, [owners, charges, logged, hydrated]);

  const paidTotal = charges
    .filter((charge) => charge.status === "Pago")
    .reduce((sum, charge) => sum + charge.amount, 0);

  const pendingTotal = charges
    .filter((charge) => charge.status === "Pendente")
    .reduce((sum, charge) => sum + charge.amount, 0);

  const transferTotal = owners.reduce((sum, owner) => sum + owner.balance, 0);

  const monthClose = useMemo(
    () => [
      { label: "Recebido", value: paidTotal, detail: "cobranças baixadas" },
      { label: "Pendente", value: pendingTotal, detail: "aguardando baixa" },
      { label: "Repasses", value: transferTotal, detail: "previstos no mês" },
    ],
    [paidTotal, pendingTotal, transferTotal]
  );

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLogged(true);
  }

  function addOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const owner: Owner = {
      id: Date.now(),
      name: String(data.get("name") || "Novo proprietário"),
      document: String(data.get("document") || "000.000.000-00"),
      pix: String(data.get("pix") || "pix@exemplo.com"),
      email: String(data.get("email") || "contato@exemplo.com"),
      balance: Number(data.get("balance") || 0),
      properties: Number(data.get("properties") || 1),
    };
    setOwners([owner, ...owners]);
    event.currentTarget.reset();
  }

  function addCharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedOwner = String(data.get("owner") || owners[0]?.name || "");
    const charge: Charge = {
      id: Date.now(),
      property: String(data.get("property") || "Novo imóvel"),
      owner: selectedOwner,
      tenant: String(data.get("tenant") || "Novo inquilino"),
      amount: Number(data.get("amount") || 0),
      status: "Pendente",
      due: String(data.get("due") || "25/05/2026"),
    };
    setCharges([charge, ...charges]);
    event.currentTarget.reset();
  }

  function markAsPaid(id: number) {
    const paidCharge = charges.find((charge) => charge.id === id);
    setCharges((current) =>
      current.map((charge) =>
        charge.id === id ? { ...charge, status: "Pago" } : charge
      )
    );
    if (paidCharge && paidCharge.status === "Pendente") {
      setOwners((current) =>
        current.map((owner) =>
          owner.name === paidCharge.owner
            ? { ...owner, balance: owner.balance + paidCharge.amount }
            : owner
        )
      );
    }
  }

  function resetDemo() {
    setOwners(ownersSeed);
    setCharges(chargesSeed);
    setActiveTab("registro");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0b08] text-[#fff7e8]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(235,178,76,.42),transparent_28%),radial-gradient(circle_at_95%_25%,rgba(255,255,255,.10),transparent_22%),linear-gradient(145deg,#0d0b08_0%,#17110b_48%,#050505_100%)]" />
      <div className="fixed inset-0 opacity-[.16] [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="fixed -left-16 top-20 h-64 w-64 rounded-full border border-[#d9a441]/30 md:h-96 md:w-96" />

      <AnimatePresence mode="wait">
        {!logged ? (
          <LoginScreen key="login" onLogin={login} />
        ) : (
          <motion.section
            key="panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative mx-auto min-h-screen max-w-6xl px-4 py-4 pb-28 sm:px-6 md:py-8"
          >
            <header className="rounded-[2rem] border border-white/10 bg-white/[.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <Brand />
                <div className="flex gap-2">
                  <button
                    onClick={resetDemo}
                    className="rounded-full border border-white/10 px-4 py-3 text-xs font-bold text-[#f4d18a] transition hover:bg-white/10"
                  >
                    Resetar demo
                  </button>
                  <button
                    onClick={() => setLogged(false)}
                    className="rounded-full bg-[#f4c15d] px-4 py-3 text-xs font-black text-[#17100a] shadow-lg shadow-[#f4c15d]/20"
                  >
                    Sair
                  </button>
                </div>
              </div>

              <motion.div
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                initial="hidden"
                animate="show"
                className="mt-6 grid gap-3 md:grid-cols-3"
              >
                {monthClose.map((card) => (
                  <motion.article
                    variants={fadeUp}
                    key={card.label}
                    className="rounded-[1.5rem] border border-white/10 bg-[#0b0907]/55 p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-[.22em] text-[#d9a441]">
                      {card.label}
                    </p>
                    <strong className="mt-2 block text-2xl tracking-[-0.05em] text-white md:text-3xl">
                      {money.format(card.value)}
                    </strong>
                    <p className="mt-1 text-xs text-stone-400">{card.detail}</p>
                  </motion.article>
                ))}
              </motion.div>
            </header>

            <nav className="fixed inset-x-3 bottom-4 z-20 mx-auto flex max-w-md justify-between rounded-full border border-white/10 bg-[#16110b]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl md:static md:my-6 md:max-w-none md:rounded-[1.5rem] md:justify-start">
              {[
                ["registro", "Registro"],
                ["cobrancas", "Cobranças"],
                ["repasses", "Repasses"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 rounded-full px-3 py-3 text-xs font-black transition md:flex-none md:px-6 ${
                    activeTab === id
                      ? "bg-[#f4c15d] text-[#17100a]"
                      : "text-stone-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <AnimatePresence mode="wait">
              {activeTab === "registro" && (
                <Registro key="registro" owners={owners} addOwner={addOwner} />
              )}
              {activeTab === "cobrancas" && (
                <Cobrancas
                  key="cobrancas"
                  owners={owners}
                  charges={charges}
                  addCharge={addCharge}
                  markAsPaid={markAsPaid}
                />
              )}
              {activeTab === "repasses" && (
                <Repasses key="repasses" owners={owners} total={transferTotal} />
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

function LoginScreen({ onLogin }: { onLogin: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative mx-auto grid min-h-screen max-w-5xl items-center gap-8 px-5 py-8 md:grid-cols-[1.05fr_.95fr] md:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Brand large />
        <h1 className="mt-8 text-5xl font-black leading-[.9] tracking-[-0.07em] text-white sm:text-6xl md:text-7xl">
          Controle de imóveis em modo premium.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-stone-300 sm:text-lg">
          Protótipo New Conecta para registrar proprietários, cobranças pagas,
          saldos e repasses mensais com uma experiência pensada primeiro para
          celular.
        </p>
        <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#f8d991]">
          <span className="rounded-full border border-[#d9a441]/25 bg-[#d9a441]/10 px-3 py-2">
            LocalStorage
          </span>
          <span className="rounded-full border border-[#d9a441]/25 bg-[#d9a441]/10 px-3 py-2">
            Next.js
          </span>
          <span className="rounded-full border border-[#d9a441]/25 bg-[#d9a441]/10 px-3 py-2">
            Framer Motion
          </span>
        </div>
      </motion.div>

      <motion.form
        onSubmit={onLogin}
        initial={{ opacity: 0, y: 28, rotate: 1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="rounded-[2rem] border border-white/10 bg-[#120f0b]/80 p-5 shadow-[0_30px_100px_rgba(0,0,0,.62)] backdrop-blur-2xl sm:p-7"
      >
        <div className="mb-6 rounded-[1.5rem] border border-[#d9a441]/20 bg-[#d9a441]/10 p-4">
          <p className="text-xs font-black uppercase tracking-[.28em] text-[#f8d991]">
            Login demo
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">
            Acesso liberado
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Dados já preenchidos para demonstração. Clique em entrar para abrir
            o painel.
          </p>
        </div>
        <Input
          dark
          name="email"
          label="E-mail"
          placeholder="admin@newconecta.com.br"
          defaultValue="admin@newconecta.com.br"
          type="email"
        />
        <div className="mt-4">
          <Input
            dark
            name="password"
            label="Senha"
            placeholder="••••••••"
            defaultValue="newconecta2026"
            type="password"
          />
        </div>
        <button className="mt-6 w-full rounded-2xl bg-[#f4c15d] px-5 py-4 font-black text-[#17100a] shadow-xl shadow-[#f4c15d]/20 transition active:scale-[.98] md:hover:-translate-y-0.5">
          Entrar no sistema
        </button>
      </motion.form>
    </motion.section>
  );
}

function Brand({ large = false }: { large?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${large ? "h-14 w-14" : "h-12 w-12"} relative grid place-items-center rounded-2xl bg-gradient-to-br from-[#ffe2a1] via-[#d9a441] to-[#805514] text-[#120f0b] shadow-xl shadow-[#d9a441]/25`}>
        <span className="text-xl font-black">NC</span>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[.32em] text-[#f8d991]">
          New Conecta
        </p>
        <p className={`${large ? "text-base" : "text-sm"} text-stone-300`}>
          Imóveis · Cobranças · Repasses
        </p>
      </div>
    </div>
  );
}

function Registro({ owners, addOwner }: { owners: Owner[]; addOwner: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="grid gap-5 lg:grid-cols-[.92fr_1.08fr]"
    >
      <Card>
        <p className="eyebrow">Novo proprietário</p>
        <h2 className="title">Registro rápido</h2>
        <form onSubmit={addOwner} className="mt-6 grid gap-4">
          <Input name="name" label="Nome completo" placeholder="Ex: Ana Souza" />
          <Input name="document" label="CPF/CNPJ" placeholder="000.000.000-00" />
          <Input name="email" label="E-mail" placeholder="ana@email.com" />
          <Input name="pix" label="Chave PIX" placeholder="CPF, telefone ou e-mail" />
          <div className="grid grid-cols-2 gap-3">
            <Input name="properties" label="Imóveis" placeholder="1" type="number" />
            <Input name="balance" label="Saldo inicial" placeholder="0" type="number" />
          </div>
          <button className="rounded-2xl bg-[#f4c15d] px-5 py-4 font-black text-[#17100a] transition active:scale-[.98]">
            Salvar proprietário
          </button>
        </form>
      </Card>

      <div className="space-y-3">
        {owners.map((owner, index) => (
          <motion.article
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={owner.id}
            className="rounded-[1.7rem] border border-white/10 bg-white/[.075] p-4 shadow-xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong className="text-lg text-white">{owner.name}</strong>
                <p className="mt-1 text-xs leading-5 text-stone-400">
                  {owner.document}<br />{owner.email}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f4c15d] px-3 py-2 text-right text-[#17100a]">
                <p className="text-[10px] font-black uppercase">Saldo</p>
                <strong className="text-sm">{money.format(owner.balance)}</strong>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-300">
              <span className="rounded-full bg-white/10 px-3 py-1">{owner.properties} imóveis</span>
              <span className="rounded-full bg-white/10 px-3 py-1">PIX: {owner.pix}</span>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

function Cobrancas({ owners, charges, addCharge, markAsPaid }: { owners: Owner[]; charges: Charge[]; addCharge: (event: FormEvent<HTMLFormElement>) => void; markAsPaid: (id: number) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]"
    >
      <Card>
        <p className="eyebrow">Nova cobrança</p>
        <h2 className="title">Gerar lançamento</h2>
        <form onSubmit={addCharge} className="mt-6 grid gap-4">
          <Input name="property" label="Imóvel" placeholder="Apto 401 · Edifício Solar" />
          <Input name="tenant" label="Inquilino" placeholder="Nome do inquilino" />
          <label className="field-label">
            Proprietário
            <select name="owner" className="field-input">
              {owners.map((owner) => (
                <option key={owner.id}>{owner.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input name="amount" label="Valor" placeholder="1500" type="number" />
            <Input name="due" label="Vencimento" placeholder="25/05/2026" />
          </div>
          <button className="rounded-2xl bg-[#f4c15d] px-5 py-4 font-black text-[#17100a] transition active:scale-[.98]">
            Criar cobrança
          </button>
        </form>
      </Card>

      <div className="space-y-3">
        {charges.map((charge) => (
          <article
            key={charge.id}
            className="rounded-[1.6rem] border border-white/10 bg-white/[.075] p-4 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="text-white">{charge.property}</strong>
                <p className="mt-1 text-xs leading-5 text-stone-400">
                  {charge.tenant} · {charge.owner}<br />Venc. {charge.due}
                </p>
              </div>
              <strong className="text-[#f8d991]">{money.format(charge.amount)}</strong>
            </div>
            <button
              onClick={() => markAsPaid(charge.id)}
              className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[.98] ${
                charge.status === "Pago"
                  ? "bg-emerald-400/15 text-emerald-200"
                  : "bg-[#f4c15d] text-[#17100a]"
              }`}
            >
              {charge.status === "Pago" ? "Pago" : "Marcar como pago"}
            </button>
          </article>
        ))}
      </div>
    </motion.section>
  );
}

function Repasses({ owners, total }: { owners: Owner[]; total: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"
    >
      <Card>
        <p className="eyebrow">Fechamento mensal</p>
        <h2 className="title">Lote de repasse</h2>
        <div className="mt-6 space-y-3">
          {owners.map((owner) => (
            <div key={owner.id} className="rounded-2xl bg-white/[.06] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <strong className="text-white">{owner.name}</strong>
                  <p className="text-xs text-stone-400">PIX: {owner.pix}</p>
                </div>
                <strong className="text-[#f8d991]">{money.format(owner.balance)}</strong>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <aside className="rounded-[2rem] bg-gradient-to-br from-[#ffe2a1] via-[#d9a441] to-[#8b5d16] p-6 text-[#17100a] shadow-2xl shadow-[#d9a441]/20">
        <p className="text-xs font-black uppercase tracking-[.24em]">Total previsto</p>
        <strong className="mt-4 block text-5xl font-black tracking-[-0.08em]">
          {money.format(total)}
        </strong>
        <p className="mt-5 leading-7">
          O MVP calcula o lote. A transferência automática real entra depois com
          integração bancária, aprovação e trilha de auditoria.
        </p>
        <button className="mt-8 w-full rounded-2xl bg-[#17100a] px-5 py-4 font-black text-white transition active:scale-[.98]">
          Gerar lote demonstrativo
        </button>
      </aside>
    </motion.section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#120f0b]/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-6">
      {children}
    </div>
  );
}

function Input({
  label,
  name,
  placeholder,
  type = "text",
  defaultValue,
  dark = false,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  dark?: boolean;
}) {
  return (
    <label className={dark ? "field-label-dark" : "field-label"}>
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={dark ? "field-input-dark" : "field-input"}
      />
    </label>
  );
}
