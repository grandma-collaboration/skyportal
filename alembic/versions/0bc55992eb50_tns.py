"""TNS Migration

Revision ID: 0bc55992eb50
Revises: 1a43ee08a734
Create Date: 2022-03-29 18:17:00.935058

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy_utils


# revision identifiers, used by Alembic.
revision = '0bc55992eb50'
down_revision = '1a43ee08a734'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'tnsrobots',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('modified', sa.DateTime(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('bot_name', sa.String(), nullable=False),
        sa.Column('bot_id', sa.Integer(), nullable=False),
        sa.Column('source_group_id', sa.Integer(), nullable=False),
        sa.Column(
            '_altdata',
            sqlalchemy_utils.types.encrypted.encrypted_type.EncryptedType(),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_tnsrobots_created_at'), 'tnsrobots', ['created_at'], unique=False
    )
    op.create_index(
        op.f('ix_tnsrobots_group_id'), 'tnsrobots', ['group_id'], unique=False
    )
    op.add_column('instruments', sa.Column('tns_id', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('instruments', 'tns_id')
    op.drop_index(op.f('ix_tnsrobots_group_id'), table_name='tnsrobots')
    op.drop_index(op.f('ix_tnsrobots_created_at'), table_name='tnsrobots')
    op.drop_table('tnsrobots')
    # ### end Alembic commands ###