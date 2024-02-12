CREATE SCHEMA public;

ALTER SCHEMA public OWNER TO pg_database_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.session (
    sid character varying(36) NOT NULL,
    sess json,
    expire date
);

ALTER TABLE ONLY public.session
    ADD CONSTRAINT idx_16998_primary PRIMARY KEY (sid);