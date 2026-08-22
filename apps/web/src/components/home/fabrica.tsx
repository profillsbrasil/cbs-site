"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";

// biome-ignore-end lint: diretiva do React Compiler

import { useMemo } from "react";
import {
	BoxGeometry,
	type BufferGeometry,
	CanvasTexture,
	CylinderGeometry,
	EdgesGeometry,
	ExtrudeGeometry,
	Group,
	LatheGeometry,
	LineBasicMaterial,
	LineSegments,
	type Material,
	Mesh,
	MeshStandardMaterial,
	type Object3D,
	PlaneGeometry,
	Shape,
	SRGBColorSpace,
	type Texture,
	TorusGeometry,
	Vector2,
} from "three";

/**
 * Fábrica da CBS no estilo "maquete de arquiteto": volumes brancos foscos de
 * cantos suavizados, arestas de nanquim navy a 35%, telhado shed de três
 * dentes, parque de tanques com guarda-corpo e tubulação aqua. Azul e aqua
 * só como acento (faixa CBS, portas de doca, tampas, claraboias, tubos).
 *
 * Transcrição do protótipo aprovado (three.js puro) para R3F: as peças são
 * montadas uma vez em `useMemo`, com um material por cor e uma geometria por
 * peça, e entram na cena por `<primitive>`. Sem animação própria — quem
 * balança é o `Float` da vinheta.
 */

// ── Paleta (só tokens de marca + cinzas já usados nos modelos) ─────────────
const GESSO = "#ffffff"; // volumes principais
const CINZA = "#d3dde4"; // anexos, lajes técnicas, paletes
const CINZA_ESC = "#c3ced6"; // plinto, marquise, plataformas
const NAVY = "#16232f"; // guarda-corpo, montantes, ferragem
const NAVY_ESC = "#0f1c2b"; // linhas de aresta
const AZUL = "#1d9dd8"; // acento de marca
const AQUA = "#a8e0f0"; // claraboias e tubulação

// ── Cotas (cubo de ~2.4) ───────────────────────────────────────────────────
const PLINTO_L = 2.34;
const PLINTO_P = 1.7;
const PLINTO_H = 0.06;
const SOLO = PLINTO_H; // topo do plinto = "chão" da maquete

const GAL_L = 1.1; // galpão de produção
const GAL_P = 0.9;
const GAL_H = 0.66;
const GAL_X = -0.5;
const GAL_Z = 0;
const GAL_TETO = SOLO + GAL_H; // 0.72
const GAL_FACHADA_Z = GAL_Z + GAL_P / 2; // 0.45
const GAL_LESTE_X = GAL_X + GAL_L / 2; // 0.05

const DENTES = 3;
const DENTE_L = GAL_L / DENTES;
const DENTE_H = 0.28;

const ENV_L = 0.75; // ala de envase
const ENV_P = 0.6;
const ENV_H = 0.38;
const ENV_X = 0.425;
const ENV_Z = 0.2;
const ENV_TETO = SOLO + ENV_H; // 0.44

const LAJE_L = 1.0; // laje técnica dos tanques
const LAJE_P = 0.6;
const LAJE_H = 0.07;
const LAJE_X = 0.6;
const LAJE_Z = -0.5;
const LAJE_TOPO = SOLO + LAJE_H; // 0.13

const TQ_R = 0.155; // tanques de mistura
const TQ_H = 0.4;
const TQ_Y = LAJE_TOPO + TQ_H / 2;
const TQ_TOPO = LAJE_TOPO + TQ_H; // 0.53
const TQ1_X = 0.3;
const TQ2_X = 0.64;
const TQ_Z = -0.5;

const SILO_X = 0.98; // silo de água (lathe)
const SILO_Z = -0.55;
const SILO_R = 0.125;
const SILO_H = 0.66;

const DOCA_X = -0.62; // doca de carga
const DOCA_L = 0.9;
const DOCA_H = 0.16;
const DOCA_P = 0.3;
const DOCA_TOPO = SOLO + DOCA_H; // 0.22
const DOCA_Z = GAL_FACHADA_Z + DOCA_P / 2; // 0.6

// Faixa "CBS" na fachada do galpão. A pilha vertical da fachada é, de baixo
// para cima: portas de doca (topo 0.47) → marquise (0.4875–0.5225) → faixa
// (0.545–0.715) → beiral do shed (0.72). O olho da pose está 24° acima do
// horizonte, então o que está abaixo da faixa nunca a encobre.
const FAIXA_L = 0.9;
const FAIXA_H = 0.17;
const FAIXA_Y = 0.63;
/** 16 mm à frente do reboco: acima dos 14 mm que separam aplique de sólido. */
const FAIXA_SALIENCIA = 0.016;

