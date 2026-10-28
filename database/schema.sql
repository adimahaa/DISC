--
-- PostgreSQL database dump
--

\restrict rGFA6UszL57kRJ463qWpsXPmHmZf4z4kdimaMirTSUQ87WCrz2G50Ebsfu5g21j

-- Dumped from database version 18.6 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: hasil_disc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hasil_disc (
    id bigint NOT NULL,
    nama character varying(100) NOT NULL,
    kelompok character varying(100) NOT NULL,
    versi_tes character varying(30) DEFAULT 'disc-8-kelompok-v1'::character varying NOT NULL,
    jawaban jsonb NOT NULL,
    skor_d integer NOT NULL,
    skor_i integer NOT NULL,
    skor_s integer NOT NULL,
    skor_c integer NOT NULL,
    dibuat_pada timestamp with time zone DEFAULT now() NOT NULL,
    pengguna_id bigint,
    CONSTRAINT hasil_disc_jawaban_check CHECK ((jsonb_typeof(jawaban) = 'array'::text)),
    CONSTRAINT hasil_disc_jawaban_check1 CHECK ((jsonb_array_length(jawaban) = 32)),
    CONSTRAINT hasil_disc_skor_c_check CHECK (((skor_c >= 8) AND (skor_c <= 32))),
    CONSTRAINT hasil_disc_skor_d_check CHECK (((skor_d >= 8) AND (skor_d <= 32))),
    CONSTRAINT hasil_disc_skor_i_check CHECK (((skor_i >= 8) AND (skor_i <= 32))),
    CONSTRAINT hasil_disc_skor_s_check CHECK (((skor_s >= 8) AND (skor_s <= 32)))
);


--
-- Name: hasil_disc_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.hasil_disc ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hasil_disc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pengguna; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pengguna (
    id bigint NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(254) NOT NULL,
    password_hash text NOT NULL,
    peran character varying(20) DEFAULT 'mahasiswa'::character varying NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    dibuat_pada timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pengguna_email_check CHECK ((length(TRIM(BOTH FROM email)) > 0)),
    CONSTRAINT pengguna_nama_check CHECK ((length(TRIM(BOTH FROM nama)) > 0)),
    CONSTRAINT pengguna_peran_check CHECK (((peran)::text = ANY ((ARRAY['mahasiswa'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: pengguna_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pengguna ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pengguna_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sesi_pengguna; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesi_pengguna (
    token_hash character varying(64) NOT NULL,
    pengguna_id bigint NOT NULL,
    kedaluwarsa timestamp with time zone NOT NULL,
    dibuat_pada timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hasil_disc hasil_disc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hasil_disc
    ADD CONSTRAINT hasil_disc_pkey PRIMARY KEY (id);


--
-- Name: pengguna pengguna_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pengguna
    ADD CONSTRAINT pengguna_pkey PRIMARY KEY (id);


--
-- Name: sesi_pengguna sesi_pengguna_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesi_pengguna
    ADD CONSTRAINT sesi_pengguna_pkey PRIMARY KEY (token_hash);


--
-- Name: hasil_disc_pengguna_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hasil_disc_pengguna_id_idx ON public.hasil_disc USING btree (pengguna_id);


--
-- Name: pengguna_email_unik; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pengguna_email_unik ON public.pengguna USING btree (lower(TRIM(BOTH FROM email)));


--
-- Name: sesi_pengguna_kedaluwarsa_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sesi_pengguna_kedaluwarsa_idx ON public.sesi_pengguna USING btree (kedaluwarsa);


--
-- Name: sesi_pengguna_pengguna_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sesi_pengguna_pengguna_idx ON public.sesi_pengguna USING btree (pengguna_id);


--
-- Name: hasil_disc hasil_disc_pengguna_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hasil_disc
    ADD CONSTRAINT hasil_disc_pengguna_id_fkey FOREIGN KEY (pengguna_id) REFERENCES public.pengguna(id) ON DELETE RESTRICT;


--
-- Name: sesi_pengguna sesi_pengguna_pengguna_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesi_pengguna
    ADD CONSTRAINT sesi_pengguna_pengguna_id_fkey FOREIGN KEY (pengguna_id) REFERENCES public.pengguna(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rGFA6UszL57kRJ463qWpsXPmHmZf4z4kdimaMirTSUQ87WCrz2G50Ebsfu5g21j

