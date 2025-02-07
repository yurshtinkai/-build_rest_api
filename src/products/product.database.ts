import mysql from 'mysql2/promise';
import { Product, UnitProduct } from "./product.interface";

// Create connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const findAll = async (): Promise<UnitProduct[]> => {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows as UnitProduct[];
};

export const findOne = async (id: string): Promise<UnitProduct> => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return (rows as UnitProduct[])[0];
};

export const create = async (productInfo: Product): Promise<UnitProduct | null> => {
    const [result] = await pool.query(
        'INSERT INTO products (name, price, quantity, image) VALUES (?, ?, ?, ?)',
        [productInfo.name, productInfo.price, productInfo.quantity, productInfo.image]
    );
    
    const id = (result as any).insertId;
    return findOne(id.toString());
};

export const update = async (id: string, updateValues: Product): Promise<UnitProduct | null> => {
    const productExists = await findOne(id);
    if (!productExists) return null;

    await pool.query(
        'UPDATE products SET name = ?, price = ?, quantity = ?, image = ? WHERE id = ?',
        [updateValues.name, updateValues.price, updateValues.quantity, updateValues.image, id]
    );

    return findOne(id);
};

export const remove = async (id: string): Promise<void> => {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
};