const PORTA_DOCA_H = 0.26; // moldura; topo em 0.47, abaixo da marquise
const PORTA_DOCA_Y = DOCA_TOPO + 0.12; // 0.34

const MARQUISE_Y = 0.505; // eixo da laje; 0.035 de espessura
const MARQUISE_BALANCO = 0.16; // saliência à frente da fachada (era 0.28)

const TUBO_Z = -0.13; // eixo do rack de tubulação
const TUBO_Y1 = 0.6;
const TUBO_Y2 = 0.545;
const TUBO_R = 0.013;
const COT_R = 0.035; // raio do cotovelo dos ramais

const ESCADA_X = 0.9;
const ESCADA_ANG = -0.735; // atan2(0.38, 0.42), subindo para +Z
const ESCADA_COMP = 0.566;

/** Altura total (topo do plinto até a crista do shed). */
export const FABRICA_ALTURA = GAL_TETO + DENTE_H; // 1.0

/**
 * Esfera envolvente da maquete (2.34 x 1.00 x 1.70) tem raio 1.55 — o mesmo
 * raio da bolha da estação. 1/1.2 deixa a folga de 20% pedida pelo estilo.
 */
const FABRICA_ESCALA = 0.83;

/** 3/4 elevado do protótipo: câmera em [3.6, 2.6, 4.05] olhando a origem. */
const FABRICA_ROT: Vec3 = [0.42, -0.72, 0];

type Vec3 = [number, number, number];

// ── Textura canvas da faixa "CBS" ──────────────────────────────────────────
const FAIXA_TEX_W = 1024;
const FAIXA_TEX_H = 192; // 1024/192 = 5.33, a razão do plano 0.90 × 0.17

function makeFaixaTexture(): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = FAIXA_TEX_W;
	canvas.height = FAIXA_TEX_H;
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return texture;
	}
	const paint = () => {
		// Fundo opaco: alfa zero viraria preto num material sem `transparent`.
		ctx.fillStyle = AZUL;
		ctx.fillRect(0, 0, FAIXA_TEX_W, FAIXA_TEX_H);
		// Filete navy rente à borda inferior.
		ctx.fillStyle = NAVY_ESC;
		ctx.fillRect(0, FAIXA_TEX_H - 13, FAIXA_TEX_W, 13);
		ctx.fillStyle = "#ffffff";
		ctx.font = 'bold 184px Sora, "Sora Fallback", sans-serif';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.letterSpacing = "14px";
		ctx.fillText("CBS", FAIXA_TEX_W / 2, FAIXA_TEX_H / 2 - 7);
		// Traços brancos flanqueando a marca (ritmo de fachada).
		ctx.fillStyle = "rgba(255,255,255,0.5)";
		ctx.fillRect(
			FAIXA_TEX_W * 0.06,
			FAIXA_TEX_H / 2 - 5,
			FAIXA_TEX_W * 0.16,
			10
		);
		ctx.fillRect(
			FAIXA_TEX_W * 0.78,
			FAIXA_TEX_H / 2 - 5,
			FAIXA_TEX_W * 0.16,
			10
		);
		texture.needsUpdate = true;
	};
	paint();
	// Sora chega assíncrona: repinta quando a fonte carregar.
	document.fonts?.load('bold 184px "Sora"').then(paint).catch(paint);
	return texture;
}

// ── Materiais foscos (roughness 0.7–0.9, sem clearcoat) ────────────────────
/** Um material por cor de fato: cores iguais compartilham a mesma instância. */
interface Mats {
	aqua: MeshStandardMaterial;
	azul: MeshStandardMaterial;
	cinza: MeshStandardMaterial;
	cinzaEsc: MeshStandardMaterial;
	faixa: MeshStandardMaterial;
	gesso: MeshStandardMaterial;
	linha: LineBasicMaterial;
	navy: MeshStandardMaterial;
}

function criarMateriais(): Mats {
	const fosco = (color: string, roughness: number) =>
		new MeshStandardMaterial({ color, roughness });
	return {
		aqua: fosco(AQUA, 0.7),
		azul: fosco(AZUL, 0.7),
		cinza: fosco(CINZA, 0.85),
		cinzaEsc: fosco(CINZA_ESC, 0.85),
		faixa: new MeshStandardMaterial({
			color: AZUL,
			map: makeFaixaTexture(),
			roughness: 0.7,
		}),
		gesso: fosco(GESSO, 0.8),
		// Nanquim: uma linha fina por aresta, navy a 35%.
		linha: new LineBasicMaterial({
			color: NAVY_ESC,
			depthWrite: false,
			opacity: 0.35,
			transparent: true,
		}),
		navy: fosco(NAVY, 0.75),
	};
}

