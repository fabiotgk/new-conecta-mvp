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

type Tenant = {
  id: number;
  name: string;
  document: string;
  phone: string;
  email: string;
};

type Property = {
  id: number;
  name: string;
  address: string;
  owner: string;
  rent: number;
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

type Screen = "inicio" | "proprietarios" | "inquilinos" | "imoveis" | "cobrancas" | "repasses";

const STORAGE_KEY = "new-conecta-mvp-v2";

const ownersSeed: Owner[] = [
  { id: 1, name: "Marina Albuquerque", document: "041.228.999-10", pix: "marina@email.com", email: "marina@email.com", balance: 4180, properties: 3 },
  { id: 2, name: "Roberto Mello", document: "772.100.458-44", pix: "+55 41 99999-1221", email: "roberto@exemplo.com", balance: 2670, properties: 2 },
];

const tenantsSeed: Tenant[] = [
  { id: 11, name: "Lucas Ferreira", document: "088.981.321-02", phone: "+55 41 98888-1122", email: "lucas@email.com" },
  { id: 12, name: "Camila Duarte", document: "539.448.101-87", phone: "+55 41 97777-2020", email: "camila@email.com" },
];

const propertiesSeed: Property[] = [
  { id: 21, name: "Apto 802 · Ed. Aurora", address: "Rua Emiliano Perneta, 802", owner: "Marina Albuquerque", rent: 1850 },
  { id: 22, name: "Casa 14 · Jardim Norte", address: "Rua das Acácias, 14", owner: "Roberto Mello", rent: 2670 },
];

const chargesSeed: Charge[] = [
  { id: 101, property: "Apto 802 · Ed. Aurora", owner: "Marina Albuquerque", tenant: "Lucas Ferreira", amount: 1850, status: "Pago", due: "05/05/2026" },
  { id: 102, property: "Casa 14 · Jardim Norte", owner: "Roberto Mello", tenant: "Camila Duarte", amount: 2670, status: "Pago", due: "10/05/2026" },
  { id: 103, property: "Sala 312 · Centro Business", owner: "Marina Albuquerque", tenant: "Vetor Labs", amount: 2330, status: "Pendente", due: "18/05/2026" },
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const menuItems: Array<{ id: Screen; label: string; icon: string }> = [
  { id: "inicio", label: "Início", icon: "⌂" },
  { id: "proprietarios", label: "Proprietários", icon: "◈" },
  { id: "inquilinos", label: "Inquilinos", icon: "+" },
  { id: "imoveis", label: "Imóveis", icon: "▦" },
  { id: "cobrancas", label: "Cobranças", icon: "R$" },
  { id: "repasses", label: "Repasses", icon: "↗" },
];

export default function Home() {
  const [logged, setLogged] = useState(false);
  const [owners, setOwners] = useState(ownersSeed);
  const [tenants, setTenants] = useState(tenantsSeed);
  const [properties, setProperties] = useState(propertiesSeed);
  const [charges, setCharges] = useState(chargesSeed);
  const [screen, setScreen] = useState<Screen>("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as Partial<{
          owners: Owner[]; tenants: Tenant[]; properties: Property[]; charges: Charge[]; logged: boolean; screen: Screen;
        }>;
        setTimeout(() => {
          if (saved.owners?.length) setOwners(saved.owners);
          if (saved.tenants?.length) setTenants(saved.tenants);
          if (saved.properties?.length) setProperties(saved.properties);
          if (saved.charges?.length) setCharges(saved.charges);
          if (typeof saved.logged === "boolean") setLogged(saved.logged);
          if (saved.screen) setScreen(saved.screen);
          setHydrated(true);
        }, 0);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        setTimeout(() => setHydrated(true), 0);
      }
    } else {
      setTimeout(() => setHydrated(true), 0);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ owners, tenants, properties, charges, logged, screen }));
  }, [owners, tenants, properties, charges, logged, screen, hydrated]);

  const totals = useMemo(() => {
    const paid = charges.filter((charge) => charge.status === "Pago").reduce((sum, charge) => sum + charge.amount, 0);
    const pending = charges.filter((charge) => charge.status === "Pendente").reduce((sum, charge) => sum + charge.amount, 0);
    const transfers = owners.reduce((sum, owner) => sum + owner.balance, 0);
    return { paid, pending, transfers };
  }, [charges, owners]);

  function selectScreen(next: Screen) {
    setScreen(next);
    setDrawerOpen(false);
  }

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

  function addTenant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const tenant: Tenant = {
      id: Date.now(),
      name: String(data.get("name") || "Novo cliente"),
      document: String(data.get("document") || "000.000.000-00"),
      phone: String(data.get("phone") || "+55 41 99999-0000"),
      email: String(data.get("email") || "cliente@email.com"),
    };
    setTenants([tenant, ...tenants]);
    setShowTenantForm(false);
    event.currentTarget.reset();
  }

  function addProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const property: Property = {
      id: Date.now(),
      name: String(data.get("name") || "Novo imóvel"),
      address: String(data.get("address") || "Endereço não informado"),
      owner: String(data.get("owner") || owners[0]?.name || ""),
      rent: Number(data.get("rent") || 0),
    };
    setProperties([property, ...properties]);
    event.currentTarget.reset();
  }

  function addCharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const propertyName = String(data.get("property") || properties[0]?.name || "Novo imóvel");
    const property = properties.find((item) => item.name === propertyName);
    const charge: Charge = {
      id: Date.now(),
      property: propertyName,
      owner: String(property?.owner || owners[0]?.name || ""),
      tenant: String(data.get("tenant") || tenants[0]?.name || "Novo cliente"),
      amount: Number(data.get("amount") || property?.rent || 0),
      status: "Pendente",
      due: String(data.get("due") || "25/05/2026"),
    };
    setCharges([charge, ...charges]);
    event.currentTarget.reset();
  }

  function markAsPaid(id: number) {
    const paidCharge = charges.find((charge) => charge.id === id);
    setCharges((current) => current.map((charge) => (charge.id === id ? { ...charge, status: "Pago" } : charge)));
    if (paidCharge && paidCharge.status === "Pendente") {
      setOwners((current) => current.map((owner) => (owner.name === paidCharge.owner ? { ...owner, balance: owner.balance + paidCharge.amount } : owner)));
    }
  }

  function resetDemo() {
    setOwners(ownersSeed);
    setTenants(tenantsSeed);
    setProperties(propertiesSeed);
    setCharges(chargesSeed);
    setScreen("inicio");
    setShowTenantForm(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0b08] text-[#fff7e8]">
      <Background />
      <AnimatePresence mode="wait">
        {!logged ? (
          <LoginScreen key="login" onLogin={login} />
        ) : (
          <motion.section key="panel" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative mx-auto min-h-screen max-w-6xl px-4 py-4 sm:px-6 md:py-8">
            <TopBar openDrawer={() => setDrawerOpen(true)} resetDemo={resetDemo} logout={() => setLogged(false)} current={menuItems.find((item) => item.id === screen)?.label || "Início"} />
            <Drawer open={drawerOpen} close={() => setDrawerOpen(false)} current={screen} select={selectScreen} />
            <Stats totals={totals} owners={owners.length} tenants={tenants.length} properties={properties.length} />
            <AnimatePresence mode="wait">
              {screen === "inicio" && <Inicio key="inicio" addTenant={addTenant} tenants={tenants} setScreen={selectScreen} />}
              {screen === "proprietarios" && <Proprietarios key="proprietarios" owners={owners} addOwner={addOwner} />}
              {screen === "inquilinos" && <Inquilinos key="inquilinos" tenants={tenants} addTenant={addTenant} showForm={showTenantForm} setShowForm={setShowTenantForm} />}
              {screen === "imoveis" && <Imoveis key="imoveis" properties={properties} owners={owners} addProperty={addProperty} />}
              {screen === "cobrancas" && <Cobrancas key="cobrancas" tenants={tenants} properties={properties} charges={charges} addCharge={addCharge} markAsPaid={markAsPaid} />}
              {screen === "repasses" && <Repasses key="repasses" owners={owners} total={totals.transfers} />}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

function Background() {
  return (
    <>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(235,178,76,.42),transparent_28%),radial-gradient(circle_at_95%_25%,rgba(255,255,255,.10),transparent_22%),linear-gradient(145deg,#0d0b08_0%,#17110b_48%,#050505_100%)]" />
      <div className="fixed inset-0 opacity-[.16] [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="fixed -left-16 top-20 h-64 w-64 rounded-full border border-[#d9a441]/30 md:h-96 md:w-96" />
    </>
  );
}

function LoginScreen({ onLogin }: { onLogin: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mx-auto grid min-h-screen max-w-5xl items-center gap-8 px-5 py-8 md:grid-cols-[1.05fr_.95fr] md:px-8">
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Brand large />
        <h1 className="mt-8 text-5xl font-black leading-[.9] tracking-[-0.07em] text-white sm:text-6xl md:text-7xl">Controle de imóveis em modo premium.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-stone-300 sm:text-lg">Protótipo New Conecta para registrar clientes, proprietários, imóveis, cobranças e repasses mensais com experiência pensada primeiro para celular.</p>
      </motion.div>
      <motion.form onSubmit={onLogin} initial={{ opacity: 0, y: 28, rotate: 1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className="rounded-[2rem] border border-white/10 bg-[#120f0b]/80 p-5 shadow-[0_30px_100px_rgba(0,0,0,.62)] backdrop-blur-2xl sm:p-7">
        <div className="mb-6 rounded-[1.5rem] border border-[#d9a441]/20 bg-[#d9a441]/10 p-4">
          <p className="text-xs font-black uppercase tracking-[.28em] text-[#f8d991]">Login demo</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">Acesso liberado</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">Dados preenchidos para demonstração. Clique em entrar para abrir o painel.</p>
        </div>
        <Input dark name="email" label="E-mail" placeholder="admin@newconecta.com.br" defaultValue="admin@newconecta.com.br" type="email" />
        <div className="mt-4"><Input dark name="password" label="Senha" placeholder="••••••••" defaultValue="newconecta2026" type="password" /></div>
        <button className="mt-6 w-full rounded-2xl bg-[#f4c15d] px-5 py-4 font-black text-[#17100a] shadow-xl shadow-[#f4c15d]/20 transition active:scale-[.98]">Entrar no sistema</button>
      </motion.form>
    </motion.section>
  );
}

function TopBar({ openDrawer, resetDemo, logout, current }: { openDrawer: () => void; resetDemo: () => void; logout: () => void; current: string }) {
  return (
    <header className="sticky top-3 z-20 mb-4 rounded-[1.6rem] border border-white/10 bg-[#120f0b]/88 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-4">
      <div className="flex items-center justify-between gap-3">
        <button onClick={openDrawer} className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f4c15d] text-2xl font-black text-[#17100a]">☰</button>
        <div className="min-w-0 flex-1">
          <Brand />
          <p className="mt-1 truncate text-xs text-stone-400">Tela atual: {current}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetDemo} className="hidden rounded-full border border-white/10 px-4 py-3 text-xs font-bold text-[#f4d18a] sm:block">Reset</button>
          <button onClick={logout} className="rounded-full bg-white/10 px-4 py-3 text-xs font-black text-white">Sair</button>
        </div>
      </div>
    </header>
  );
}

function Drawer({ open, close, current, select }: { open: boolean; close: () => void; current: Screen; select: (screen: Screen) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button aria-label="Fechar menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <motion.aside initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }} transition={{ type: "spring", damping: 28, stiffness: 240 }} className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-sm border-r border-white/10 bg-[#100d09] p-5 shadow-2xl shadow-black/60">
            <div className="mb-8 flex items-center justify-between">
              <Brand />
              <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl">×</button>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button key={item.id} onClick={() => select(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left font-black transition ${current === item.id ? "bg-[#f4c15d] text-[#17100a]" : "bg-white/[.06] text-stone-200"}`}>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/15 text-sm">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stats({ totals, owners, tenants, properties }: { totals: { paid: number; pending: number; transfers: number }; owners: number; tenants: number; properties: number }) {
  return (
    <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Clientes" value={String(tenants)} />
      <Stat label="Imóveis" value={String(properties)} />
      <Stat label="Recebido" value={money.format(totals.paid)} />
      <Stat label="Repasses" value={money.format(totals.transfers)} />
      <div className="hidden"><span>{owners}</span><span>{totals.pending}</span></div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-[1.35rem] border border-white/10 bg-white/[.07] p-4 backdrop-blur-xl"><p className="text-[11px] font-black uppercase tracking-[.18em] text-[#d9a441]">{label}</p><strong className="mt-1 block truncate text-lg tracking-[-0.04em] text-white">{value}</strong></article>;
}

function Inicio({ addTenant, tenants, setScreen }: { addTenant: (event: FormEvent<HTMLFormElement>) => void; tenants: Tenant[]; setScreen: (screen: Screen) => void }) {
  return (
    <ScreenWrap>
      <Card>
        <p className="eyebrow">Tela inicial</p>
        <h2 className="title">Cadastrar cliente</h2>
        <p className="mt-3 text-sm leading-6 text-stone-400">Entrada rápida para demonstração: o cliente/inquilino já nasce no sistema e fica salvo no celular pelo localStorage.</p>
        <TenantForm onSubmit={addTenant} button="Salvar cliente" />
      </Card>
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div><p className="eyebrow">Últimos clientes</p><h3 className="mt-1 text-2xl font-black tracking-[-0.05em] text-white">Base de inquilinos</h3></div>
          <button onClick={() => setScreen("inquilinos")} className="rounded-full bg-[#f4c15d] px-4 py-3 text-sm font-black text-[#17100a]">Ver</button>
        </div>
        <List>{tenants.slice(0, 4).map((tenant) => <TenantItem key={tenant.id} tenant={tenant} />)}</List>
      </Card>
    </ScreenWrap>
  );
}

function Proprietarios({ owners, addOwner }: { owners: Owner[]; addOwner: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <ScreenWrap>
      <Card><p className="eyebrow">Proprietários</p><h2 className="title">Novo proprietário</h2><form onSubmit={addOwner} className="mt-6 grid gap-4"><Input name="name" label="Nome completo" placeholder="Ex: Ana Souza" /><Input name="document" label="CPF/CNPJ" placeholder="000.000.000-00" /><Input name="email" label="E-mail" placeholder="ana@email.com" /><Input name="pix" label="Chave PIX" placeholder="CPF, telefone ou e-mail" /><div className="grid grid-cols-2 gap-3"><Input name="properties" label="Imóveis" placeholder="1" type="number" /><Input name="balance" label="Saldo inicial" placeholder="0" type="number" /></div><PrimaryButton>Salvar proprietário</PrimaryButton></form></Card>
      <Card><p className="eyebrow">Lista</p><h2 className="title">Cadastrados</h2><List>{owners.map((owner) => <OwnerItem key={owner.id} owner={owner} />)}</List></Card>
    </ScreenWrap>
  );
}

function Inquilinos({ tenants, addTenant, showForm, setShowForm }: { tenants: Tenant[]; addTenant: (event: FormEvent<HTMLFormElement>) => void; showForm: boolean; setShowForm: (value: boolean) => void }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Inquilinos</p><h2 className="title">Clientes</h2></div><button onClick={() => setShowForm(!showForm)} className="grid h-14 w-14 place-items-center rounded-full bg-[#f4c15d] text-3xl font-black text-[#17100a] shadow-xl shadow-[#f4c15d]/20">+</button></div>
      <AnimatePresence>{showForm && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><Card><TenantForm onSubmit={addTenant} button="Adicionar inquilino" /></Card></motion.div>}</AnimatePresence>
      <div className="grid gap-3 md:grid-cols-2">{tenants.map((tenant) => <TenantCard key={tenant.id} tenant={tenant} />)}</div>
    </motion.section>
  );
}

function Imoveis({ properties, owners, addProperty }: { properties: Property[]; owners: Owner[]; addProperty: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <ScreenWrap>
      <Card><p className="eyebrow">Imóveis</p><h2 className="title">Novo imóvel</h2><form onSubmit={addProperty} className="mt-6 grid gap-4"><Input name="name" label="Nome/apelido" placeholder="Apto 401 · Ed. Solar" /><Input name="address" label="Endereço" placeholder="Rua, número, bairro" /><Select name="owner" label="Proprietário" options={owners.map((owner) => owner.name)} /><Input name="rent" label="Aluguel base" placeholder="1500" type="number" /><PrimaryButton>Salvar imóvel</PrimaryButton></form></Card>
      <Card><p className="eyebrow">Portfólio</p><h2 className="title">Imóveis</h2><List>{properties.map((property) => <PropertyItem key={property.id} property={property} />)}</List></Card>
    </ScreenWrap>
  );
}

function Cobrancas({ tenants, properties, charges, addCharge, markAsPaid }: { tenants: Tenant[]; properties: Property[]; charges: Charge[]; addCharge: (event: FormEvent<HTMLFormElement>) => void; markAsPaid: (id: number) => void }) {
  return (
    <ScreenWrap>
      <Card><p className="eyebrow">Cobranças</p><h2 className="title">Gerar cobrança</h2><form onSubmit={addCharge} className="mt-6 grid gap-4"><Select name="property" label="Imóvel" options={properties.map((property) => property.name)} /><Select name="tenant" label="Inquilino" options={tenants.map((tenant) => tenant.name)} /><div className="grid grid-cols-2 gap-3"><Input name="amount" label="Valor" placeholder="1500" type="number" /><Input name="due" label="Vencimento" placeholder="25/05/2026" /></div><PrimaryButton>Criar cobrança</PrimaryButton></form></Card>
      <Card><p className="eyebrow">Baixa</p><h2 className="title">Recebimentos</h2><List>{charges.map((charge) => <ChargeItem key={charge.id} charge={charge} markAsPaid={markAsPaid} />)}</List></Card>
    </ScreenWrap>
  );
}

function Repasses({ owners, total }: { owners: Owner[]; total: number }) {
  return (
    <ScreenWrap>
      <Card><p className="eyebrow">Fechamento mensal</p><h2 className="title">Lote de repasse</h2><List>{owners.map((owner) => <OwnerItem key={owner.id} owner={owner} />)}</List></Card>
      <aside className="rounded-[2rem] bg-gradient-to-br from-[#ffe2a1] via-[#d9a441] to-[#8b5d16] p-6 text-[#17100a] shadow-2xl shadow-[#d9a441]/20"><p className="text-xs font-black uppercase tracking-[.24em]">Total previsto</p><strong className="mt-4 block text-5xl font-black tracking-[-0.08em]">{money.format(total)}</strong><p className="mt-5 leading-7">O MVP calcula o lote. A transferência automática real entra depois com integração bancária, aprovação e auditoria.</p><button className="mt-8 w-full rounded-2xl bg-[#17100a] px-5 py-4 font-black text-white">Gerar lote demonstrativo</button></aside>
    </ScreenWrap>
  );
}

function TenantForm({ onSubmit, button }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; button: string }) {
  return <form onSubmit={onSubmit} className="mt-6 grid gap-4"><Input name="name" label="Nome do cliente" placeholder="Ex: João Silva" /><Input name="document" label="CPF/CNPJ" placeholder="000.000.000-00" /><Input name="phone" label="Telefone" placeholder="+55 41 99999-0000" /><Input name="email" label="E-mail" placeholder="cliente@email.com" /><PrimaryButton>{button}</PrimaryButton></form>;
}

function Brand({ large = false }: { large?: boolean }) {
  return <div className="flex items-center gap-3"><div className={`${large ? "h-14 w-14" : "h-11 w-11"} grid place-items-center rounded-2xl bg-gradient-to-br from-[#ffe2a1] via-[#d9a441] to-[#805514] text-[#120f0b] shadow-xl shadow-[#d9a441]/25`}><span className="text-xl font-black">NC</span></div><div><p className="text-xs font-black uppercase tracking-[.28em] text-[#f8d991]">New Conecta</p><p className={`${large ? "text-base" : "text-xs"} text-stone-300`}>Imóveis · Cobranças · Repasses</p></div></div>;
}

function ScreenWrap({ children }: { children: React.ReactNode }) {
  return <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">{children}</motion.section>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-white/10 bg-[#120f0b]/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-6">{children}</div>;
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 space-y-3">{children}</div>;
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return <button className="rounded-2xl bg-[#f4c15d] px-5 py-4 font-black text-[#17100a] transition active:scale-[.98]">{children}</button>;
}

function TenantItem({ tenant }: { tenant: Tenant }) {
  return <div className="rounded-2xl bg-white/[.06] p-4"><strong className="text-white">{tenant.name}</strong><p className="mt-1 text-xs leading-5 text-stone-400">{tenant.phone} · {tenant.email}</p></div>;
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  return <article className="rounded-[1.6rem] border border-white/10 bg-white/[.075] p-4 backdrop-blur-xl"><div className="flex items-start justify-between gap-3"><div><strong className="text-white">{tenant.name}</strong><p className="mt-1 text-xs leading-5 text-stone-400">{tenant.document}<br />{tenant.phone}<br />{tenant.email}</p></div><span className="rounded-full bg-[#f4c15d] px-3 py-1 text-xs font-black text-[#17100a]">Cliente</span></div></article>;
}

function OwnerItem({ owner }: { owner: Owner }) {
  return <div className="rounded-2xl bg-white/[.06] p-4"><div className="flex items-start justify-between gap-3"><div><strong className="text-white">{owner.name}</strong><p className="mt-1 text-xs leading-5 text-stone-400">{owner.document}<br />PIX: {owner.pix}</p></div><strong className="text-[#f8d991]">{money.format(owner.balance)}</strong></div></div>;
}

function PropertyItem({ property }: { property: Property }) {
  return <div className="rounded-2xl bg-white/[.06] p-4"><strong className="text-white">{property.name}</strong><p className="mt-1 text-xs leading-5 text-stone-400">{property.address}<br />Proprietário: {property.owner}</p><p className="mt-2 text-sm font-black text-[#f8d991]">{money.format(property.rent)}</p></div>;
}

function ChargeItem({ charge, markAsPaid }: { charge: Charge; markAsPaid: (id: number) => void }) {
  return <article className="rounded-[1.4rem] bg-white/[.06] p-4"><div className="flex items-start justify-between gap-3"><div><strong className="text-white">{charge.property}</strong><p className="mt-1 text-xs leading-5 text-stone-400">{charge.tenant} · {charge.owner}<br />Venc. {charge.due}</p></div><strong className="text-[#f8d991]">{money.format(charge.amount)}</strong></div><button onClick={() => markAsPaid(charge.id)} className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black ${charge.status === "Pago" ? "bg-emerald-400/15 text-emerald-200" : "bg-[#f4c15d] text-[#17100a]"}`}>{charge.status === "Pago" ? "Pago" : "Marcar como pago"}</button></article>;
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="field-label">{label}<select name={name} className="field-input">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Input({ label, name, placeholder, type = "text", defaultValue, dark = false }: { label: string; name: string; placeholder: string; type?: string; defaultValue?: string; dark?: boolean }) {
  return <label className={dark ? "field-label-dark" : "field-label"}>{label}<input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} className={dark ? "field-input-dark" : "field-input"} /></label>;
}
