<?php
// app/views/pr/index.php
$page_title = 'Purchase Requisition — XSPARSE NEWBIZ';
$active_nav = 'pr';
require_once __DIR__ . '/../layouts/header.php';

$statusConfig = [
    'PENDING'   => ['class' => 'badge--inactive',     'label' => 'Pending'],
    'APPROVED'  => ['class' => 'badge--warning',       'label' => 'Approved'],
    'REJECTED'  => ['class' => 'badge--discontinued', 'label' => 'Rejected'],
    'CANCELLED' => ['class' => 'badge--inactive',     'label' => 'Cancelled'],
    'COMPLETED' => ['class' => 'badge--active',       'label' => 'Completed'],
];
?>


<div class="page-header">
    <div>
        <h1 class="page-header__title">Purchase Requisition</h1>
        <p class="page-header__sub">Manage and track all PR submissions</p>
    </div>
    <a href="<?= url('pr/create') ?>" class="btn btn--primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New PR
    </a>
</div>

<?php if (!empty($success)): ?>
    <div class="alert alert--success" style="margin-bottom:1rem">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
        <?= htmlspecialchars($success) ?>
    </div>
<?php endif; ?>
<?php if (!empty($error)): ?>
    <div class="alert alert--error" style="margin-bottom:1rem">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <?= htmlspecialchars($error) ?>
    </div>
<?php endif; ?>

<div class="pr-stat-cards">
    <div class="pr-stat" data-status="ALL" onclick="filterPR('ALL')" style="cursor:pointer">
        <p class="pr-stat__label">Total PRs</p>
        <p class="pr-stat__value"><?= (int)($stats['total'] ?? 0) ?></p>
    </div>

    <div class="pr-stat" data-status="PENDING" onclick="filterPR('PENDING')" style="cursor:pointer">
        <p class="pr-stat__label">Pending</p>
        <p class="pr-stat__value pr-stat__value--orange">
            <?= (int)($stats['pending'] ?? 0) ?>
        </p>
    </div>

    <div class="pr-stat" data-status="APPROVED" onclick="filterPR('APPROVED')" style="cursor:pointer">
        <p class="pr-stat__label">Approved</p>
        <p class="pr-stat__value pr-stat__value--green">
            <?= (int)($stats['approved'] ?? 0) ?>
        </p>
    </div>

    <div class="pr-stat" data-status="REJECTED" onclick="filterPR('REJECTED')" style="cursor:pointer">
        <p class="pr-stat__label">Rejected</p>
        <p class="pr-stat__value pr-stat__value--red">
            <?= (int)($stats['rejected'] ?? 0) ?>
        </p>
    </div>
    <div class="pr-stat" data-status="COMPLETED" onclick="filterPR('COMPLETED')" style="cursor:pointer">
        <p class="pr-stat__label">Completed</p>
        <p class="pr-stat__value pr-stat__value--green">
            <?= (int)($stats['completed'] ?? 0) ?>
        </p>
    </div>
</div>

<div class="card">
    <?php if (empty($prs)): ?>
        <div class="empty-state">
            <p>No PRs found. <a href="<?= url('pr/create') ?>">Create the first one.</a></p>
        </div>
    <?php else: ?>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>PR No.</th>
                        <th>Issue Date</th>
                        <th>Requested By</th>
                        <th>Dept</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($prs as $pr):
                        $cfg = $statusConfig[$pr['status']] ?? ['class' => 'badge--inactive', 'label' => $pr['status']];
                        $is_row_owner = ((int)($_SESSION['user_id'] ?? 0) === (int)$pr['requested_by']);
                    ?>
                        <tr data-status="<?= strtoupper($pr['status']) ?>" style="cursor:pointer" onclick="window.location='<?= url('pr/view?id=' . $pr['pr_id']) ?>'">
                            <td>
                                <a href="<?= url('pr/view?id=' . $pr['pr_id']) ?>"
                                    style="font-family:monospace;font-size:12px;color:var(--accent-2);text-decoration:none;font-weight:600;background:var(--accent-light);padding:2px 8px;border-radius:4px">
                                    <?= htmlspecialchars($pr['pr_no']) ?>
                                </a>
                            </td>
                            <td style="color:var(--ink-muted)"><?= date('d M Y', strtotime($pr['issue_date'])) ?></td>
                            <td><strong><?= htmlspecialchars($pr['requester_name'] ?? '—') ?></strong></td>
                            <td style="color:var(--ink-muted)"><?= htmlspecialchars($pr['dept'] ?? '—') ?></td>
                            <td><span class="badge <?= $cfg['class'] ?>"><?= $cfg['label'] ?></span></td>
                            <td style="color:var(--ink-faint);font-size:12px;white-space:nowrap">
                                <?= date('d M Y', strtotime($pr['created_at'])) ?>
                            </td>
                            <td style="text-align:right" onclick="event.stopPropagation()">
                                <?php if (strtoupper($pr['status']) === 'REJECTED' && $is_row_owner): ?>
                                    <a href="<?= url('pr/create&clone_id=' . $pr['pr_id']) ?>" class="btn btn--primary btn--sm" style="background:#0f7a4f; color:#fff; border:none; padding:4px 10px;">Resubmit</a>
                                <?php else: ?>
                                    <a href="<?= url('pr/edit?id=' . $pr['pr_id']) ?>" class="btn btn--secondary btn--sm">Edit</a>
                                <?php endif; ?>
                            </td>
                            <td style="text-align:right" onclick="event.stopPropagation()">
                                <a href="<?= url('pr/view?id=' . $pr['pr_id']) ?>" class="btn btn--secondary btn--sm">View</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>

<script>
    function filterPR(status) {
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const rowStatus = row.dataset.status;

            if (status === 'ALL' || rowStatus === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Optional: highlight selected card
        document.querySelectorAll('.pr-stat').forEach(card => {
            card.style.opacity = '0.6';
        });

        document.querySelector(`.pr-stat[data-status="${status}"]`).style.opacity = '1';
    }
</script>

<?php require_once __DIR__ . '/../layouts/footer.php'; ?>