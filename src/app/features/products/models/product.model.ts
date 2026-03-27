/**
 * Modelo de Produto para Util Lar - Móveis Novos e Seminovos
 */

export interface Product {
	id: number;
	name: string;
	slug: string;
	description: string;
	price: number; // Preço em centavos (ex: 50000 = R$ 500,00)
	costPrice?: number; // Preço de custo (para cálculo de lucro)
	condition: 'novo' | 'seminovo'; // Condição do móvel
	category: string; // Ex: 'sofá', 'mesa', 'cadeira', 'cama', 'armário'
	images: string[] | null; // URLs das imagens
	stock: number; // Quantidade em estoque
	disponivel: number; // 1=disponível, 0=vendido/indisponível (fonte de verdade)
	dimensions?: {
		width: number;
		height: number;
		depth: number;
		unit: 'cm' | 'm';
	};
	material?: string; // Ex: 'madeira', 'metal', 'plástico', 'vidro'
	color?: string;
	brand?: string;
	warranty?: string; // Ex: '90 dias', '6 meses'
	featured: boolean; // Produto em destaque
	soldDate?: string; // Data da venda (se vendido)
	createdAt: string;
	updatedAt: string;
}

export interface ProductResponse extends Product {}

export interface ProductFormData {
	name: string;
	description: string;
	price: number;
	costPrice?: number;
	condition: 'novo' | 'seminovo';
	category: string;
	images: string[] | null;
	stock: number;
	dimensions?: {
		width: number;
		height: number;
		depth: number;
		unit: 'cm' | 'm';
	};
	material?: string;
	color?: string;
	brand?: string;
	warranty?: string;
	featured: boolean;
}

export interface ProductFormSubmission {
	product: ProductFormData;
	publishToFacebookMarketplace: boolean;
}
