let url="http://43.74.21.48:3002/E-mts/login-board"
const approvalEmail = ({ Mnumber, DEP }) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 560px;
                            background: #ffffff;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #eee;">
                                <h2 style="
                                    margin: 0;
                                    font-size: 20px;
                                    color: #222;
                                ">
                                    New Request
                                </h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 28px;">

                                <p style="
                                    margin: 0 0 18px;
                                    font-size: 15px;
                                ">
                                    Hello ${DEP},
                                </p>

                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                    A new request is waiting for your approval.
                                </p>

                                <!-- Request Number -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background: #f8fafc;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 8px;
                                    ">
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <div style="
                                                font-size: 12px;
                                                color: #888;
                                                margin-bottom: 5px;
                                            ">
                                                Reference No.
                                            </div>

                                            <div style="
                                                font-size: 17px;
                                                font-weight: bold;
                                                color: #222;
                                            ">
                                                ${Mnumber}
                                            </div>

                                        </td>
                                    </tr>
                                </table>

                                        <p style="
                                            margin: 22px 0 0;
                                            font-size: 14px;
                                            line-height: 1.6;
                                            color: #666;
                                        ">
                                            Please 
                                            <a href="${url}"
                                            style="color: #007bff; text-decoration: none; font-weight: bold;">
                                                log in to the system
                                            </a>
                                            to review and approve this request.
                                        </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 18px 28px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                            ">
                                This is an automated notification. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};



const planning = ({ Mnumber, DEP, Reqdep,Reqname,Date,Remark,name }) => {

    return `
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 560px;
                            background: #ffffff;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #eee;">
                                <h2 style="
                                    margin: 0;
                                    font-size: 20px;
                                    color: #222;
                                ">
                                    Reference No. : ${Mnumber}
                                </h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 28px;">

                                <p style="
                                    margin: 0 0 18px;
                                    font-size: 15px;
                                ">
                                    Dear ${DEP},
                                </p>

                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                    Board Request purpose : ${Remark}
                                </p>

                                <!-- Request Number -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background: #f8fafc;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 8px;
                                    ">
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <div style="
                                                font-size: 12px;
                                                color: #888;
                                                margin-bottom: 5px;
                                            ">
                                                Reference No.
                                            </div>

                                            <div style="
                                                font-size: 17px;
                                                font-weight: bold;
                                                color: #222;
                                                margin-bottom: 16px;
                                            ">
                                                ${Mnumber}
                                            </div>

                                            <!-- Request Details Table -->
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                style="
                                                    border-collapse: collapse;
                                                    width: 100%;
                                                    background: #ffffff;
                                                    font-size: 12px;
                                                ">

                                                <!-- Table Header -->
                                                <tr style="background-color: #f8fafc;">

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Task (Applicant)
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        User (Requestor)
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                         Approval by superviosr/HOD
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Status
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Date
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Remarks
                                                    </th>

                                                </tr>

                                                <!-- Table Data -->
                                                <tr>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        Applicant
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${Reqname}
                                                    </td>
                                                  <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${name}
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                        font-weight: bold;
                                                    ">
                                                        Submitted
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${Date}
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #555;
                                                    ">
                                                        ${Remark}
                                                    </td>

                                                </tr>

                                            </table>

                                        </td>
                                    </tr>
                                </table>

                                <p style="
                                    margin: 22px 0 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #666;
                                ">
                                    Task: approve and review the request
                                    <a href="${url}"
                                    style="color: #007bff; text-decoration: none; font-weight: bold;">
                                        here
                                    </a>
                                    thank you.
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 18px 28px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                            ">
                                This is an automated notification. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};


const planningCancle = ({ Mnumber, DEP, Reqdep,Reqname,Date,Remark,name }) => {

    return `
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 560px;
                            background: #ffffff;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #eee;">
                                <h2 style="
                                    margin: 0;
                                    font-size: 20px;
                                    color: #222;
                                ">
                                    Reference No. : ${Mnumber}
                                </h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 28px;">

                                <p style="
                                    margin: 0 0 18px;
                                    font-size: 15px;
                                ">
                                    Dear ${DEP},
                                </p>

                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                    Board Request purpose : ${Remark}
                                </p>

                                <!-- Request Number -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background: #f8fafc;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 8px;
                                    ">
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <div style="
                                                font-size: 12px;
                                                color: #888;
                                                margin-bottom: 5px;
                                            ">
                                                Reference No.
                                            </div>

                                            <div style="
                                                font-size: 17px;
                                                font-weight: bold;
                                                color: #222;
                                                margin-bottom: 16px;
                                            ">
                                                ${Mnumber}
                                            </div>

                                            <!-- Request Details Table -->
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                style="
                                                    border-collapse: collapse;
                                                    width: 100%;
                                                    background: #ffffff;
                                                    font-size: 12px;
                                                ">

                                                <!-- Table Header -->
                                                <tr style="background-color: #f8fafc;">

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Task (Applicant)
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        User (Requestor)
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                         Approval by superviosr/HOD
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Status
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Date
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Remarks
                                                    </th>

                                                </tr>

                                                <!-- Table Data -->
                                                <tr>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        Applicant
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${Reqname}
                                                    </td>
                                                  <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${name}
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                        font-weight: bold;
                                                    ">
                                                        Request Resubmited
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${Date}
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #555;
                                                    ">
                                                        ${Remark}
                                                    </td>

                                                </tr>

                                            </table>

                                        </td>
                                    </tr>
                                </table>

                                <p style="
                                    margin: 22px 0 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #666;
                                ">
                                    Task: approve and review the request
                                    <a href="${url}"
                                    style="color: #007bff; text-decoration: none; font-weight: bold;">
                                        here
                                    </a>
                                    thank you.
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 18px 28px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                            ">
                                This is an automated notification. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};



