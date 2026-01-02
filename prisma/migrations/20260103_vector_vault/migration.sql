-- =============================================
-- ABBEY OS - LEGAL BRAIN: VECTOR VAULT MIGRATION
-- Enable pgvector extension and create embedding storage
-- =============================================

-- Enable the pgvector extension (Supabase has this pre-installed)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the embeddings table to store vector representations
-- We store embeddings separately for performance (pgvector works best this way)
CREATE TABLE IF NOT EXISTS document_embeddings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    chunk_id TEXT NOT NULL UNIQUE REFERENCES document_chunks(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536 dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for fast similarity search using cosine distance
-- IVFFlat is good for medium-sized datasets (up to 1M vectors)
CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx 
ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for chunk lookups
CREATE INDEX IF NOT EXISTS document_embeddings_chunk_id_idx 
ON document_embeddings(chunk_id);

-- =============================================
-- HELPER FUNCTIONS FOR SEMANTIC SEARCH
-- =============================================

-- Function to search documents by semantic similarity
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    chunk_id TEXT,
    document_id TEXT,
    content TEXT,
    page_number INT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunk_id,
        dc.document_id,
        dc.content,
        dc.page_number,
        1 - (de.embedding <=> query_embedding) as similarity
    FROM document_embeddings de
    JOIN document_chunks dc ON dc.id = de.chunk_id
    WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to search documents filtered by property
CREATE OR REPLACE FUNCTION search_documents_by_property(
    query_embedding vector(1536),
    property_id TEXT,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    chunk_id TEXT,
    document_id TEXT,
    content TEXT,
    page_number INT,
    document_name TEXT,
    document_type TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunk_id,
        dc.document_id,
        dc.content,
        dc.page_number,
        d.name as document_name,
        d.type::TEXT as document_type,
        1 - (de.embedding <=> query_embedding) as similarity
    FROM document_embeddings de
    JOIN document_chunks dc ON dc.id = de.chunk_id
    JOIN documents d ON d.id = dc.document_id
    WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
      AND (property_id IS NULL OR d.property_id = property_id)
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to search by document type (e.g., only MORTGAGE docs)
CREATE OR REPLACE FUNCTION search_documents_by_type(
    query_embedding vector(1536),
    doc_types TEXT[],
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    chunk_id TEXT,
    document_id TEXT,
    content TEXT,
    page_number INT,
    document_name TEXT,
    document_type TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunk_id,
        dc.document_id,
        dc.content,
        dc.page_number,
        d.name as document_name,
        d.type::TEXT as document_type,
        1 - (de.embedding <=> query_embedding) as similarity
    FROM document_embeddings de
    JOIN document_chunks dc ON dc.id = de.chunk_id
    JOIN documents d ON d.id = dc.document_id
    WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
      AND d.type::TEXT = ANY(doc_types)
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

