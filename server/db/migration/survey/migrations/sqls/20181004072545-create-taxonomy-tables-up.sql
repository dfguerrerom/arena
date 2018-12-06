CREATE TABLE
  taxonomy
(
  id          bigserial NOT NULL,
  uuid        uuid      NOT NULL DEFAULT uuid_generate_v4(),
  props       jsonb              DEFAULT '{}'::jsonb,
  props_draft jsonb              DEFAULT '{}'::jsonb,
  PRIMARY KEY (id)
);

CREATE TABLE
  taxon
(
  id          bigserial NOT NULL,
  uuid        uuid      NOT NULL DEFAULT uuid_generate_v4(),
  taxonomy_id bigint    NOT NULL,
  props       jsonb              DEFAULT '{}'::jsonb,
  props_draft jsonb              DEFAULT '{}'::jsonb,

  PRIMARY KEY (id),
  CONSTRAINT taxon_uuid_key UNIQUE (uuid),
  CONSTRAINT taxon_taxonomy_fk FOREIGN KEY (taxonomy_id) REFERENCES taxonomy (id) ON DELETE CASCADE
);

CREATE TABLE
  taxon_vernacular_name
(
  id          bigserial NOT NULL,
  uuid        uuid      NOT NULL DEFAULT uuid_generate_v4(),
  taxon_uuid  uuid      NOT NULL,
  props       jsonb              DEFAULT '{}'::jsonb,
  props_draft jsonb              DEFAULT '{}'::jsonb,

  PRIMARY KEY (id),
  CONSTRAINT taxon_vernacular_name_taxon_fk FOREIGN KEY (taxon_uuid) REFERENCES taxon (uuid) ON DELETE CASCADE
);

CREATE UNIQUE INDEX
taxon_props_code_idx
ON taxon (taxonomy_id, (props->>'code'));

CREATE UNIQUE INDEX
taxon_props_scientific_name_idx
ON taxon (taxonomy_id, (props->>'scientificName'));

CREATE UNIQUE INDEX
taxon_props_draft_code_idx
ON taxon (taxonomy_id, (props_draft->>'code'));

CREATE UNIQUE INDEX
taxon_props_draft_scientific_name_idx
ON taxon (taxonomy_id,  (props_draft->>'scientificName'));

CREATE UNIQUE INDEX
taxon_vernacular_name_props_lang_idx
ON taxon_vernacular_name (taxon_uuid, (props->>'lang'));

CREATE UNIQUE INDEX
taxon_vernacular_name_props_draft_lang_idx
ON taxon_vernacular_name (taxon_uuid, (props_draft->>'lang'));