const rejected = ({ Mnumber,DEP }) => {

    return `
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 560px;
                            background: #ffffff;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #eee;">
                                <h2 style="
                                    margin: 0;
                                    font-size: 20px;
                                    color: #222;
                                ">
                                    Rejected date
                                </h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 28px;">

                                <p style="
                                    margin: 0 0 18px;
                                    font-size: 15px;
                                ">
                                    Hello ${DEP},
                                </p>

                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                    Your date suggestion is denied.
                                </p>

                                <!-- Request Number -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background: #f8fafc;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 8px;
                                    ">
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <div style="
                                                font-size: 12px;
                                                color: #888;
                                                margin-bottom: 5px;
                                            ">
                                                Reference No.
                                            </div>

                                            <div style="
                                                font-size: 17px;
                                                font-weight: bold;
                                                color: #222;
                                            ">
                                                ${Mnumber}
                                            </div>

                                        </td>
                                    </tr>
                                </table>

                                        <p style="
                                            margin: 22px 0 0;
                                            font-size: 14px;
                                            line-height: 1.6;
                                            color: #666;
                                        ">
                                            Please 
                                            <a href="${url}"
                                            style="color: #007bff; text-decoration: none; font-weight: bold;">
                                                log in to the system
                                            </a>
                                            to review and approve this request.
                                        </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 18px 28px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                            ">
                                This is an automated notification. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};


const dateUpdated = ({ Mnumber, DEP, Reqdep,Reqname,Date,Remark,name  }) => {

    return `
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 560px;
                            background: #ffffff;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #eee;">
                                <h2 style="
                                    margin: 0;
                                    font-size: 20px;
                                    color: #222;
                                ">
                                    Reference No. : ${Mnumber}
                                </h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 28px;">

                                <p style="
                                    margin: 0 0 18px;
                                    font-size: 15px;
                                ">
                                    Dear ${DEP},
                                </p>

                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                    Board Request purpose : ${Remark}
                                </p>

                                <!-- Request Number -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background: #f8fafc;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 8px;
                                    ">
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <div style="
                                                font-size: 12px;
                                                color: #888;
                                                margin-bottom: 5px;
                                            ">
                                                Reference No.
                                            </div>

                                            <div style="
                                                font-size: 17px;
                                                font-weight: bold;
                                                color: #222;
                                                margin-bottom: 16px;
                                            ">
                                                ${Mnumber}
                                            </div>

                                            <!-- Request Details Table -->
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                style="
                                                    border-collapse: collapse;
                                                    width: 100%;
                                                    background: #ffffff;
                                                    font-size: 12px;
                                                ">

                                                <!-- Table Header -->
                                                <tr style="background-color: #f8fafc;">

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Task (Applicant)
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        User (Requestor)
                                                    </th>
                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Approval by superviosr/HOD
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Status
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Date
                                                    </th>

                                                    <th style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        text-align: left;
                                                        color: #555;
                                                    ">
                                                        Remarks
                                                    </th>

                                                </tr>

                                                <!-- Table Data -->
                                                <tr>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        Applicant
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${Reqname}
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${name}
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                        font-weight: bold;
                                                    ">
                                                        Date Updated
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #333;
                                                    ">
                                                        ${Date}
                                                    </td>

                                                    <td style="
                                                        padding: 10px 8px;
                                                        border: 1px solid #e5e7eb;
                                                        color: #555;
                                                    ">
                                                        ${Remark}
                                                    </td>

                                                </tr>

                                            </table>

                                        </td>
                                    </tr>
                                </table>

                                <p style="
                                    margin: 22px 0 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #666;
                                ">
                                    Task: approve and review the request
                                    <a href="${url}"
                                    style="color: #007bff; text-decoration: none; font-weight: bold;">
                                        here
                                    </a>
                                    thank you.
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 18px 28px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                            ">
                                This is an automated notification. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};