// ── Helpers de geometria ───────────────────────────────────────────────────
const BISEL = 0.016;

function retanguloArredondado(w: number, d: number, r: number): Shape {
	const x = w / 2;
	const z = d / 2;
	const raio = Math.min(r, x * 0.9, z * 0.9);
	const shape = new Shape();
	shape.moveTo(-x + raio, -z);
	shape.lineTo(x - raio, -z);
	shape.quadraticCurveTo(x, -z, x, -z + raio);
	shape.lineTo(x, z - raio);
	shape.quadraticCurveTo(x, z, x - raio, z);
	shape.lineTo(-x + raio, z);
	shape.quadraticCurveTo(-x, z, -x, z - raio);
	shape.lineTo(-x, -z + raio);
	shape.quadraticCurveTo(-x, -z, -x + raio, -z);
	return shape;
}

/**
 * Caixa com as 12 arestas suavizadas: cantos verticais pelo shape
 * arredondado, topo e base pelo bevel do extrude.
 */
function volumeGeometry(w: number, h: number, d: number, raio: number) {
	const bisel = Math.min(BISEL, h * 0.3, w * 0.3, d * 0.3);
	// O bevel do extrude cresce para fora: o shape entra menor pelo bisel para
	// o sólido fechar exatamente em w × h × d. Sem isso a parede fica 32mm mais
	// gorda e engole os apliques colados nela (faixa, janelas, portas).
	const geometry = new ExtrudeGeometry(
		retanguloArredondado(w - 2 * bisel, d - 2 * bisel, raio),
		{
			bevelEnabled: true,
			bevelSegments: 2,
			bevelSize: bisel,
			bevelThickness: bisel,
			curveSegments: 4,
			depth: Math.max(h - 2 * bisel, 0.002),
			steps: 1,
		}
	);
	geometry.rotateX(-Math.PI / 2);
	geometry.center();
	return geometry;
}

interface CaixaOpts {
	arestas?: boolean;
	raio?: number;
	segmentos?: number;
}

