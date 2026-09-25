<?php
// app/views/pr/detail.php
$page_title = htmlspecialchars($pr['pr_no']) . ' — XSPARSE NEWBIZ';
$active_nav = 'pr';
require_once __DIR__ . '/../layouts/header.php';

// Clean standard spacing & checks both potential session keys for role tracking
// 1. FIRST, define the user ID and extract 'role' (which matches your DB column)
// app/views/pr/detail.php

// 1. FIRST, define the user ID and extract 'user_role' (Matching AuthController.php exactly)
$user_id   = (int)($_SESSION['user_id'] ?? '');
$user_role = trim($_SESSION['user_role'] ?? ''); // Falls back to 'user' if session is missing

// 2. THEN, define user_type and apply the fallback securely
$user_type = trim($_SESSION['user_type'] ?? '');


// 3. Setup Permissions
$is_owner  = (isset($pr['requested_by']) && (int)$pr['requested_by'] === $user_id);
$is_admin  = (strtolower($user_role) === 'admin');

// 4. Status Configurations
$statusConfig = [
    'PENDING'   => ['color' => '#b45309', 'bg' => '#fff8ec', 'border' => '#b45309'],
    'APPROVED'  => ['color' => '#0f7a4f', 'bg' => '#edfaf4', 'border' => '#0f7a4f'],
    'REJECTED'  => ['color' => '#c0392b', 'bg' => '#fdf0ef', 'border' => '#c0392b'],
    'CANCELLED' => ['color' => '#666666', 'bg' => '#f5f5f5', 'border' => '#cccccc'],
    'COMPLETED' => ['color' => '#0f7a4f', 'bg' => '#edfaf4', 'border' => '#0f7a4f'],
];

$sCfg = $statusConfig[strtoupper($pr['status'])] ?? $statusConfig['PENDING'];

// --- Stepper Data Extraction ---
$checker_step  = null;
$approver_step = null;
$gp_approver   = null;

if (!empty($approvals)) {
    foreach ($approvals as $app) {
        $level = strtolower(trim($app['approval_level']));
        if ($level === 'checker')     $checker_step  = $app;
        if ($level === 'approver')    $approver_step = $app;
        if ($level === 'gp_approver') $gp_approver   = $app;
    }
}
function getStepData($app, $defaultTitle)
{
    if (!$app) return ['status' => 'pending', 'title' => $defaultTitle, 'name' => 'Pending', 'date' => '—'];

    $status = strtolower(trim($app['status']));

    // 1. Determine the display name dynamically based on status
    if (!empty($app['approver_name'])) {
        $name = $app['approver_name'];
    } elseif ($status === 'rejected') {
        $name = 'Auto-Rejected  '; // Changes to rejected when system terminates it
    } else {
        $name = 'Pending'; // Stays as Pending when there is no action done yet
    }

    // 2. Format the action timestamp
    $date = !empty($app['action_date']) ? date('d M Y, h:i A', strtotime($app['action_date'])) : '—';

    return [
        'status' => $status,
        'title'  => $defaultTitle,
        'name'   => $name,
        'date'   => $date,
        'reason' => $app['rejection_reason'] ?? null
    ];
}

$steps = [
    [
        'status' => 'completed',
        'title'  => 'Prepared By',
        'name'   => $pr['requester_name'] ?? 'System',
        'date'   => date('d M Y, h:i A', strtotime($pr['created_at']))
    ],
    getStepData($checker_step,   'Checker'),
    getStepData($approver_step, 'Approver'),
    getStepData($gp_approver,    'Procurement Status')
];
?>
<?php
$first_approval_step = $approvals[0] ?? null;
$can_edit_form = $is_owner &&
    strtoupper($pr['status']) === 'PENDING' &&
    ($first_approval_step && strtolower(trim($first_approval_step['status'])) === 'pending');

// Determine if current user can edit PO numbers (gp_approver and PR is APPROVED)
$is_gp_approver = (strtolower($user_type ?? '') === 'gp_approver');
$can_edit_po = $is_gp_approver && (strtoupper($pr['status']) === 'APPROVED');
?>