const rejectedPlanning = ({ Mnumber,DEP,reason }) => {

    return `
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 560px;
                            background: #ffffff;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #eee;">
                                <h2 style="
                                    margin: 0;
                                    font-size: 20px;
                                    color: #222;
                                ">
                                    E-mts Resubmission
                                </h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 28px;">

                                <p style="
                                    margin: 0 0 18px;
                                    font-size: 15px;
                                ">
                                    Hello ${DEP},
                                </p>

                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                    Please reinform your PIC to resubmit the EMTS with proper infomation

                                   
                                </p>
                                                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                   

                                    reasons : ${reason}
                                </p>

                                <!-- Request Number -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background: #f8fafc;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 8px;
                                    ">
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <div style="
                                                font-size: 12px;
                                                color: #888;
                                                margin-bottom: 5px;
                                            ">
                                                Reference No.
                                            </div>

                                            <div style="
                                                font-size: 17px;
                                                font-weight: bold;
                                                color: #222;
                                            ">
                                                ${Mnumber}
                                            </div>

                                        </td>
                                    </tr>
                                </table>

                                        <p style="
                                            margin: 22px 0 0;
                                            font-size: 14px;
                                            line-height: 1.6;
                                            color: #666;
                                        ">
                                            Please 
                                            <a href="${url}"
                                            style="color: #007bff; text-decoration: none; font-weight: bold;">
                                                log in to the system
                                            </a>
                                            to review and approve this request.
                                        </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 18px 28px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                            ">
                                This is an automated notification. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};


const ImapsUpdated = ({ Mnumber,DEP }) => {

    return `
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 560px;
                            background: #02e227;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #eee;">
                                <h2 style="
                                    margin: 0;
                                    font-size: 20px;
                                    color: #222;
                                ">
                                    Request Currently Being Processed in IMAPS
                                </h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 28px;">

                                <p style="
                                    margin: 0 0 18px;
                                    font-size: 15px;
                                ">
                                    Hello ${DEP},
                                </p>

                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 15px;
                                    line-height: 1.6;
                                    color: #555;
                                ">
                                    Planning Has Approved Your Request
                                </p>

                                <!-- Request Number -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background: #f8fafc;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 8px;
                                    ">
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <div style="
                                                font-size: 12px;
                                                color: #888;
                                                margin-bottom: 5px;
                                            ">
                                                Reference No.
                                            </div>

                                            <div style="
                                                font-size: 17px;
                                                font-weight: bold;
                                                color: #222;
                                            ">
                                                ${Mnumber}
                                            </div>

                                        </td>
                                    </tr>
                                </table>

                                        <p style="
                                            margin: 22px 0 0;
                                            font-size: 14px;
                                            line-height: 1.6;
                                            color: #666;
                                        ">
                                            Please 
                                            <a href="${url}"
                                            style="color: #007bff; text-decoration: none; font-weight: bold;">
                                                log in to the system
                                            </a>
                                            to review and approve this request.
                                        </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 18px 28px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                            ">
                                This is an automated notification. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};

module.exports ={
    approvalEmail,
    planning,
    planningCancle,
    rejected,
    dateUpdated,
    rejectedPlanning,
    ImapsUpdated
} 