/** Fábrica de peças: tudo entra no mesmo grupo raiz. */
function criarBuilder(root: Group, mats: Mats) {
	const colocar = (obj: Object3D, pos: Vec3, rot?: Vec3 | null) => {
		obj.position.set(pos[0], pos[1], pos[2]);
		if (rot) {
			obj.rotation.set(rot[0], rot[1], rot[2]);
		}
		root.add(obj);
		return obj;
	};

	const arestas = (
		geometry: BufferGeometry,
		pos: Vec3,
		rot?: Vec3 | null,
		limite = 24
	) => {
		const linhas = new LineSegments(
			new EdgesGeometry(geometry, limite),
			mats.linha
		);
		colocar(linhas, pos, rot);
	};

	/** Volume de maquete: sólido biselado + nanquim da caixa RETA. */
	const volume = (
		nome: string,
		dims: Vec3,
		material: Material,
		pos: Vec3,
		rot?: Vec3 | null,
		opts: CaixaOpts = {}
	) => {
		const mesh = new Mesh(
			volumeGeometry(dims[0], dims[1], dims[2], opts.raio ?? 0.022),
			material
		);
		mesh.name = nome;
		colocar(mesh, pos, rot);
		// Nanquim tirado da caixa reta: uma linha por aresta, sem o duplo
		// contorno que o bisel geraria.
		arestas(new BoxGeometry(dims[0], dims[1], dims[2]), pos, rot);
	};

	/** Peça fina (montante, corrimão, mullion, painel): caixa reta. */
	const caixa = (
		nome: string,
		dims: Vec3,
		material: Material,
		pos: Vec3,
		rot?: Vec3 | null,
		opts: CaixaOpts = {}
	) => {
		const mesh = new Mesh(new BoxGeometry(dims[0], dims[1], dims[2]), material);
		mesh.name = nome;
		colocar(mesh, pos, rot);
		if (opts.arestas) {
			arestas(new BoxGeometry(dims[0], dims[1], dims[2]), pos, rot);
		}
	};

	const cilindro = (
		nome: string,
		dims: Vec3,
		material: Material,
		pos: Vec3,
		rot?: Vec3 | null,
		opts: CaixaOpts = {}
	) => {
		const geometry = new CylinderGeometry(
			dims[0],
			dims[1],
			dims[2],
			opts.segmentos ?? 32
		);
		const mesh = new Mesh(geometry, material);
		mesh.name = nome;
		colocar(mesh, pos, rot);
		if (opts.arestas !== false) {
			arestas(geometry, pos, rot);
		}
	};

	/** Guarda-corpo navy: dois filetes horizontais + montantes regulares. */
	const guardaCorpo = (
		nome: string,
		pontos: [number, number][],
		yBase: number,
		altura: number,
		passo: number
	) => {
		for (let i = 0; i < pontos.length - 1; i += 1) {
			const [x0, z0] = pontos[i];
			const [x1, z1] = pontos[i + 1];
			const dx = x1 - x0;
			const dz = z1 - z0;
			const comprimento = Math.hypot(dx, dz);
			if (comprimento < 0.001) {
				continue;
			}
			const angulo = -Math.atan2(dz, dx);
			const meioX = (x0 + x1) / 2;
			const meioZ = (z0 + z1) / 2;
			for (const fracao of [1, 0.55]) {
				caixa(
					`${nome}-filete`,
					[comprimento, 0.011, 0.011],
					mats.navy,
					[meioX, yBase + altura * fracao, meioZ],
					[0, angulo, 0]
				);
			}
			const total = Math.max(2, Math.round(comprimento / passo));
			// O extremo inicial só é gerado no primeiro segmento: nos cantos ele
			// coincide com o extremo final do segmento anterior e os dois montantes
			// brigavam por z-fight.
			for (let k = i === 0 ? 0 : 1; k <= total; k += 1) {
				const t = k / total;
				caixa(`${nome}-montante`, [0.013, altura, 0.013], mats.navy, [
					x0 + dx * t,
					yBase + altura / 2,
					z0 + dz * t,
				]);
			}
		}
	};

	/** Tubo aqua reto entre dois pontos no mesmo plano (X, Y ou Z). */
	const tubo = (nome: string, a: Vec3, b: Vec3, raio: number) => {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const dz = b[2] - a[2];
		const comprimento = Math.hypot(dx, dy, dz);
		const meio: Vec3 = [
			(a[0] + b[0]) / 2,
			(a[1] + b[1]) / 2,
			(a[2] + b[2]) / 2,
		];
		let rot: Vec3 | null = null;
		if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) {
			rot = [0, 0, Math.PI / 2];
		} else if (Math.abs(dz) > Math.abs(dy)) {
			rot = [Math.PI / 2, 0, 0];
		}
		cilindro(nome, [raio, raio, comprimento], mats.aqua, meio, rot, {
			arestas: false,
			segmentos: 12,
		});
	};

	const malha = (
		nome: string,
		geometry: BufferGeometry,
		material: Material,
		pos: Vec3,
		rot?: Vec3 | null
	) => {
		const mesh = new Mesh(geometry, material);
		mesh.name = nome;
		colocar(mesh, pos, rot);
	};

	return { arestas, caixa, cilindro, guardaCorpo, malha, tubo, volume };
}

type Builder = ReturnType<typeof criarBuilder>;

// ── 1. Plinto e pátio ──────────────────────────────────────────────────────
function montarPlinto(b: Builder, m: Mats) {
	b.volume(
		"plinto-base",
		[PLINTO_L, PLINTO_H, PLINTO_P],
		m.cinzaEsc,
		[0, PLINTO_H / 2, 0],
		null,
		{ raio: 0.03 }
	);
	// Pátio de manobra em frente à doca.
	b.caixa("patio-manobra", [1.14, 0.006, 0.34], m.cinza, [
		-0.55,
		SOLO + 0.003,
		0.66,
	]);
	for (let i = 0; i < 5; i += 1) {
		b.caixa("patio-marcacao", [0.11, 0.008, 0.035], m.gesso, [
			-1.02 + i * 0.2,
			SOLO + 0.004,
			0.79,
		]);
	}
}