<style>
    /* Page Specific Styles */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
    }

    .header-actions {
        display: flex;
        gap: 8px;
    }

    .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .section-title {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
    }

    .detail-item label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    .detail-item span {
        display: block;
        font-size: 14px;
        color: #0f172a;
        font-weight: 500;
    }

    /* Table Styles */
    .table-wrap {
        overflow-x: auto;
        margin-top: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }

    tbody tr {
        transition: background-color 0.2s ease;
    }

    tbody tr:hover {
        background-color: #f8fafc;
    }

    th {
        background: #f8fafc;
        padding: 10px 12px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        border-bottom: 1px solid #e2e8f0;
    }

    td {
        padding: 12px;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        vertical-align: middle;
    }

    tr:last-child td {
        border-bottom: none;
    }

    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s;
        text-decoration: none;
    }

    .btn-secondary {
        background: #fff;
        border-color: #cbd5e1;
        color: #334155;
    }

    .btn-secondary:hover {
        background: #f8fafc;
    }

    .btn-primary {
        background: #0f7a4f;
        color: #fff;
    }

    .btn-primary:hover {
        background: #0d6943;
    }

    .btn-danger {
        background: #fff;
        color: #dc2626;
        border-color: #dc2626;
    }

    .btn-danger:hover {
        background: #fef2f2;
    }

    .btn-po {
        background: #f0fdf4;
        border-color: #86efac;
        color: #0f7a4f;
        padding: 4px 12px;
        font-size: 12px;
    }

    .btn-po:hover {
        background: #dcfce7;
    }

    /* PO Badge */
    .po-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        color: #1e293b;
    }

    .po-badge--assigned {
        background: #ecfdf5;
        color: #0f7a4f;
        border: 1px solid #86efac;
    }

    .po-badge--pending {
        background: #fffbeb;
        color: #b45309;
        border: 1px solid #fcd34d;
    }

    /* Stepper Tracker */
    .stepper-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 1rem 0;
        position: relative;
    }

    .stepper-item {
        position: relative;
        flex: 1;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .stepper-item::after {
        content: '';
        position: absolute;
        top: 16px;
        left: 50%;
        width: 100%;
        height: 3px;
        background-color: #e2e8f0;
        z-index: 1;
        transition: 0.3s;
    }

    .stepper-item:last-child::after {
        display: none;
    }

    .step-counter {
        position: relative;
        z-index: 2;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background-color: #f1f5f9;
        color: #94a3b8;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4px solid #fff;
        margin-bottom: 8px;
        box-shadow: 0 0 0 1px #e2e8f0;
        transition: 0.3s;
    }

    .step-title {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 3px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .step-name {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 2px;
    }

    .step-date {
        font-size: 11px;
        color: #94a3b8;
    }

    /* Stepper States */
    .stepper-item.completed .step-counter {
        background-color: #0f7a4f;
        color: #fff;
        box-shadow: 0 0 0 1px #0f7a4f;
        border-color: #fff;
    }

    .stepper-item.completed::after {
        background-color: #0f7a4f;
    }

    .stepper-item.completed .step-title {
        color: #0f7a4f;
    }

    .stepper-item.rejected .step-counter {
        background-color: #dc2626;
        color: #fff;
        box-shadow: 0 0 0 1px #dc2626;
    }

    .stepper-item.rejected .step-title {
        color: #dc2626;
    }

    /* Modal */
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.6);
        z-index: 1000;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(2px);
    }

    .modal.is-open {
        display: flex;
    }

    .modal-content {
        background: #fff;
        width: 90%;
        max-width: 500px;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        margin-top: 5px;
        box-sizing: border-box;
    }

    .form-control:focus {
        outline: none;
        border-color: #0f7a4f;
        box-shadow: 0 0 0 2px rgba(15, 122, 79, 0.1);
    }

    /* PO Modal specific */
    .po-modal-content {
        max-width: 550px;
    }

    .po-item-detail {
        background: #f8fafc;
        padding: 12px;
        border-radius: 8px;
        margin: 15px 0;
    }

    .po-item-detail p {
        margin: 5px 0;
        font-size: 13px;
    }

    .po-item-detail strong {
        color: #1e293b;
    }
