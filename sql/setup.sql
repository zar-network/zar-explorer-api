drop table if exists explorer_blocks;
create table explorer_blocks (
  block_hash char(64) primary key,
  raw JSON,
  height numeric,
  tx_count numeric,
  parent_block_hash char(64),
  block_proposer_address char(42),
  block_timestamp timestamp(6)
);

drop table if exists explorer_transactions;
create table explorer_transactions (
  tx_hash char(64) primary key,
  raw JSON,
	block_hash char(64),
	block_height numeric,
  gas_wanted numeric,
  gas_used numeric,
  tx_type varchar(100),
	message_type varchar(100),
  from_address char(42),
	to_address char(42),
	amount numeric,
	memo text,
  tx_timestamp timestamp(6)
);

drop table if exists accounts;
create table accounts (
  uuid char(36) primary key,

);