// ── 2. Galpão de produção + telhado shed ───────────────────────────────────
function montarGalpao(b: Builder, m: Mats) {
	b.volume("galpao-producao", [GAL_L, GAL_H, GAL_P], m.gesso, [
		GAL_X,
		SOLO + GAL_H / 2,
		GAL_Z,
	]);
	// Casa de máquinas encostada nos fundos (-Z).
	b.volume("casa-de-maquinas", [0.5, 0.22, 0.22], m.cinza, [
		-0.85,
		SOLO + 0.11,
		GAL_Z - GAL_P / 2 - 0.1,
	]);

	// Telhado shed: perfil único extrudado na profundidade do galpão. Cada
	// dente sobe da esquerda e cai vertical — a queda é a claraboia.
	const perfil = new Shape();
	perfil.moveTo(-GAL_L / 2, 0);
	for (let i = 0; i < DENTES; i += 1) {
		const xDireita = -GAL_L / 2 + (i + 1) * DENTE_L;
		perfil.lineTo(xDireita, DENTE_H);
		perfil.lineTo(xDireita, 0);
	}
	perfil.closePath();
	const shed = new ExtrudeGeometry(perfil, {
		bevelEnabled: false,
		depth: GAL_P,
		steps: 1,
	});
	const shedPos: Vec3 = [GAL_X, GAL_TETO, GAL_Z - GAL_P / 2];
	b.malha("telhado-shed", shed, m.gesso, shedPos);
	b.arestas(shed, shedPos, null, 20);

	// Faixa "CBS": a única superfície grande com a marca, na fachada do galpão
	// (a maior da maquete). Fica na faixa livre entre a marquise da doca e o
	// beiral do shed, 16 mm à frente do reboco.
	b.malha("faixa-cbs", new PlaneGeometry(FAIXA_L, FAIXA_H), m.faixa, [
		GAL_X,
		FAIXA_Y,
		GAL_FACHADA_Z + FAIXA_SALIENCIA,
	]);

	// Claraboias nas faces verticais + montantes navy.
	const claraboiaH = DENTE_H - 0.05;
	for (let i = 0; i < DENTES; i += 1) {
		const xFace = GAL_X - GAL_L / 2 + (i + 1) * DENTE_L;
		const yFace = GAL_TETO + claraboiaH / 2 + 0.02;
		b.caixa("claraboia", [0.016, claraboiaH, GAL_P - 0.06], m.aqua, [
			xFace + 0.01,
			yFace,
			GAL_Z,
		]);
		for (const lado of [-1, 1]) {
			b.caixa("claraboia-montante", [0.021, claraboiaH, 0.011], m.navy, [
				xFace + 0.011,
				yFace,
				GAL_Z + lado * 0.21,
			]);
		}
	}
}

// ── 3. Doca de carga ───────────────────────────────────────────────────────
/** Mão-francesa: da ponta da marquise de volta ao reboco, por baixo da laje. */
function montarMaosFrancesas(b: Builder, m: Mats) {
	const pontaY = MARQUISE_Y - 0.0175;
	const pontaZ = GAL_FACHADA_Z + MARQUISE_BALANCO - 0.005;
	const paredeY = 0.395;
	const paredeZ = GAL_FACHADA_Z + 0.005;
	const dy = paredeY - pontaY;
	const dz = paredeZ - pontaZ;
	// O eixo longo da caixa é o +Y local: girar em X por atan2(dz, dy) o deita
	// exatamente sobre a diagonal ponta → parede.
	const angulo = Math.atan2(dz, dy);
	for (const maoX of [-1.02, -0.22]) {
		b.caixa(
			"mao-francesa-marquise",
			[0.014, Math.hypot(dy, dz), 0.014],
			m.navy,
			[maoX, (pontaY + paredeY) / 2, (pontaZ + paredeZ) / 2],
			[angulo, 0, 0]
		);
	}
}

function montarDoca(b: Builder, m: Mats) {
	b.volume("plataforma-doca", [DOCA_L, DOCA_H, DOCA_P], m.cinzaEsc, [
		DOCA_X,
		SOLO + DOCA_H / 2,
		DOCA_Z,
	]);
	for (const portaX of [-0.82, -0.42]) {
		b.caixa("porta-doca-moldura", [0.3, PORTA_DOCA_H, 0.016], m.navy, [
			portaX,
			PORTA_DOCA_Y,
			GAL_FACHADA_Z + 0.008,
		]);
		b.caixa("porta-doca", [0.24, PORTA_DOCA_H - 0.06, 0.016], m.azul, [
			portaX,
			PORTA_DOCA_Y,
			GAL_FACHADA_Z + 0.018,
		]);
	}
	// Marquise em balanço: encurtada de 0.28 para 0.16 de saliência e baixada
	// para o topo das portas, liberando a faixa da marca acima dela.
	b.volume(
		"marquise-doca",
		[0.98, 0.035, MARQUISE_BALANCO + 0.02],
		m.cinzaEsc,
		[DOCA_X, MARQUISE_Y, GAL_FACHADA_Z + MARQUISE_BALANCO / 2],
		null,
		{ raio: 0.012 }
	);
	// Mãos-francesas navy: da ponta da marquise de volta ao reboco, por baixo
	// da laje (o tirante anterior, quase deitado, não escorava nada). Ficam nos
	// dois pilares laterais, fora do vão das portas e abaixo da faixa.
	montarMaosFrancesas(b, m);
	// Balizadores no limite do pátio.
	for (let i = 0; i < 3; i += 1) {
		b.cilindro(
			"balizador",
			[0.016, 0.016, 0.09],
			m.navy,
			[-1.0 + i * 0.38, SOLO + 0.045, 0.82],
			null,
			{ arestas: false, segmentos: 10 }
		);
	}
	// Palete e tambor no pátio.
	b.volume(
		"palete",
		[0.16, 0.05, 0.13],
		m.cinza,
		[-0.05, SOLO + 0.025, 0.72],
		[0, 0.22, 0],
		{ raio: 0.008 }
	);
	b.cilindro(
		"tambor",
		[0.05, 0.05, 0.1],
		m.gesso,
		[-0.05, SOLO + 0.1, 0.72],
		null,
		{ segmentos: 20 }
	);
	b.cilindro(
		"tambor-tampa",
		[0.052, 0.052, 0.016],
		m.azul,
		[-0.05, SOLO + 0.158, 0.72],
		null,
		{ segmentos: 20 }
	);
}