</style>

<div class="page-header">
    <div>
        <h1 style="font-size:20px; font-weight:700; color:#0f172a; margin-bottom:6px; display:flex; align-items:center; gap:10px;">
            <?= htmlspecialchars($pr['pr_no']) ?>
            <span style="font-size:11px; padding:4px 10px; border-radius:20px; background:<?= $sCfg['bg'] ?>; color:<?= $sCfg['color'] ?>; border:1px solid <?= $sCfg['border'] ?>; font-weight:600; letter-spacing:0.05em;">
                <?= htmlspecialchars($pr['status']) ?>
            </span>
        </h1>
        <p style="color:#64748b; font-size:13px;">Review requisition details and approval status</p>
    </div>

    <div class="header-actions">
        <a href="<?= url('pr') ?>" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
        </a>

        <?php if ($can_edit_form): ?>
            <a href="<?= url('pr/edit&id=' . $pr['pr_id']) ?>" class="btn btn-secondary" style="color: #b45309; border-color: #fcd34d; background: #fffbeb;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px;">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                </svg>
                Edit PR Form
            </a>
        <?php endif; ?>

        <?php if (strtoupper($pr['status']) === 'REJECTED' && $is_owner): ?>
            <a href="<?= url('pr/create?clone_id=' . $pr['pr_id']) ?>" class="btn btn-secondary" style="color: #0f7a4f; border-color: #6ee7b7; background: #ecfdf5;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Resubmit as New PR
            </a>
        <?php endif; ?>

        <?php
        $can_approve = false;
        $current = null;

        // Clean session type string
        $session_type = !empty($user_type) ? strtolower(trim($user_type)) : '';

        // Tell the system that 'checker' is allowed to approve 'pmo_checker' steps
        $allowed_matches = [
            'checker'     => ['checker', 'pmo_checker'],
            'approver'    => ['approver', 'pmo_approver'],
            'gp_approver' => ['gp_approver']
        ];

        if (strtoupper($pr['status']) === 'PENDING' && !empty($approvals)) {
            foreach ($approvals as $app) {
                // Find the first step that is still pending
                if (strtolower(trim($app['status'])) === 'pending') {
                    $current = $app;
                    $db_level = strtolower(trim($app['approval_level']));

                    // Check 1: Does the workflow step match the allowed levels for this user?
                    $valid_levels = $allowed_matches[$session_type] ?? [$session_type];
                    if (!empty($session_type) && in_array($db_level, $valid_levels)) {
                        $can_approve = true;
                    }

                    // Check 2: Fallback assigned individual User ID check
                    if (!empty($app['assigned_to']) && (int)$app['assigned_to'] === $user_id) {
                        $can_approve = true;
                    }

                    // Check 3: Administrative Master-Key
                    // if ($is_admin) {
                    //     $can_approve = true;
                    // }

                    // =====================================================
                    // SELF-APPROVAL PROTECTION ENFORCEMENT
                    // =====================================================
                    if ($is_owner) {
                        $can_approve = false;
                        // Overrides visibility: creators cannot approve or reject their own work
                    }

                    break;
                }
            }
        }
        ?>

        <?php if ($can_approve): ?>
            <button class="btn btn-danger" onclick="document.getElementById('rejectModal').classList.add('is-open')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Reject
            </button>
            <button class="btn btn-primary" onclick="document.getElementById('approveModal').classList.add('is-open')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Approve
            </button>
        <?php endif; ?>

        <?php if (strtoupper($pr['status']) === 'PENDING' && $is_owner): ?>
            <form method="POST" action="<?= url('pr/cancel') ?>" onsubmit="return confirm('Cancel this PR?');">
                <input type="hidden" name="pr_id" value="<?= $pr['pr_id'] ?>">
                <button type="submit" class="btn btn-secondary" style="color:#dc2626; border-color:#fca5a5; background:#fef2f2">Cancel PR</button>
            </form>
        <?php endif; ?>
    </div>
