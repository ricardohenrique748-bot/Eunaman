-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'GESTOR', 'PCM', 'SEGURANCA', 'ESTOQUE', 'CUSTO', 'RH', 'OPERACIONAL');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('GERAL', 'PCM', 'FROTA', 'COLHEITA', 'SILVICULTURA', 'CARREGAMENTO', 'ALMOXARIFADO', 'RH', 'FINANCEIRO', 'SEGURANCA');

-- CreateEnum
CREATE TYPE "StatusOperacional" AS ENUM ('DISPONIVEL', 'EM_OPERACAO', 'EM_MANUTENCAO', 'PARADO', 'DESATIVADO');

-- CreateEnum
CREATE TYPE "TipoOS" AS ENUM ('PREVENTIVA', 'CORRETIVA', 'INSPECAO', 'MELHORIA');

-- CreateEnum
CREATE TYPE "StatusOS" AS ENUM ('ABERTA', 'PLANEJADA', 'EM_EXECUCAO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "TipoGatilho" AS ENUM ('KM', 'HORAS', 'DIAS');

-- CreateEnum
CREATE TYPE "StatusPreventiva" AS ENUM ('NO_PRAZO', 'ATENCAO', 'ATRASADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "empresa_padrao_id" TEXT,
    "unidade_padrao_id" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "trocar_senha" BOOLEAN NOT NULL DEFAULT true,
    "area" "Area" NOT NULL DEFAULT 'GERAL',

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome_fantasia" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" TEXT NOT NULL,
    "nome_unidade" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos_frota" (
    "id" TEXT NOT NULL,
    "codigo_interno" TEXT NOT NULL,
    "placa" TEXT,
    "tipo_veiculo" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "status_operacional" "StatusOperacional" NOT NULL,
    "km_atual" INTEGER NOT NULL DEFAULT 0,
    "horimetro_atual" INTEGER NOT NULL DEFAULT 0,
    "critico" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "categoria" TEXT,
    "modulo_sistema" TEXT,
    "data_atualizacao_horimetro" TIMESTAMP(3),
    "semana_preventiva" INTEGER,
    "prog_status" TEXT DEFAULT 'PENDENTE',
    "prog_progresso" INTEGER DEFAULT 0,
    "prog_modulo" TEXT,
    "prog_descricao" TEXT,
    "prog_data_inicio" TIMESTAMP(3),
    "prog_data_fim" TIMESTAMP(3),

    CONSTRAINT "veiculos_frota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" TEXT NOT NULL,
    "numero_os" SERIAL NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "tipo_os" "TipoOS" NOT NULL,
    "origem" TEXT,
    "descricao" TEXT NOT NULL,
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_planejada" TIMESTAMP(3),
    "data_inicio" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "status_os" "StatusOS" NOT NULL,
    "tempo_parada_horas" DOUBLE PRECISION,
    "responsavel_pcm" TEXT,
    "motivo_id" TEXT,
    "sistema_id" TEXT,
    "sub_sistema_id" TEXT,

    CONSTRAINT "ordens_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_manutencao" (
    "id" TEXT NOT NULL,
    "veiculo" TEXT NOT NULL,
    "tipo_manutencao" TEXT NOT NULL,
    "modulo" TEXT,
    "ultimo_horimetro" INTEGER NOT NULL DEFAULT 0,
    "intervalo_horas" INTEGER NOT NULL,
    "data_atualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_preventiva" "StatusPreventiva" NOT NULL DEFAULT 'NO_PRAZO',

    CONSTRAINT "planos_manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pneus_frota" (
    "id" TEXT NOT NULL,
    "codigo_pneu" TEXT NOT NULL,
    "medida" TEXT NOT NULL,
    "vida" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "veiculo_atual" TEXT,
    "posicao" TEXT,
    "sulco_atual_mm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pneus_frota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_parameters" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT NOT NULL DEFAULT 'GERAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os_motivos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "os_motivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os_sistemas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "os_sistemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os_sub_sistemas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sistema_id" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "os_sub_sistemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boletins_pneu" (
    "id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "km" INTEGER NOT NULL,
    "condicao" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boletins_pneu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_boletim_pneu" (
    "id" TEXT NOT NULL,
    "boletim_id" TEXT NOT NULL,
    "posicao" TEXT NOT NULL,
    "sulco_mm" DOUBLE PRECISION NOT NULL,
    "pneu_id" TEXT,

    CONSTRAINT "itens_boletim_pneu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_frota" (
    "id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "numero" TEXT,
    "data_emissao" TIMESTAMP(3),
    "data_validade" TIMESTAMP(3),

    CONSTRAINT "documentos_frota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backlog_pcm" (
    "id" TEXT NOT NULL,
    "semana" TEXT,
    "mes" TEXT,
    "ano" TEXT,
    "data_evidencia" TIMESTAMP(3),
    "modulo" TEXT,
    "regiao_programacao" TEXT,
    "dias_pendencia_aberta" INTEGER,
    "frota" TEXT,
    "tag" TEXT,
    "tipo" TEXT,
    "descricao_atividade" TEXT,
    "origem" TEXT,
    "criticidade" TEXT,
    "tempo_execucao_previsto" TEXT,
    "campo_base" TEXT,
    "os" TEXT,
    "material" TEXT,
    "numero_rc" TEXT,
    "numero_ordem" TEXT,
    "fornecedor" TEXT,
    "data_rc" TIMESTAMP(3),
    "detalhamento_pedido" TEXT,
    "data_necessidade_material" TIMESTAMP(3),
    "tipo_pedido" TEXT,
    "previsao_material" TIMESTAMP(3),
    "situacao_rc" TEXT,
    "dias_abertura_req_compras" INTEGER,
    "data_programacao" TIMESTAMP(3),
    "mao_de_obra" TEXT,
    "delta_evidencia_programacao" INTEGER,
    "status_programacao" TEXT,
    "previsao_conclusao_pendencia" TIMESTAMP(3),
    "data_conclusao_pendencia" TIMESTAMP(3),
    "dias_resolucao_pendencia" INTEGER,
    "status" TEXT,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backlog_pcm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_frota_codigo_interno_key" ON "veiculos_frota"("codigo_interno");

-- CreateIndex
CREATE UNIQUE INDEX "pneus_frota_codigo_pneu_key" ON "pneus_frota"("codigo_pneu");

-- CreateIndex
CREATE UNIQUE INDEX "system_parameters_key_key" ON "system_parameters"("key");

-- CreateIndex
CREATE UNIQUE INDEX "os_motivos_nome_key" ON "os_motivos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "os_sistemas_nome_key" ON "os_sistemas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "os_sub_sistemas_nome_sistema_id_key" ON "os_sub_sistemas"("nome", "sistema_id");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_frota_veiculo_id_tipo_key" ON "documentos_frota"("veiculo_id", "tipo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresa_padrao_id_fkey" FOREIGN KEY ("empresa_padrao_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidade_padrao_id_fkey" FOREIGN KEY ("unidade_padrao_id") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos_frota" ADD CONSTRAINT "veiculos_frota_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos_frota" ADD CONSTRAINT "veiculos_frota_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos_frota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_motivo_id_fkey" FOREIGN KEY ("motivo_id") REFERENCES "os_motivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_sistema_id_fkey" FOREIGN KEY ("sistema_id") REFERENCES "os_sistemas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_sub_sistema_id_fkey" FOREIGN KEY ("sub_sistema_id") REFERENCES "os_sub_sistemas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_manutencao" ADD CONSTRAINT "planos_manutencao_veiculo_fkey" FOREIGN KEY ("veiculo") REFERENCES "veiculos_frota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pneus_frota" ADD CONSTRAINT "pneus_frota_veiculo_atual_fkey" FOREIGN KEY ("veiculo_atual") REFERENCES "veiculos_frota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os_sub_sistemas" ADD CONSTRAINT "os_sub_sistemas_sistema_id_fkey" FOREIGN KEY ("sistema_id") REFERENCES "os_sistemas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletins_pneu" ADD CONSTRAINT "boletins_pneu_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos_frota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_boletim_pneu" ADD CONSTRAINT "itens_boletim_pneu_boletim_id_fkey" FOREIGN KEY ("boletim_id") REFERENCES "boletins_pneu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_boletim_pneu" ADD CONSTRAINT "itens_boletim_pneu_pneu_id_fkey" FOREIGN KEY ("pneu_id") REFERENCES "pneus_frota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_frota" ADD CONSTRAINT "documentos_frota_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos_frota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