// ── 4. Ala de envase + unidades de telhado ─────────────────────────────────
function montarEnvase(b: Builder, m: Mats) {
	b.volume("ala-envase", [ENV_L, ENV_H, ENV_P], m.cinza, [
		ENV_X,
		SOLO + ENV_H / 2,
		ENV_Z,
	]);
	// Fita de janela contínua na fachada (+Z) e na lateral (+X).
	b.caixa("janela-fita-frente", [0.62, 0.11, 0.016], m.aqua, [
		ENV_X,
		SOLO + 0.25,
		ENV_Z + ENV_P / 2 + 0.005,
	]);
	b.caixa("janela-fita-lateral", [0.016, 0.11, 0.46], m.aqua, [
		ENV_X + ENV_L / 2 + 0.005,
		SOLO + 0.25,
		ENV_Z,
	]);
	for (let i = 0; i < 3; i += 1) {
		b.caixa("janela-montante", [0.011, 0.115, 0.021], m.navy, [
			ENV_X - 0.2 + i * 0.2,
			SOLO + 0.25,
			ENV_Z + ENV_P / 2 + 0.011,
		]);
	}
	b.caixa("porta-pessoal", [0.09, 0.16, 0.016], m.azul, [
		ENV_X + 0.28,
		SOLO + 0.08,
		ENV_Z + ENV_P / 2 + 0.006,
	]);
	// Unidades de tratamento de ar no telhado.
	b.volume(
		"unidade-telhado-a",
		[0.2, 0.11, 0.16],
		m.cinza,
		[0.22, ENV_TETO + 0.055, 0.1],
		null,
		{ raio: 0.012 }
	);
	for (let i = 0; i < 3; i += 1) {
		b.caixa("unidade-veneziana", [0.16, 0.012, 0.008], m.navy, [
			0.22,
			ENV_TETO + 0.028 + i * 0.026,
			0.181,
		]);
	}
	b.volume(
		"unidade-telhado-b",
		[0.15, 0.09, 0.13],
		m.cinza,
		[0.6, ENV_TETO + 0.045, 0.34],
		null,
		{ raio: 0.012 }
	);
	b.cilindro(
		"exaustor",
		[0.05, 0.05, 0.014],
		m.navy,
		[0.6, ENV_TETO + 0.097, 0.34],
		null,
		{ segmentos: 18 }
	);
	// Guarda-corpo do telhado, aberto no canto (+X, +Z) onde a escada chega.
	b.guardaCorpo(
		"guarda-corpo-telhado",
		[
			[ENV_X + ENV_L / 2 - 0.08, ENV_Z + ENV_P / 2 - 0.02],
			[ENV_X - ENV_L / 2 + 0.02, ENV_Z + ENV_P / 2 - 0.02],
			[ENV_X - ENV_L / 2 + 0.02, ENV_Z - ENV_P / 2 + 0.02],
			[ENV_X + ENV_L / 2 - 0.02, ENV_Z - ENV_P / 2 + 0.02],
			[ENV_X + ENV_L / 2 - 0.02, ENV_Z + 0.1],
		],
		ENV_TETO,
		0.085,
		0.16
	);
}