</div>

<div class="card">
    <div class="stepper-wrapper">
        <?php foreach ($steps as $index => $step):
            $statusClass = ($step['status'] === 'approved' || $step['status'] === 'completed') ? 'completed' : ($step['status'] === 'rejected' ? 'rejected' : '');

            $icon = $index + 1;
            if ($statusClass === 'completed') {
                $icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            } elseif ($statusClass === 'rejected') {
                $icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            }
        ?>
            <div class="stepper-item <?= $statusClass ?>">
                <div class="step-counter"><?= $icon ?></div>
                <div class="step-title"><?= $step['title'] ?></div>
                <div class="step-name"><?= htmlspecialchars($step['name']) ?></div>
                <div class="step-date"><?= $step['date'] ?></div>

                <?php if (!empty($step['reason'])): ?>
                    <div style="color:#dc2626; font-size:11px; margin-top:6px; background:#fef2f2; padding:4px 8px; border-radius:4px; border:1px solid #fecaca; max-width:80%; line-height:1.4;">
                        <strong>Reason:</strong> <?= htmlspecialchars($step['reason']) ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<div class="card">
    <h2 class="section-title">Requisition Details</h2>
    <div class="detail-grid">
        <div class="detail-item">
            <label>Department</label>
            <span><?= htmlspecialchars($pr['dept'] ?? '—') ?></span>
        </div>
        <div class="detail-item">
            <label>Issue Date</label>
            <span><?= date('d M Y', strtotime($pr['issue_date'])) ?></span>
        </div>
        <div class="detail-item">
            <label>Expected Date</label>
            <span><?= !empty($pr['expected_date']) ? date('d M Y', strtotime($pr['expected_date'])) : '—' ?></span>
        </div>
        <div class="detail-item">
            <label>Requested By</label>
            <span><?= htmlspecialchars($pr['requester_name'] ?? '—') ?></span>
        </div>
    </div>

    <?php if (!empty($pr['remarks'])): ?>
        <div style="margin-top: 1.5rem; background: #f8fafc; padding: 12px 16px; border-radius: 0 6px 6px 0; border-left: 4px solid #cbd5e1;">
            <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Remarks</label>
            <span style="font-size: 13px; color: #334155; line-height: 1.6;"><?= nl2br(htmlspecialchars($pr['remarks'])) ?></span>
        </div>
    <?php endif; ?>
</div>

<div class="card">
    <h2 class="section-title">
        Items Requested
        <span style="background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 11px;"><?= count($items) ?> items</span>
    </h2>
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th width="5%">#</th>
                    <th width="30%">Item Description</th>
                    <th width="8%" style="text-align:center">Qty</th>
                    <th width="12%" style="text-align:right">Unit Price</th>
                    <th width="12%" style="text-align:right">Total Amount</th>
                    <th width="18%">Vendor / ETA</th>
                    <th width="15%">PO Number</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $grand_total = 0;
                foreach ($items as $index => $item):
                    $grand_total += (float)$item['total_amount'];
                    $has_po = !empty($item['po_no']);
                ?>
                    <tr>
                        <td style="color:#94a3b8; font-weight:500"><?= $index + 1 ?></td>
                        <td>
                            <div style="font-weight: 600; color: #1e293b; margin-bottom: 2px;">
                                <?= htmlspecialchars($item['product_no'] ?? 'N/A') ?>
                            </div>
                            <div style="font-size: 12px; color: #64748b;">
                                <?= htmlspecialchars($item['product_desc'] ?? '—') ?>
                            </div>
                        </td>
                        <td style="text-align:center; font-weight:500">
                            <?= (float)$item['quantity'] ?> <span style="font-size:11px; color:#94a3b8"><?= htmlspecialchars($item['uom']) ?></span>
                        </td>
                        <td style="text-align:right">
                            <span style="font-size:11px; color:#94a3b8"><?= htmlspecialchars($item['currency']) ?></span>
                            <?= number_format((float)$item['unit_price'], 2) ?>
                        </td>
                        <td style="text-align:right; font-weight:600; color:#0f7a4f;">
                            <span style="font-size:11px; color:#64748b"><?= htmlspecialchars($item['currency']) ?></span>
                            <?= number_format((float)$item['total_amount'], 2) ?>
                        </td>
                        <td>
                            <div style="font-size:12px; color:#334155; margin-bottom:2px; font-weight:500;">
                                <?= htmlspecialchars($item['vendor_name'] ?? '—') ?>
                            </div>
                            <div style="font-size:11px; color:#94a3b8;">
                                ETA: <?= !empty($item['eta_date']) ? date('d M Y', strtotime($item['eta_date'])) : '—' ?>
                            </div>
                        </td>
                        <td>
                            <?php if ($has_po): ?>
                                <div class="po-badge po-badge--assigned">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <?= htmlspecialchars($item['po_no']) ?>
                                </div>
                            <?php else: ?>
                                <div class="po-badge po-badge--pending">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    Pending
                                </div>
                            <?php endif; ?>

                            <?php if ($can_edit_po && !$has_po): ?>
                                <button onclick="openPOModal(<?= $item['item_id'] ?>, '<?= htmlspecialchars(addslashes($item['product_desc'])) ?>', <?= $item['quantity'] ?>, '<?= htmlspecialchars($item['uom']) ?>')"
                                    class="btn btn-po" style="margin-top: 8px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    Add PO
                                </button>
                            <?php elseif ($can_edit_po && $has_po): ?>
                                <button onclick="openPOModal(<?= $item['item_id'] ?>, '<?= htmlspecialchars(addslashes($item['product_desc'])) ?>', <?= $item['quantity'] ?>, '<?= htmlspecialchars($item['uom']) ?>', '<?= htmlspecialchars($item['po_no']) ?>')"
                                    class="btn btn-secondary" style="margin-top: 8px; padding: 4px 12px; font-size: 12px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                                    </svg>
                                    Edit PO
                                </button>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" style="text-align:right; font-weight:600; color:#475569; border-top:2px solid #e2e8f0; padding-top:16px;">
                        Grand Total:
                    </td>
                    <td style="text-align:right; font-weight:700; font-size:16px; color:#0f172a; border-top:2px solid #e2e8f0; padding-top:16px;">
                        <span style="font-size:12px; color:#64748b; font-weight:600;">MYR</span>
                        <?= number_format($grand_total, 2) ?>
                    </td>
                    <td style="border-top:2px solid #e2e8f0;"></td>
                </tr>
            </tfoot>
        </table>
    </div>
</div>