// ── 5. Escada externa até o telhado da ala ─────────────────────────────────
function montarEscada(b: Builder, m: Mats) {
	b.caixa(
		"escada-rampa",
		[0.2, 0.028, ESCADA_COMP],
		m.cinzaEsc,
		[ESCADA_X, (SOLO + ENV_TETO) / 2, 0.24],
		[ESCADA_ANG, 0, 0],
		{ arestas: true }
	);
	for (let i = 0; i < 6; i += 1) {
		const t = (i + 0.5) / 6;
		b.caixa(
			"escada-degrau",
			[0.19, 0.007, 0.02],
			m.navy,
			[ESCADA_X, SOLO + 0.022 + (ENV_TETO - SOLO) * t, 0.03 + 0.42 * t],
			[ESCADA_ANG, 0, 0]
		);
	}
	for (const lado of [-1, 1]) {
		b.caixa(
			"escada-corrimao",
			[0.012, 0.012, ESCADA_COMP],
			m.navy,
			[ESCADA_X + lado * 0.095, (SOLO + ENV_TETO) / 2 + 0.095, 0.24],
			[ESCADA_ANG, 0, 0]
		);
	}
	b.volume(
		"escada-patamar",
		[0.16, 0.028, 0.16],
		m.cinzaEsc,
		[0.86, ENV_TETO - 0.014, 0.42],
		null,
		{ raio: 0.01 }
	);
}

// ── 6. Parque de tanques: laje, mistura, silo de água ──────────────────────
function montarTanque(b: Builder, m: Mats, tanqueX: number) {
	b.cilindro(
		"tanque-mistura",
		[TQ_R, TQ_R, TQ_H],
		m.gesso,
		[tanqueX, TQ_Y, TQ_Z],
		null,
		{ segmentos: 36 }
	);
	// Cinta navy na base (acento estrutural).
	b.cilindro(
		"tanque-cinta",
		[TQ_R + 0.006, TQ_R + 0.006, 0.022],
		m.navy,
		[tanqueX, LAJE_TOPO + 0.03, TQ_Z],
		null,
		{ arestas: false, segmentos: 36 }
	);
	// Tampa azul (acento de marca).
	b.cilindro(
		"tanque-tampa",
		[TQ_R * 0.97, TQ_R + 0.005, 0.03],
		m.azul,
		[tanqueX, TQ_TOPO + 0.015, TQ_Z],
		null,
		{ segmentos: 36 }
	);
	// Guarda-corpo circular no topo.
	b.malha(
		"tanque-guarda-corpo",
		new TorusGeometry(TQ_R - 0.01, 0.008, 8, 28),
		m.navy,
		[tanqueX, TQ_TOPO + 0.11, TQ_Z],
		[Math.PI / 2, 0, 0]
	);
	for (let i = 0; i < 4; i += 1) {
		const a = (i / 4) * Math.PI * 2 + 0.4;
		b.caixa("tanque-guarda-montante", [0.012, 0.1, 0.012], m.navy, [
			tanqueX + Math.cos(a) * (TQ_R - 0.01),
			TQ_TOPO + 0.06,
			TQ_Z + Math.sin(a) * (TQ_R - 0.01),
		]);
	}
}

function montarSilo(b: Builder, m: Mats) {
	const perfil = [
		[0, 0],
		[SILO_R * 0.92, 0],
		[SILO_R, 0.025],
		[SILO_R, 0.5],
		[SILO_R * 0.94, 0.54],
		[SILO_R * 0.55, 0.61],
		[0.012, SILO_H],
	].map(([r, y]) => new Vector2(r, y));
	const silo = new LatheGeometry(perfil, 36);
	const siloPos: Vec3 = [SILO_X, LAJE_TOPO, SILO_Z];
	b.malha("silo-agua", silo, m.gesso, siloPos);
	b.arestas(silo, siloPos);
	b.cilindro(
		"silo-respiro",
		[0.028, 0.028, 0.04],
		m.azul,
		[SILO_X, LAJE_TOPO + SILO_H + 0.018, SILO_Z],
		null,
		{ segmentos: 16 }
	);
	b.cilindro(
		"silo-cinta",
		[SILO_R + 0.005, SILO_R + 0.005, 0.018],
		m.navy,
		[SILO_X, LAJE_TOPO + 0.045, SILO_Z],
		null,
		{ arestas: false, segmentos: 36 }
	);
}

function montarParque(b: Builder, m: Mats) {
	b.volume(
		"laje-tecnica",
		[LAJE_L, LAJE_H, LAJE_P],
		m.cinza,
		[LAJE_X, SOLO + LAJE_H / 2, LAJE_Z],
		null,
		{ raio: 0.014 }
	);
	b.guardaCorpo(
		"guarda-corpo-laje",
		[
			[LAJE_X - LAJE_L / 2 + 0.03, LAJE_Z + LAJE_P / 2 - 0.03],
			[LAJE_X - LAJE_L / 2 + 0.03, LAJE_Z - LAJE_P / 2 + 0.03],
			[LAJE_X + LAJE_L / 2 - 0.03, LAJE_Z - LAJE_P / 2 + 0.03],
			[LAJE_X + LAJE_L / 2 - 0.03, LAJE_Z + LAJE_P / 2 - 0.03],
		],
		LAJE_TOPO,
		0.1,
		0.17
	);
	for (const tanqueX of [TQ1_X, TQ2_X]) {
		montarTanque(b, m, tanqueX);
	}
	// Escada de marinheiro no tanque 1.
	for (const lado of [-1, 1]) {
		b.caixa("escada-marinheiro-longarina", [0.01, 0.44, 0.01], m.navy, [
			TQ1_X + TQ_R + 0.022,
			LAJE_TOPO + 0.22,
			TQ_Z + lado * 0.05,
		]);
	}
	for (let i = 0; i < 7; i += 1) {
		b.caixa("escada-marinheiro-degrau", [0.008, 0.008, 0.1], m.navy, [
			TQ1_X + TQ_R + 0.022,
			LAJE_TOPO + 0.05 + i * 0.06,
			TQ_Z,
		]);
	}
	montarSilo(b, m);
}

// ── 7. Tubulação aqua: rack, ramais e cotovelos ────────────────────────────
function montarTubulacao(b: Builder, m: Mats) {
	b.tubo(
		"rack-tubo-superior",
		[1.02, TUBO_Y1, TUBO_Z],
		[0.06, TUBO_Y1, TUBO_Z],
		TUBO_R
	);
	b.tubo(
		"rack-tubo-inferior",
		[1.02, TUBO_Y2, TUBO_Z],
		[0.06, TUBO_Y2, TUBO_Z],
		TUBO_R * 0.85
	);
	for (const posteX of [0.9, 0.3]) {
		b.caixa("rack-poste", [0.022, TUBO_Y1 + 0.02 - SOLO, 0.022], m.navy, [
			posteX,
			(SOLO + TUBO_Y1 + 0.02) / 2,
			TUBO_Z,
		]);
	}
	// Ramais dos tanques: prumo curto → cotovelo → horizontal.
	for (const tanqueX of [TQ1_X, TQ2_X]) {
		b.tubo(
			"ramal-prumo",
			[tanqueX, TQ_TOPO + 0.02, TQ_Z],
			[tanqueX, TUBO_Y1 - COT_R, TQ_Z],
			TUBO_R
		);
		b.malha(
			"ramal-cotovelo",
			new TorusGeometry(COT_R, TUBO_R, 8, 14, Math.PI / 2),
			m.aqua,
			[tanqueX, TUBO_Y1 - COT_R, TQ_Z + COT_R],
			[0, Math.PI / 2, 0]
		);
		b.tubo(
			"ramal-horizontal",
			[tanqueX, TUBO_Y1, TQ_Z + COT_R],
			[tanqueX, TUBO_Y1, TUBO_Z],
			TUBO_R
		);
	}
	// Ramal do silo (saída lateral direto para o rack).
	b.tubo(
		"ramal-silo",
		[SILO_X, TUBO_Y2, SILO_Z + SILO_R - 0.01],
		[SILO_X, TUBO_Y2, TUBO_Z],
		TUBO_R * 0.85
	);
	// Flange de entrada no galpão.
	b.caixa("flange-galpao", [0.026, 0.11, 0.11], m.navy, [
		GAL_LESTE_X + 0.012,
		(TUBO_Y1 + TUBO_Y2) / 2,
		TUBO_Z,
	]);
}

function montarFabrica(): Group {
	const root = new Group();
	const mats = criarMateriais();
	const b = criarBuilder(root, mats);
	montarPlinto(b, mats);
	montarGalpao(b, mats);
	montarDoca(b, mats);
	montarEnvase(b, mats);
	montarEscada(b, mats);
	montarParque(b, mats);
	montarTubulacao(b, mats);
	// Ancoragem: grupo descido para centrar o volume na bolha.
	root.position.y = -FABRICA_ALTURA / 2;
	return root;
}

/** Vinheta parada da estação "malha": a fábrica da CBS em maquete. */
export function Fabrica() {
	// Sem descarte manual: o grupo vive enquanto a cena vive, e um dispose no
	// cleanup do efeito destruiria as geometrias no double-mount do StrictMode.
	const modelo = useMemo(montarFabrica, []);
	return (
		<group rotation={FABRICA_ROT} scale={FABRICA_ESCALA}>
			{/* O R3F não descarta objetos entregues por `primitive`: geometrias,
			    materiais e a textura da faixa vazam a cada remontagem (HMR e o
			    double-mount do StrictMode). Aqui é inócuo porque `Scene3D` monta
			    uma vez e nunca desmonta; se a fábrica virar um `dynamic()` ou
			    ganhar uma segunda rota, o unmount passa a exigir dispose manual
			    do grupo (traverse + dispose de geometry/material/map). */}
			<primitive object={modelo} />
		</group>
	);
}