<!-- PO Number Modal (only shown for gp_approver) -->
<?php if ($can_edit_po): ?>
    <div id="poModal" class="modal-overlay">
        <div class="modal">
            <div class="modal-content po-modal-content">
                <h3 style="margin-top:0; color:#0f7a4f; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    Enter PO Number
                </h3>

                <div class="po-item-detail">
                    <p><strong>Item:</strong> <span id="poItemDesc"></span></p>
                    <p><strong>Quantity:</strong> <span id="poItemQty"></span> <span id="poItemUom"></span></p>
                </div>

                <form method="POST" action="<?= url('pr/update-po') ?>" id="poForm">
                    <input type="hidden" name="pr_id" value="<?= $pr['pr_id'] ?>">
                    <input type="hidden" name="item_id" id="poItemId">
                    <input type="hidden" name="is_bulk_update" value="0">

                    <div class="form-group" style="margin-top: 0.5rem;">
                        <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 12px; color:#475569;">PO Number <span style="color:#dc2626">*</span></label>
                        <input type="text" name="po_number" id="poNumber" class="form-control"
                            placeholder="e.g., PO-2024-00123" required autocomplete="off">
                        <small style="color: #64748b; font-size: 11px; margin-top: 4px; display: block;">Enter the Purchase Order number for this item.</small>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="closePOModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save PO Number</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

        <script>
            let currentItemId = null;

            function openPOModal(itemId, productDesc, quantity, uom, existingPo = '') {
                currentItemId = itemId;
                document.getElementById('poItemId').value = itemId;
                document.getElementById('poItemDesc').innerText = productDesc;
                document.getElementById('poItemQty').innerText = quantity;
                document.getElementById('poItemUom').innerText = uom;
                document.getElementById('poNumber').value = existingPo;
                document.getElementById('poModal').classList.add('is-open');
            }

            function closePOModal() {
                document.getElementById('poModal').classList.remove('is-open');
                document.getElementById('poNumber').value = '';
            }

            // Close modal when clicking outside
            document.getElementById('poModal').addEventListener('click', function(event) {
                if (event.target === this) {
                    closePOModal();
                }
            });

            // Handle form submission via AJAX for better UX
            document.getElementById('poForm').addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(this);
                formData.append('ajax', '1');

                fetch('<?= url('pr/update-po') ?>', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Show success message
                            const successMsg = document.createElement('div');
                            successMsg.style.cssText = 'position:fixed; top:20px; right:20px; background:#0f7a4f; color:#fff; padding:12px 20px; border-radius:8px; z-index:1001; animation:fadeOut 3s forwards;';
                            successMsg.innerHTML = '✓ ' + data.message;
                            document.body.appendChild(successMsg);

                            // Reload page after short delay to show updated PO
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            alert('Error: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to save PO number. Please try again.');
                    });
            });

            // Add fade out animation
            const style = document.createElement('style');
            style.textContent = `
        @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; display: none; }
        }
    `;
            document.head.appendChild(style);
        </script>
    <?php endif; ?>

    <!-- Approval Modals -->
    <?php if ($can_approve): ?>
        <div id="approveModal" class="modal">
            <div class="modal-content">
                <h3 style="margin-top:0; color:#0f7a4f; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">Approve Purchase Requisition</h3>
                <p style="font-size:13px; color:#475569; margin: 16px 0;">Are you sure you want to approve this PR? This will move it to the next step in the workflow.</p>

                <form method="POST" action="<?= url('pr/approve') ?>">
                    <input type="hidden" name="approval_id" value="<?= $current['approval_id'] ?>">
                    <input type="hidden" name="pr_id" value="<?= $pr['pr_id'] ?>">
                    <div style="text-align:right; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('approveModal').classList.remove('is-open')">Cancel</button>
                        <button type="submit" class="btn btn-primary" style="margin-left: 8px;">Confirm Approval</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="rejectModal" class="modal">
            <div class="modal-content">
                <h3 style="margin-top:0; color:#dc2626; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">Reject Purchase Requisition</h3>

                <form method="POST" action="<?= url('pr/reject') ?>">
                    <input type="hidden" name="approval_id" value="<?= $current['approval_id'] ?>">
                    <input type="hidden" name="pr_id" value="<?= $pr['pr_id'] ?>">

                    <div class="form-group" style="margin-top: 1rem;">
                        <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 12px; color:#475569;">Reason for Rejection <span style="color:#dc2626">*</span></label>
                        <textarea name="rejection_reason" class="form-control" rows="4" required placeholder="Please explain why this PR is being rejected..."></textarea>
                    </div>

                    <div style="text-align:right; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('rejectModal').classList.remove('is-open')">Cancel</button>
                        <button type="submit" class="btn btn-danger" style="margin-left: 8px;">Confirm Rejection</button>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>

    <script>
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(event) {
                if (event.target === this) {
                    this.classList.remove('is-open');
                }
            });
        });
    </script>

    <?php require_once __DIR__ . '/../layouts/footer.php'; ?>